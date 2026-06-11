export default function SectionHeader({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={`${align === 'left' ? 'max-w-3xl' : 'mx-auto max-w-3xl text-center'} animate-fade-up`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>}
    </div>
  );
}
