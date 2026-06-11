import { Quote } from 'lucide-react';
import { testimonials } from '../data/siteData.js';
import SectionHeader from './SectionHeader.jsx';

export default function Testimonials() {
  return (
    <section id="resultados" className="section-pad bg-graphite" data-section-reveal>
      <div className="container-del">
        <SectionHeader
          eyebrow="Resultados"
          title="Alunos que treinam com plano, constância e acompanhamento"
          description="Depoimentos de exemplo, editáveis em um único arquivo de dados."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="card-premium animate-fade-up relative overflow-hidden p-6"
              data-reveal
              style={{ '--reveal-delay': `${index * 90}ms` }}
            >
              <span className="shimmer-line" />
              <Quote className="text-electric" size={28} />
              <p className="mt-5 min-h-32 text-sm font-normal leading-7 text-slate-300">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="mt-1 text-sm font-medium text-volt">{testimonial.goal}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
