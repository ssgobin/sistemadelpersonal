import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Save,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout.jsx';
import { db } from '../firebase/config.js';
import { sendAppointmentEmail } from '../utils/emailNotifications.js';
import { formatDate, formatDateTime, normalizeText } from '../utils/formatters.js';
import { serviceOptions } from '../utils/validators.js';

const statusOptions = ['pendente', 'confirmado', 'cancelado', 'concluido'];

const statusClasses = {
  pendente: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-red-100 text-red-800',
  concluido: 'bg-sky-100 text-sky-800',
};

const statusLabels = {
  pendente: 'pendente',
  confirmado: 'confirmado',
  cancelado: 'cancelado',
  concluido: 'concluído',
};

const presetTimeGroups = {
  morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  afternoon: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  evening: ['18:00', '19:00', '20:00', '21:00'],
};

const presetTimes = [...presetTimeGroups.morning, ...presetTimeGroups.afternoon, ...presetTimeGroups.evening];
const initialNewSlot = { date: '', times: [], customTime: '' };

function normalizeAvailability(slots = []) {
  return slots
    .map((slot) => ({
      date: slot.date,
      times: Array.from(new Set(slot.times || [])).sort(),
    }))
    .filter((slot) => slot.date && slot.times.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', status: '', service: '', name: '' });
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [newSlot, setNewSlot] = useState(initialNewSlot);
  const [expandedAvailabilityDates, setExpandedAvailabilityDates] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        setAppointments(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'availability'), (snapshot) => {
      setAvailabilitySlots(normalizeAvailability(snapshot.data()?.slots));
    });

    return unsubscribe;
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate = !filters.date || appointment.date === filters.date;
      const matchesStatus = !filters.status || appointment.status === filters.status;
      const matchesService = !filters.service || appointment.service === filters.service;
      const matchesName = !filters.name || normalizeText(appointment.name).includes(normalizeText(filters.name));
      return matchesDate && matchesStatus && matchesService && matchesName;
    });
  }, [appointments, filters]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: appointments.length,
      pendente: appointments.filter((item) => item.status === 'pendente').length,
      confirmado: appointments.filter((item) => item.status === 'confirmado').length,
      cancelado: appointments.filter((item) => item.status === 'cancelado').length,
      hoje: appointments.filter((item) => item.date === today).length,
    };
  }, [appointments]);

  async function updateStatus(appointment, status) {
    if (appointment.status === status) return;

    try {
      await updateDoc(doc(db, 'appointments', appointment.id), { status });

      if (['confirmado', 'cancelado'].includes(status)) {
        await sendAppointmentEmail({
          type: 'status',
          status,
          appointment: { ...appointment, status },
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Status atualizado',
        text: ['confirmado', 'cancelado'].includes(status)
          ? 'O cliente recebeu a notificação por e-mail.'
          : 'Agendamento atualizado com sucesso.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'warning',
        title: 'Status atualizado, mas o e-mail falhou',
        text: error.message || 'Verifique as variáveis SMTP e tente novamente.',
        confirmButtonColor: '#0f172a',
      });
    }
  }

  async function removeAppointment(appointment) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Excluir agendamento?',
      text: `Essa ação removerá o agendamento de ${appointment.name}.`,
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      background: '#ffffff',
      color: '#0f172a',
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, 'appointments', appointment.id));
      Swal.fire({
        icon: 'success',
        title: 'Agendamento excluído',
        timer: 1400,
        showConfirmButton: false,
      });
    }
  }

  function toggleDraftTime(time) {
    setNewSlot((current) => {
      const selected = current.times.includes(time);
      return {
        ...current,
        times: selected ? current.times.filter((item) => item !== time) : [...current.times, time].sort(),
      };
    });
  }

  function selectDraftGroup(times) {
    setNewSlot((current) => ({
      ...current,
      times: Array.from(new Set([...current.times, ...times])).sort(),
    }));
  }

  function clearDraftTimes() {
    setNewSlot((current) => ({ ...current, times: [] }));
  }

  function addCustomDraftTime() {
    if (!newSlot.customTime) return;
    setNewSlot((current) => ({
      ...current,
      customTime: '',
      times: Array.from(new Set([...current.times, current.customTime])).sort(),
    }));
  }

  function toggleAvailabilityDate(date) {
    setExpandedAvailabilityDates((current) =>
      current.includes(date) ? current.filter((item) => item !== date) : [...current, date],
    );
  }

  function addAvailabilitySlot() {
    if (!newSlot.date || newSlot.times.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Informe data e horários',
        text: 'Escolha uma data e selecione pelo menos um horário.',
        confirmButtonColor: '#0f172a',
      });
      return;
    }

    setAvailabilitySlots((current) => {
      const next = normalizeAvailability(current);
      const existingDate = next.find((slot) => slot.date === newSlot.date);

      if (existingDate) {
        existingDate.times = Array.from(new Set([...existingDate.times, ...newSlot.times])).sort();
        return normalizeAvailability(next);
      }

      return normalizeAvailability([...next, { date: newSlot.date, times: newSlot.times }]);
    });
    setExpandedAvailabilityDates((current) => (current.includes(newSlot.date) ? current : [...current, newSlot.date]));
    setNewSlot(initialNewSlot);
  }

  function removeAvailabilityTime(date, time) {
    setAvailabilitySlots((current) =>
      normalizeAvailability(
        current
          .map((slot) => (slot.date === date ? { ...slot, times: slot.times.filter((item) => item !== time) } : slot))
          .filter((slot) => slot.times.length > 0),
      ),
    );
  }

  async function saveAvailability() {
    setSavingAvailability(true);
    try {
      await setDoc(doc(db, 'settings', 'availability'), {
        slots: normalizeAvailability(availabilitySlots),
      });

      Swal.fire({
        icon: 'success',
        title: 'Disponibilidade salva',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Não foi possível salvar',
        text: 'Verifique sua conexão e tente novamente.',
        confirmButtonColor: '#0f172a',
      });
    } finally {
      setSavingAvailability(false);
    }
  }

  return (
    <AdminLayout>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric title="Total" value={metrics.total} icon={CalendarCheck} />
          <Metric title="Pendentes" value={metrics.pendente} icon={Clock3} />
          <Metric title="Confirmados" value={metrics.confirmado} icon={CheckCircle2} />
          <Metric title="Cancelados" value={metrics.cancelado} icon={XCircle} />
          <Metric title="Hoje" value={metrics.hoje} icon={CalendarCheck} />
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Disponibilidade de horários</h2>
              <p className="mt-1 text-sm text-slate-500">Configure as datas e horários que aparecem no formulário público.</p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={saveAvailability}
              disabled={savingAvailability}
            >
              {savingAvailability ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
              {savingAvailability ? 'Salvando...' : 'Salvar disponibilidade'}
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Data</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
                  type="date"
                  value={newSlot.date}
                  onChange={(event) => setNewSlot((current) => ({ ...current, date: event.target.value }))}
                />
              </label>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Selecione vários horários</span>
                  <div className="flex flex-wrap gap-2">
                    <QuickButton label="Manhã" onClick={() => selectDraftGroup(presetTimeGroups.morning)} />
                    <QuickButton label="Tarde" onClick={() => selectDraftGroup(presetTimeGroups.afternoon)} />
                    <QuickButton label="Noite" onClick={() => selectDraftGroup(presetTimeGroups.evening)} />
                    <QuickButton label="Limpar" onClick={clearDraftTimes} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                  {presetTimes.map((time) => {
                    const selected = newSlot.times.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-black transition ${
                          selected
                            ? 'border-slate-950 bg-slate-950 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                        onClick={() => toggleDraftTime(time)}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <label className="block">
                    <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Horário personalizado</span>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
                      type="time"
                      value={newSlot.customTime}
                      onChange={(event) => setNewSlot((current) => ({ ...current, customTime: event.target.value }))}
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-100"
                    onClick={addCustomDraftTime}
                  >
                    <Plus size={17} /> Incluir
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                    onClick={addAvailabilitySlot}
                  >
                    <Plus size={17} /> Adicionar {newSlot.times.length || ''}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {availabilitySlots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500">
                Nenhum horário configurado ainda.
              </div>
            ) : (
              availabilitySlots.map((slot) => {
                const expanded = expandedAvailabilityDates.includes(slot.date);
                const previewTimes = slot.times.slice(0, 5);

                return (
                  <div key={slot.date} className="rounded-lg border border-slate-200 bg-white">
                    <button
                      type="button"
                      className="flex w-full flex-col gap-3 p-4 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => toggleAvailabilityDate(slot.date)}
                    >
                      <div>
                        <p className="font-black text-slate-950">{formatDate(slot.date)}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previewTimes.map((time) => (
                            <span key={time} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                              {time}
                            </span>
                          ))}
                          {slot.times.length > previewTimes.length && (
                            <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-black text-white">
                              +{slot.times.length - previewTimes.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">
                          {slot.times.length} horário{slot.times.length === 1 ? '' : 's'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600">
                          {expanded ? 'Ocultar' : 'Ver horários'}
                          <ChevronDown className={`transition ${expanded ? 'rotate-180' : ''}`} size={16} />
                        </span>
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-slate-200 p-4">
                        <div className="flex flex-wrap gap-2">
                          {slot.times.map((time) => (
                            <button
                              key={time}
                              type="button"
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => removeAvailabilityTime(slot.date, time)}
                              title="Remover horário"
                            >
                              {time}
                              <XCircle size={14} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Agendamentos</h2>
              <p className="mt-1 text-sm text-slate-500">Filtre, confirme, cancele, conclua ou exclua solicitações.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Data</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
                  type="date"
                  value={filters.date}
                  onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Status</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="">Todos</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Serviço</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
                  value={filters.service}
                  onChange={(event) => setFilters((current) => ({ ...current, service: event.target.value }))}
                >
                  <option value="">Todos</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Cliente</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-950"
                    value={filters.name}
                    onChange={(event) => setFilters((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Buscar nome"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            {loading ? (
              <div className="grid min-h-72 place-items-center text-sm font-bold text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Carregando agendamentos...
                </span>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="grid min-h-72 place-items-center px-6 text-center">
                <div>
                  <p className="text-lg font-black text-slate-950">Nenhum agendamento encontrado</p>
                  <p className="mt-2 text-sm text-slate-500">Ajuste os filtros ou aguarde novas solicitações pelo site.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1180px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Contato</th>
                      <th className="px-4 py-3">Serviço</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Horário</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Criado em</th>
                      <th className="px-4 py-3">Observações</th>
                      <th className="px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <p className="font-black text-slate-950">{appointment.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">{appointment.phone}</p>
                          <p className="mt-1 text-xs text-slate-500">{appointment.email || '-'}</p>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{appointment.service}</td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(appointment.date)}</td>
                        <td className="px-4 py-4 font-bold text-slate-950">{appointment.time}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClasses[appointment.status] || statusClasses.pendente}`}>
                            {statusLabels[appointment.status] || appointment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{formatDateTime(appointment.createdAt)}</td>
                        <td className="max-w-xs px-4 py-4 text-slate-600">{appointment.notes || '-'}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <ActionButton
                              label="Confirmar"
                              onClick={() => updateStatus(appointment, 'confirmado')}
                              disabled={appointment.status === 'confirmado'}
                            />
                            <ActionButton
                              label="Cancelar"
                              onClick={() => updateStatus(appointment, 'cancelado')}
                              disabled={appointment.status === 'cancelado'}
                            />
                            <ActionButton
                              label="Concluir"
                              onClick={() => updateStatus(appointment, 'concluido')}
                              disabled={appointment.status === 'concluido'}
                            />
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              onClick={() => removeAppointment(appointment)}
                              aria-label="Excluir agendamento"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}

function Metric({ title, value, icon: Icon }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-volt">
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function ActionButton({ label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function QuickButton({ label, onClick }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-100"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
