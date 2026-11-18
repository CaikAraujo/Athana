import Image from 'next/image';
import type { ReactNode } from 'react';

/** Screenshot inside a browser window frame. */
export function BrowserFrame({ src, alt, priority, className = '', ratio = '16/10', sizes = '(min-width:1024px) 720px, 100vw' }: { src: string; alt: string; priority?: boolean; className?: string; ratio?: string; sizes?: string }) {
  return (
    <div className={`browser ${className}`}>
      <div className="browser-bar" aria-hidden><i /><i /><i /></div>
      <div className="relative bg-ink-800" style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={92} className="object-cover object-top" />
      </div>
    </div>
  );
}

/** Screenshot inside a phone frame. */
export function PhoneFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative w-[230px] shrink-0 rounded-[34px] border border-line-strong bg-fg p-2 shadow-[0_30px_60px_-28px_rgb(15_23_42/0.5)] ${className}`}>
      <div className="relative overflow-hidden rounded-[27px] bg-ink-850" style={{ aspectRatio: '390/800' }}>
        <Image src={src} alt={alt} fill sizes="230px" quality={92} className="object-cover object-top" />
      </div>
    </div>
  );
}

/** Hero composition: three template previews, the middle one in front. */
export function HeroShowcase({ items }: { items: { src: string; alt: string }[] }) {
  if (items.length < 3) return null;
  const [left, center, right] = items;
  return (
    <div className="relative mx-auto mt-14 max-w-5xl md:mt-16" aria-label={center.alt}>
      <div className="pointer-events-none absolute inset-x-10 -bottom-6 top-10 rounded-[40px] bg-accent-500/20 blur-3xl" aria-hidden />
      <div className="relative grid grid-cols-1 items-end md:grid-cols-[1fr_1.9fr_1fr]">
        <BrowserFrame src={left.src} alt={left.alt} sizes="300px" className="float-slower z-0 hidden origin-bottom-right md:block md:translate-x-10 md:-rotate-3 md:opacity-95" />
        <BrowserFrame src={center.src} alt={center.alt} priority className="float-slow z-10" />
        <BrowserFrame src={right.src} alt={right.alt} sizes="300px" className="float-slower z-0 hidden origin-bottom-left md:block md:-translate-x-10 md:rotate-3 md:opacity-95" />
      </div>
    </div>
  );
}

/** Text on the left, the product on the right. Always this way round. */
export function Split({ eyebrow, title, text, bullets, cta, visual }: { eyebrow?: string; title: string; text: string; bullets?: string[]; cta?: ReactNode; visual: ReactNode }) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-5 lg:pr-8">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h3>{title}</h3>
        <p className="mt-4 text-fg-soft">{text}</p>
        {bullets && (
          <ul className="mt-5 space-y-2 text-fg-soft">
            {bullets.map((b) => <li key={b} className="flex gap-3"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />{b}</li>)}
          </ul>
        )}
        {cta && <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">{cta}</div>}
      </div>
      <div className="zoom min-w-0 lg:col-span-7">{visual}</div>
    </div>
  );
}
