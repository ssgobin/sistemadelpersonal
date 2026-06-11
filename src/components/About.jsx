import { images, highlights } from '../data/siteData.js';
import SectionHeader from './SectionHeader.jsx';

export default function About() {
  return (
    <section id="sobre" className="section-pad bg-surface" data-section-reveal>
      <div className="container-del grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <img
          src={images.about}
          alt="Del conduzindo avaliação física personalizada"
          className="w-full rounded-[20px] border border-white/10 object-cover shadow-lift animate-fade-up"
          data-reveal
          loading="lazy"
        />
        <div className="animate-fade-up-delay-1" data-reveal style={{ '--reveal-delay': '100ms' }}>
          <SectionHeader
            align="left"
            eyebrow="Sobre o Del"
            title="Treino pensado para quem quer evoluir sem perder tempo"
            description="Del une planejamento de treino, avaliação física e acompanhamento próximo para transformar objetivo em rotina executável."
          />
          <p className="mt-6 text-base font-normal leading-8 text-slate-300">
            Cada aluno recebe orientação de acordo com histórico, disponibilidade, condicionamento e meta. O foco é
            construir um processo consistente: medir, treinar, ajustar e evoluir com segurança.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card-premium relative overflow-hidden p-5" data-reveal>
                  <span className="shimmer-line" />
                  <Icon className="text-electric" size={24} />
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-slate-400">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
