import { images } from '../data/siteData.js';
import SectionHeader from './SectionHeader.jsx';

export default function Gallery() {
  return (
    <section id="galeria" className="section-pad bg-surface" data-section-reveal>
      <div className="container-del">
        <SectionHeader
          eyebrow="Galeria"
          title="Ambiente, avaliação e rotina de treino"
          description="Substitua os placeholders por fotos reais em src/assets para deixar o site com a identidade do Del."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.gallery.map((image, index) => (
            <img
              key={image.alt}
              src={image.src}
              alt={image.alt}
              className="aspect-[4/5] w-full rounded-[20px] border border-white/10 object-cover shadow-lift animate-fade-up transition duration-300 hover:-translate-y-1 hover:border-volt/40"
              data-reveal
              style={{ '--reveal-delay': `${index * 80}ms` }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
