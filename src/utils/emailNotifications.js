import { auth } from '../firebase/config.js';

const endpoint = import.meta.env.VITE_EMAIL_FUNCTION_URL || '/.netlify/functions/send-appointment-email';

function isHtmlResponse(response) {
  return response.headers.get('content-type')?.includes('text/html');
}

export async function sendAppointmentEmail({ type, status, appointment, requireAuth = false }) {
  const headers = { 'Content-Type': 'application/json' };

  if (requireAuth) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Sessão administrativa expirada.');
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type, status, appointment }),
  });

  if (!response.ok) {
    if (response.status === 404 || isHtmlResponse(response)) {
      throw new Error(
        'Função de e-mail indisponível. Rode com "npm run dev" atualizado, via Netlify Dev, para habilitar /.netlify/functions.',
      );
    }

    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Não foi possível enviar a notificação por e-mail.');
  }

  return response.json();
}
