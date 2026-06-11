import { bioMetrics } from '../data/siteData.js';
import SectionHeader from './SectionHeader.jsx';

export default function Bioimpedance() {
  return (
    <section id="bioimpedancia" className="section-pad bg-graphite" data-section-reveal>
      <div className="container-del">
        <SectionHeader
          eyebrow="Bioimpedância"
          title="Dados corporais para orientar seu treino com precisão"
          description="A bioimpedância avalia a composição corporal de forma simples e ajuda a enxergar evolução que a balança comum não mostra."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {bioMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <article
                key={metric.title}
                className="card-premium animate-fade-up relative overflow-hidden p-5"
                data-reveal
                style={{ '--reveal-delay': `${index * 70}ms` }}
              >
                <span className="shimmer-line" />
                <div className="grid h-11 w-11 place-items-center rounded-full bg-electric/12 text-electric">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{metric.title}</h3>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-400">{metric.text}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <a href="#agendamento" className="btn-primary">
            Agendar consulta de bioimpedância
          </a>
        </div>
      </div>
    </section>
  );
}
