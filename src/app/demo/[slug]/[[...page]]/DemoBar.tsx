'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const COPY = {
  fr: { demo: 'Démonstration ATHANA', note: 'contenu fictif', buy: 'Acheter ce modèle', all: 'Tous les modèles' },
  pt: { demo: 'Demonstração ATHANA', note: 'conteúdo fictício', buy: 'Comprar este modelo', all: 'Todos os modelos' },
};

function Bar({ slug, name, language }: { slug: string; name: string; language: 'fr' | 'pt' }) {
  // Hidden when the demo is embedded in the product page (?embed=1).
  if (useSearchParams().get('embed')) return null;
  const c = COPY[language];
  return (
    <div style={{ background: '#0b1220', color: '#f5f5f4', fontFamily: 'var(--font-sans)' }} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-[13px]">
      <span><strong style={{ color: '#67e8f9', letterSpacing: '.08em' }}>{c.demo}</strong> · {name} <span style={{ opacity: 0.6 }}>— {c.note}</span></span>
      <span className="flex gap-4">
        <a href="/templates" style={{ color: '#c9c9c6' }} className="underline-offset-2 hover:underline">{c.all}</a>
        <a href={`/templates/${slug}`} style={{ color: '#67e8f9', fontWeight: 600 }} className="underline-offset-2 hover:underline">{c.buy} →</a>
      </span>
    </div>
  );
}

export function DemoBar(props: { slug: string; name: string; language: 'fr' | 'pt' }) {
  return <Suspense fallback={null}><Bar {...props} /></Suspense>;
}
