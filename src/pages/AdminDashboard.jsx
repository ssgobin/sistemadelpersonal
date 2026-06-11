import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
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

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', status: '', service: '', name: '' });

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
    try {
      await updateDoc(doc(db, 'appointments', appointment.id), { status });

      if (['confirmado', 'cancelado'].includes(status)) {
        await sendAppointmentEmail({
          type: 'status',
          status,
          appointment: { ...appointment, status },
          requireAuth: true,
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
        title: 'Agendamento excluido',
        timer: 1400,
        showConfirmButton: false,
      });
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
                            <ActionButton label="Confirmar" onClick={() => updateStatus(appointment, 'confirmado')} />
                            <ActionButton label="Cancelar" onClick={() => updateStatus(appointment, 'cancelado')} />
                            <ActionButton label="Concluir" onClick={() => updateStatus(appointment, 'concluido')} />
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

function ActionButton({ label, onClick }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-100"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
