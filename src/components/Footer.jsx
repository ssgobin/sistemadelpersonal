import { Instagram, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030507] py-10">
      <div className="container-del flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-black text-white">Del Personal Trainer</p>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Treinos personalizados, avaliação física e bioimpedância para evoluir com segurança e estratégia.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <a className="btn-secondary px-4 py-2" href="tel:+5500000000000">
            <Phone size={16} /> WhatsApp
          </a>
          <a className="btn-secondary px-4 py-2" href="mailto:contato@delpersonal.com">
            <Mail size={16} /> E-mail
          </a>
          <a className="btn-secondary px-4 py-2" href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram size={16} /> Instagram
          </a>
          <Link className="text-slate-500 hover:text-electric" to="/admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
