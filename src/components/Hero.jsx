import { ArrowDown, CalendarCheck, ShieldCheck } from 'lucide-react';
import { images, stats, trustBadges } from '../data/siteData.js';

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-28" data-section-reveal>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_18%,rgba(21,212,255,0.18),transparent_32%),linear-gradient(135deg,#05070a_0%,#0b1118_58%,#08120d_100%)]" />
      <div className="container-del grid min-h-[720px] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="animate-fade-up" data-reveal>
          <p className="eyebrow">Personal trainer em alta performance</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-[56px]">
            Transforme seu corpo com acompanhamento profissional
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-slate-300">
            Treinos personalizados, avaliação física completa e consulta de bioimpedância para você evoluir com
            estratégia, segurança e consistência.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#agendamento" className="btn-primary">
              <CalendarCheck size={19} /> Agendar avaliação
            </a>
            <a href="#sobre" className="btn-secondary">
              <ArrowDown size={19} /> Conhecer o trabalho
            </a>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-3"
                >
                  <Icon className="text-volt" size={20} />
                  <span className="text-sm font-medium text-slate-200">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative animate-fade-up-delay-2" data-reveal style={{ '--reveal-delay': '120ms' }}>
          <img
            src={images.hero}
            alt="Personal trainer Del em ambiente fitness"
            className="aspect-[4/5] w-full rounded-[20px] border border-white/10 object-cover shadow-glow animate-float-soft"
            loading="eager"
          />
          <div className="absolute bottom-5 left-5 right-5 rounded-[20px] border border-white/10 bg-graphite/84 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-volt" />
              <p className="text-sm font-medium text-white">Acompanhamento com dados, técnica e metas claras.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-del -mt-8 pb-12">
        <div
          className="grid gap-3 rounded-[20px] border border-white/10 bg-white/[0.045] p-3 backdrop-blur sm:grid-cols-4 animate-glow-pulse"
          data-reveal
        >
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 text-center">
              <p className="text-3xl font-semibold text-volt">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
