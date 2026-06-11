import { services } from '../data/siteData.js';
import SectionHeader from './SectionHeader.jsx';

export default function Services() {
  return (
    <section id="servicos" className="section-pad bg-surface" data-section-reveal>
      <div className="container-del">
        <SectionHeader
          eyebrow="Serviços"
          title="Soluções para cada fase da sua evolução"
          description="Escolha o serviço ideal para iniciar, ajustar ou intensificar seu acompanhamento fitness."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="card-premium animate-fade-up relative flex min-h-60 flex-col overflow-hidden p-6"
                data-reveal
                style={{ '--reveal-delay': `${index * 80}ms` }}
              >
                <span className="shimmer-line" />
                <div className="grid h-12 w-12 place-items-center rounded-full bg-volt text-graphite">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{service.title}</h3>
                <p className="mt-3 flex-1 text-sm font-normal leading-6 text-slate-400">{service.description}</p>
                <a href="#agendamento" className="mt-6 text-sm font-semibold text-volt hover:text-white">
                  Agendar agora
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
