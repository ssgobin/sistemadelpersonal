import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

const smtpUser = process.env.HOSTINGER_SMTP_USER || 'contato@trebintech.com';
const smtpHost = process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
const smtpPort = Number(process.env.HOSTINGER_SMTP_PORT || 465);
const fromName = process.env.MAIL_FROM_NAME || 'Del Personal Trainer';

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) return null;

  const credentials = JSON.parse(rawServiceAccount);
  return admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
}

function createTransporter() {
  if (!process.env.HOSTINGER_SMTP_PASS) {
    throw new Error('HOSTINGER_SMTP_PASS não configurada.');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: process.env.HOSTINGER_SMTP_PASS,
    },
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function appointmentRows(appointment) {
  const fields = [
    ['Nome completo', appointment.name],
    ['Telefone/WhatsApp', appointment.phone],
    ['E-mail', appointment.email],
    ['Tipo de serviço', appointment.service],
    ['Data desejada', appointment.date],
    ['Horário desejado', appointment.time],
    ['Observações', appointment.notes],
  ];

  return fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;color:#64748b;border-bottom:1px solid #e2e8f0;font-weight:700">${label}</td>
          <td style="padding:10px 12px;color:#0f172a;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join('');
}

function buildEmail({ type, status, appointment }) {
  const statusCopy = {
    confirmado: {
      title: 'Seu agendamento foi confirmado',
      intro: 'Ótima notícia: Del confirmou seu agendamento. Confira os dados abaixo.',
    },
    cancelado: {
      title: 'Seu agendamento foi cancelado',
      intro: 'Seu agendamento foi cancelado. Confira os dados abaixo e fale com Del para remarcar, se desejar.',
    },
  };

  const scheduled = {
    title: 'Agendamento recebido',
    intro: 'Recebemos sua solicitação de agendamento. Del irá analisar e confirmar o horário em breve.',
  };

  const content = type === 'status' ? statusCopy[status] : scheduled;
  const subject = `Del Personal Trainer | ${content.title}`;

  return {
    subject,
    html: `
      <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:640px;margin:0 auto;padding:32px 16px">
          <div style="background:#05070a;border-radius:14px;padding:26px;color:#ffffff">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9cff2e;font-weight:800">
              Del Personal Trainer
            </p>
            <h1 style="margin:0;font-size:26px;line-height:1.2">${content.title}</h1>
            <p style="margin:14px 0 0;color:#cbd5e1;line-height:1.6">${content.intro}</p>
          </div>

          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;margin-top:18px;overflow:hidden">
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <tbody>${appointmentRows(appointment)}</tbody>
            </table>
          </div>

          <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6">
            Esta é uma mensagem automática. Em caso de dúvidas, responda este e-mail ou entre em contato pelo WhatsApp informado.
          </p>
        </div>
      </div>
    `,
  };
}

function validateAppointmentPayload(appointment) {
  const requiredFields = ['name', 'phone', 'email', 'service', 'date', 'time', 'notes'];
  return requiredFields.filter((field) => !String(appointment?.[field] || '').trim());
}

function publicErrorMessage(error) {
  const code = error?.code || error?.responseCode;
  const message = String(error?.message || '').toLowerCase();

  if (code === 'EAUTH' || message.includes('auth')) {
    return 'Falha de autenticação no SMTP da Hostinger. Verifique HOSTINGER_SMTP_USER e HOSTINGER_SMTP_PASS.';
  }

  if (code === 'ECONNECTION' || code === 'ETIMEDOUT' || code === 'ESOCKET') {
    return 'Não foi possível conectar ao SMTP da Hostinger. Verifique host, porta e bloqueios de rede.';
  }

  if (code === 'EENVELOPE') {
    return 'Endereço de e-mail inválido ou recusado pelo servidor SMTP.';
  }

  return 'Falha ao enviar e-mail pelo SMTP.';
}

async function requireAdmin(event) {
  const authorization = event.headers.authorization || event.headers.Authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return { ok: false, statusCode: 401, message: 'Token administrativo ausente.' };
  }

  const app = initializeAdmin();
  if (!app) {
    return { ok: false, statusCode: 500, message: 'FIREBASE_SERVICE_ACCOUNT_JSON não configurado.' };
  }

  await admin.auth().verifyIdToken(token);
  return { ok: true };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido.' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { type, status, appointment } = payload;

    const missingFields = validateAppointmentPayload(appointment);
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}.` }),
      };
    }

    if (type === 'status') {
      const adminCheck = await requireAdmin(event);
      if (!adminCheck.ok) {
        return { statusCode: adminCheck.statusCode, body: JSON.stringify({ error: adminCheck.message }) };
      }
      if (!['confirmado', 'cancelado'].includes(status)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Status sem notificação por e-mail.' }) };
      }
    }

    const transporter = createTransporter();
    const email = buildEmail({ type, status, appointment });

    await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: appointment.email,
      replyTo: smtpUser,
      subject: email.subject,
      html: email.html,
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: publicErrorMessage(error) }) };
  }
}
