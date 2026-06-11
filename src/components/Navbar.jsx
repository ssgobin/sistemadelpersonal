import { Activity, CalendarCheck, Dumbbell, HeartPulse, Menu, Star, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#sobre', label: 'Sobre', icon: Star },
  { href: '#bioimpedancia', label: 'Bioimpedância', icon: Activity },
  { href: '#servicos', label: 'Serviços', icon: Dumbbell },
  { href: '#resultados', label: 'Resultados', icon: HeartPulse },
  { href: '#agendamento', label: 'Agendar', icon: CalendarCheck },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-graphite/82 backdrop-blur-xl">
      <nav className="container-del flex h-20 items-center justify-between">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Ir para o início">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-volt text-lg font-bold text-graphite">
            D
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold text-white">Del</span>
            <span className="block text-xs font-medium text-slate-400">Personal Trainer</span>
          </span>
        </a>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.22)] lg:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-volt"
              >
                <Icon size={16} />
                {link.label}
              </a>
            );
          })}
          <a href="#agendamento" className="btn-primary min-h-10 px-5 py-2 text-sm">
            Agendar avaliação
          </a>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-graphite px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  <Icon size={16} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
