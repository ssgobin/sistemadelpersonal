import { signOut } from 'firebase/auth';
import { Dumbbell, LogOut } from 'lucide-react';
import { auth } from '../firebase/config.js';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-graphite text-volt">
            <Dumbbell size={22} />
          </span>
          <div>
            <p className="font-black">Del Admin</p>
            <p className="text-xs font-semibold text-slate-500">Agendamentos</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          <a className="block rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white" href="/admin/dashboard">
            Dashboard
          </a>
          <a className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100" href="/">
            Site público
          </a>
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Administrativo</p>
              <h1 className="text-xl font-black text-slate-950">Dashboard de agendamentos</h1>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => signOut(auth)}
            >
              <LogOut size={17} /> Sair
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
