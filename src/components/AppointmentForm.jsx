import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { CalendarDays, Check, Clock3, Loader2, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { db } from '../firebase/config.js';
import { sendAppointmentEmail } from '../utils/emailNotifications.js';
import { formatDate } from '../utils/formatters.js';
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

const fallbackSlots = [
  { date: getDateOffset(1), times: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  { date: getDateOffset(2), times: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
  { date: getDateOffset(3), times: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
];

function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function isFutureSlot(date, time) {
  return new Date(`${date}T${time}:00`) > new Date();
}

function normalizeSlots(slots = []) {
  return slots
    .map((slot) => ({
      date: slot.date,
      times: Array.from(new Set(slot.times || [])).sort(),
    }))
    .filter((slot) => slot.date && slot.times.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function AppointmentForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [configuredSlots, setConfiguredSlots] = useState(fallbackSlots);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'availability'), (snapshot) => {
      const slots = normalizeSlots(snapshot.data()?.slots);
      setConfiguredSlots(slots.length > 0 ? slots : fallbackSlots);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      setAppointments(snapshot.docs.map((document) => document.data()));
    });

    return unsubscribe;
  }, []);

  const reservedSlots = useMemo(() => {
    return new Set(
      appointments
        .filter((appointment) => ['pendente', 'confirmado'].includes(appointment.status))
        .map((appointment) => `${appointment.date}|${appointment.time}`),
    );
  }, [appointments]);

  const availableSlots = useMemo(() => {
    return normalizeSlots(configuredSlots)
      .map((slot) => ({
        date: slot.date,
        times: slot.times.filter((time) => isFutureSlot(slot.date, time) && !reservedSlots.has(`${slot.date}|${time}`)),
      }))
      .filter((slot) => slot.times.length > 0);
  }, [configuredSlots, reservedSlots]);

  const selectedSlotLabel = form.date && form.time ? `${formatDate(form.date)} às ${form.time}` : 'Escolher data e horário';

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function selectSlot(date, time) {
    setForm((current) => ({ ...current, date, time }));
    setErrors((current) => ({ ...current, date: undefined, time: undefined }));
    setSlotModalOpen(false);
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
        text: 'Del recebeu sua solicitação. Em breve o horário será confirmado pelo e-mail.',
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
            <div className="sm:col-span-2">
              <Field label="Data e horário" error={errors.date || errors.time}>
                <button
                  type="button"
                  className="input-del flex min-h-14 w-full items-center justify-between gap-3 text-left"
                  onClick={() => setSlotModalOpen(true)}
                >
                  <span className={form.date && form.time ? 'font-bold text-white' : 'text-slate-400'}>{selectedSlotLabel}</span>
                  <CalendarDays className="shrink-0 text-volt" size={20} />
                </button>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Observações" error={errors.notes}>
                <textarea className="input-del min-h-32 resize-y py-4" name="notes" value={form.notes} onChange={handleChange} />
              </Field>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-7 w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? 'Enviando...' : 'Solicitar agendamento'}
          </button>
        </form>
      </div>

      {slotModalOpen && (
        <SlotModal
          slots={availableSlots}
          selectedDate={form.date}
          selectedTime={form.time}
          onClose={() => setSlotModalOpen(false)}
          onSelect={selectSlot}
        />
      )}
    </section>
  );
}

function SlotModal({ slots, selectedDate, selectedTime, onClose, onSelect }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#101820] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-volt">Horários disponíveis</p>
            <h3 className="mt-2 text-2xl font-black text-white">Escolha seu agendamento</h3>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10"
            onClick={onClose}
            aria-label="Fechar seleção de horário"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-5 sm:p-6">
          {slots.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
              <Clock3 className="mx-auto text-volt" size={28} />
              <p className="mt-3 font-black text-white">Nenhum horário disponível no momento</p>
              <p className="mt-2 text-sm text-slate-400">Novas datas podem ser liberadas pela equipe administrativa.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {slots.map((slot) => (
                <section key={slot.date} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-black text-white">{formatDate(slot.date)}</h4>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {slot.times.length} horário{slot.times.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {slot.times.map((time) => {
                      const selected = selectedDate === slot.date && selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition ${
                            selected
                              ? 'border-volt bg-volt text-slate-950'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-volt/70 hover:bg-volt/10'
                          }`}
                          onClick={() => onSelect(slot.date, time)}
                        >
                          {selected ? <Check size={16} /> : <Clock3 size={16} />}
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
