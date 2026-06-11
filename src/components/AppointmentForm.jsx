import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { CalendarDays, Loader2, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { db } from '../firebase/config.js';
import { sendAppointmentEmail } from '../utils/emailNotifications.js';
import { sanitizeText, serviceOptions, validateAppointment } from '../utils/validators.js';
import SectionHeader from './SectionHeader.jsx';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  service: 'Bioimpedância',
  date: '',
  time: '',
  notes: '',
};

export default function AppointmentForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function hasDuplicateSlot() {
    const appointmentQuery = query(
      collection(db, 'appointments'),
      where('date', '==', form.date),
      where('time', '==', form.time),
      where('status', 'in', ['pendente', 'confirmado']),
    );
    const snapshot = await getDocs(appointmentQuery);
    return !snapshot.empty;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateAppointment(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (await hasDuplicateSlot()) {
        setErrors({ time: 'Esse horário já está reservado. Escolha outro horário.' });
        return;
      }

      const appointment = {
        name: sanitizeText(form.name),
        phone: sanitizeText(form.phone),
        email: sanitizeText(form.email).toLowerCase(),
        service: form.service,
        date: form.date,
        time: form.time,
        notes: sanitizeText(form.notes),
        status: 'pendente',
      };

      await addDoc(collection(db, 'appointments'), {
        ...appointment,
        createdAt: serverTimestamp(),
      });

      await sendAppointmentEmail({ type: 'scheduled', appointment });

      await Swal.fire({
        icon: 'success',
        title: 'Agendamento recebido',
        text: 'Del recebeu sua solicitação. Em breve o horário será confirmado pelo WhatsApp.',
        confirmButtonColor: '#9cff2e',
        background: '#0d1218',
        color: '#f8fafc',
      });

      setForm(initialForm);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Não foi possível agendar',
        text: 'Verifique sua conexão e tente novamente em alguns instantes.',
        confirmButtonColor: '#15d4ff',
        background: '#0d1218',
        color: '#f8fafc',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="agendamento" className="section-pad bg-graphite" data-section-reveal>
      <div className="container-del grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="animate-fade-up" data-reveal>
          <SectionHeader
            align="left"
            eyebrow="Agendamento"
            title="Reserve sua avaliação ou consulta"
            description="Preencha os dados e escolha um horário disponível. O agendamento entra como pendente até a confirmação administrativa."
          />
          <div className="mt-8 rounded-lg border border-volt/25 bg-volt/10 p-5">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 text-volt" size={22} />
              <p className="text-sm leading-6 text-slate-300">
                Para evitar conflitos, o sistema bloqueia horários pendentes ou confirmados na mesma data.
              </p>
            </div>
          </div>
        </div>

        <form
          className="card-premium animate-fade-up-delay-1 relative overflow-hidden p-5 sm:p-6"
          onSubmit={handleSubmit}
          noValidate
          data-reveal
          style={{ '--reveal-delay': '120ms' }}
        >
          <span className="shimmer-line" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome completo" error={errors.name}>
              <input className="input-del" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
            </Field>
            <Field label="Telefone/WhatsApp" error={errors.phone}>
              <input className="input-del" name="phone" value={form.phone} onChange={handleChange} placeholder="(11) 99999-9999" required />
            </Field>
            <Field label="E-mail" error={errors.email}>
              <input className="input-del" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </Field>
            <Field label="Tipo de serviço" error={errors.service}>
              <select className="input-del" name="service" value={form.service} onChange={handleChange} required>
                {serviceOptions.map((service) => (
                  <option key={service} value={service} className="bg-surface">
                    {service}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Data desejada" error={errors.date}>
              <input className="input-del" name="date" type="date" min={minDate} value={form.date} onChange={handleChange} required />
            </Field>
            <Field label="Horário desejado" error={errors.time}>
              <input className="input-del" name="time" type="time" value={form.time} onChange={handleChange} required />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Observações" error={errors.notes}>
                <textarea
                  className="input-del min-h-32 resize-y py-4"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-7 w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? 'Enviando...' : 'Solicitar agendamento'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-200">{label}</span>
      {children}
      {error && <span className="mt-2 block text-xs font-semibold text-red-300">{error}</span>}
    </label>
  );
}
