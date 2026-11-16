import Link from 'next/link';
import { ArrowUpRight, Asterisk } from 'lucide-react';
import type { DemoMeta } from '../types';
import { Artwork, type ArtId } from './art';
import { ContactForm, Header, Projects } from './ui';

export const meta: DemoMeta = {
  slug: 'portfolio-lena',
  name: 'Lena Moreau',
  language: 'pt',
  pages: [
    { key: '', label: 'Início' },
    { key: 'projetos', label: 'Projetos' },
    { key: 'sobre', label: 'Sobre' },
    { key: 'contacto', label: 'Contacto' },
  ],
};

const BASE = '/demo/portfolio-lena';
const wrap = 'mx-auto max-w-7xl px-4 sm:px-8';
const tag = 'font-display text-xs font-bold uppercase tracking-[0.2em]';
const giant = 'font-display font-bold uppercase leading-[0.85] tracking-tighter';

function Marquee({ words }: { words: string[] }) {
  const row = (hidden: boolean) => (
    <span className="lm-marquee flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {words.map((w) => (
        <span key={w} className="flex items-center gap-6 px-3 font-display text-2xl font-bold uppercase tracking-tight sm:text-4xl">
          {w} <Asterisk className="h-7 w-7" aria-hidden="true" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="flex overflow-hidden bg-[#d7ff3e] py-4 text-[#0d0d0d]">
      {row(false)}
      {row(true)}
    </div>
  );
}

const FEATURED: { id: ArtId; title: string; cat: string; year: string }[] = [
  { id: 'mare', title: 'Maré Alta', cat: 'Identidade', year: '2026' },
  { id: 'linha', title: 'Linha 28', cat: 'Fotografia', year: '2024' },
  { id: 'folego', title: 'Revista Fôlego', cat: 'Editorial', year: '2025' },
  { id: 'obvio', title: 'Óbvio Studio', cat: 'Digital', year: '2026' },
];

function ContactBand() {
  return (
    <section className={`${wrap} py-20 sm:py-28`}>
      <p className={`${tag} text-[#d7ff3e]`}>Próximo projeto</p>
      <Link href={`${BASE}/contacto`} className={`${giant} group mt-4 block text-[15vw] hover:text-[#d7ff3e] lg:text-[11rem]`}>
        Vamos <span className="lm-outline">falar</span>
        <ArrowUpRight className="ml-2 inline h-[0.7em] w-[0.7em] transition-transform group-hover:rotate-45" aria-hidden="true" />
      </Link>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className={`${wrap} pb-12 pt-10 sm:pt-16`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`${tag} flex items-center gap-2`}><span className="h-2.5 w-2.5 rounded-full bg-[#d7ff3e]" aria-hidden="true" /> Disponível para novos projetos</p>
          <p className={`${tag} text-[#f2efe8]/70`}>Lisboa, Portugal</p>
        </div>
        <h1 className={`${giant} mt-8 text-[17vw] lg:text-[13.5rem]`}>
          Design <span className="lm-outline">&amp;</span>
          <br />
          <span className="text-[#d7ff3e]">Fotografia</span>
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
          <p className="max-w-md text-xl leading-snug text-[#f2efe8]/90">Sou a Lena Moreau, designer e fotógrafa independente. Crio identidades, publicações e imagens para marcas com algo a dizer.</p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href={`${BASE}/projetos`} className="inline-flex items-center gap-2 rounded-full bg-[#f2efe8] px-7 py-4 font-display font-bold uppercase tracking-wider text-[#0d0d0d] transition-colors hover:bg-[#d7ff3e]">Ver projetos <ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
            <Link href={`${BASE}/sobre`} className="rounded-full border-2 border-[#f2efe8]/50 px-7 py-4 font-display font-bold uppercase tracking-wider transition-colors hover:border-[#d7ff3e] hover:text-[#d7ff3e]">Sobre mim</Link>
          </div>
        </div>
      </section>

      <Marquee words={['Identidade', 'Editorial', 'Fotografia', 'Direção de arte', 'Digital']} />

      <section className={`${wrap} py-16 sm:py-24`}>
        <div className="flex items-end justify-between gap-4 border-b border-[#f2efe8]/25 pb-4">
          <h2 className={`${giant} text-5xl sm:text-7xl`}>Trabalho recente</h2>
          <Link href={`${BASE}/projetos`} className={`${tag} shrink-0 text-[#d7ff3e] hover:underline`}>Todos (7)</Link>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-12">
          {FEATURED.map((p, i) => (
            <li key={p.id} className={['md:col-span-7', 'md:col-span-5 md:mt-24', 'md:col-span-5', 'md:col-span-7 md:mt-16'][i]}>
              <Link href={`${BASE}/projetos`} className="group block">
                <span className="block overflow-hidden">
                  <Artwork id={p.id} className={`w-full transition-transform duration-700 group-hover:scale-105 ${i % 3 === 0 ? 'aspect-[4/3]' : 'aspect-[4/5]'}`} />
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="font-display text-3xl font-bold uppercase tracking-tight group-hover:text-[#d7ff3e]">{p.title}</span>
                  <span className="text-xs uppercase tracking-wider text-[#f2efe8]/70">{p.cat} — {p.year}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-[#f2efe8] text-[#0d0d0d]">
        <div className={`${wrap} py-16 sm:py-24`}>
          <p className={tag}>O que faço</p>
          <ul className="mt-6">
            {[
              ['Identidade visual', 'Logótipos, sistemas gráficos e manuais de normas para marcas que estão a começar ou a mudar de pele.'],
              ['Design editorial', 'Revistas, livros e relatórios pensados como objetos, da grelha ao acabamento.'],
              ['Fotografia', 'Reportagem, retrato e produto, com luz natural sempre que possível.'],
              ['Design digital', 'Websites e interfaces claros, desenhados primeiro para o telemóvel.'],
            ].map(([t, d], i) => (
              <li key={t} className="grid gap-2 border-t-2 border-[#0d0d0d] py-6 md:grid-cols-[80px_1fr_1fr] md:items-baseline">
                <span className="font-display text-sm font-bold">0{i + 1}</span>
                <h3 className="font-display text-4xl font-bold uppercase tracking-tighter sm:text-5xl">{t}</h3>
                <p className="text-lg text-[#2b2b2b]">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ContactBand />
    </>
  );
}

function SobrePage() {
  return (
    <>
      <section className={`${wrap} grid gap-10 py-12 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end`}>
        <div>
          <p className={`${tag} text-[#d7ff3e]`}>Sobre</p>
          <h1 className={`${giant} mt-4 text-[15vw] lg:text-[10rem]`}>Olá, sou a <span className="lm-outline">Lena</span></h1>
        </div>
        <div className="relative mx-auto w-full max-w-xs">
          <svg viewBox="0 0 300 360" className="w-full" aria-hidden="true" focusable="false">
            <rect width="300" height="360" fill="#7c5cff" />
            <circle cx="150" cy="400" r="150" fill="#0d0d0d" />
            <circle cx="150" cy="150" r="72" fill="#f2c9a8" />
            <path d="M74 150 Q70 60 150 62 Q236 60 226 160 Q210 96 150 100 Q96 96 74 150 Z" fill="#0d0d0d" />
            <circle cx="124" cy="152" r="20" fill="none" stroke="#0d0d0d" strokeWidth="5" />
            <circle cx="176" cy="152" r="20" fill="none" stroke="#0d0d0d" strokeWidth="5" />
            <path d="M144 152 H156 M134 190 Q150 202 166 190" stroke="#0d0d0d" strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect x="200" y="250" width="70" height="50" rx="6" fill="#d7ff3e" />
            <circle cx="235" cy="275" r="15" fill="#0d0d0d" />
          </svg>
          <span className={`${tag} absolute -bottom-3 -left-3 rotate-[-4deg] bg-[#d7ff3e] px-3 py-1.5 text-[#0d0d0d]`}>Autorretrato, versão vetorial</span>
        </div>
      </section>
      <section className={`${wrap} grid gap-10 border-t border-[#f2efe8]/25 py-14 md:grid-cols-[1fr_2fr]`}>
        <h2 className={tag}>Percurso</h2>
        <div className="space-y-6 text-2xl leading-snug sm:text-3xl">
          <p>Trabalho entre o design gráfico e a fotografia, porque as boas ideias raramente cabem numa só disciplina.</p>
          <p className="text-[#f2efe8]/75">Estudei design de comunicação, passei por ateliers pequenos e redações de revistas, e hoje trabalho por conta própria a partir de um estúdio partilhado em Lisboa. Gosto de projetos em que posso acompanhar tudo, do primeiro esboço à prova de impressão.</p>
        </div>
      </section>
      <section className="bg-[#7c5cff] text-[#0d0d0d]">
        <div className={`${wrap} py-16`}>
          <h2 className={`${giant} text-5xl sm:text-7xl`}>Como trabalho</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              ['Conversa', 'Começo por ouvir: o contexto, o público e aquilo que não pode falhar.'],
              ['Conceito', 'Apresento uma direção clara, com referências e primeiros esboços.'],
              ['Desenho', 'Desenvolvo o sistema, testo em formatos reais e afino contigo.'],
              ['Entrega', 'Ficheiros organizados, regras simples e apoio no arranque.'],
            ].map(([t, d], i) => (
              <li key={t} className="border-t-4 border-[#0d0d0d] pt-4">
                <span className="font-display text-6xl font-bold leading-none">{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight">{t}</h3>
                <p className="mt-2 text-[#0d0d0d]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${wrap} grid gap-10 py-16 md:grid-cols-2`}>
        <div>
          <h2 className={`${tag} text-[#d7ff3e]`}>Ferramentas &amp; materiais</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {['Tipografia', 'Grelhas', 'Risografia', 'Serigrafia', 'Fotografia analógica', 'Luz natural', 'Prototipagem', 'Motion'].map((s) => (
              <li key={s} className="rounded-full border border-[#f2efe8]/40 px-4 py-2 text-sm uppercase tracking-wider">{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={`${tag} text-[#d7ff3e]`}>Princípios</h2>
          <ul className="mt-5 divide-y divide-[#f2efe8]/25 border-y border-[#f2efe8]/25 text-lg">
            {['Menos elementos, mais intenção.', 'O conteúdo manda na forma.', 'Prazos e orçamentos ditos com clareza.', 'Um projeto de cada vez, sempre que possível.'].map((p) => <li key={p} className="py-3">{p}</li>)}
          </ul>
        </div>
      </section>
      <ContactBand />
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const current = meta.pages.some((p) => p.key === page) ? page : '';
  return (
    <div className="lm-root min-h-screen overflow-x-hidden bg-[#0d0d0d] font-sans text-[#f2efe8]">
      <style>{`.lm-root :focus-visible{outline:3px solid #d7ff3e;outline-offset:3px;border-radius:2px}.lm-root .bg-\\[\\#f2efe8\\] :focus-visible,.lm-root .bg-\\[\\#d7ff3e\\] :focus-visible,.lm-root .bg-\\[\\#7c5cff\\] :focus-visible{outline-color:#0d0d0d}.lm-root ::selection{background:#d7ff3e;color:#0d0d0d}.lm-root .lm-outline{color:transparent;-webkit-text-stroke:2px currentColor;-webkit-text-stroke-color:#f2efe8}.lm-root a:hover .lm-outline{-webkit-text-stroke-color:#d7ff3e}@keyframes lm-scroll{to{transform:translateX(-100%)}}.lm-root .lm-marquee{animation:lm-scroll 28s linear infinite}@media (prefers-reduced-motion:reduce){.lm-root .lm-marquee{animation:none}}`}</style>
      <a href="#lm-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-[#d7ff3e] focus:px-3 focus:py-2 focus:text-[#0d0d0d]">Saltar para o conteúdo</a>
      <Header pages={meta.pages} current={current} />
      <main id="lm-main">
        {current === 'projetos' ? (
          <>
            <section className={`${wrap} pb-8 pt-10 sm:pt-16`}>
              <p className={`${tag} text-[#d7ff3e]`}>Projetos selecionados · 2023 — 2026</p>
              <h1 className={`${giant} mt-4 text-[17vw] lg:text-[13rem]`}>Proje<span className="lm-outline">tos</span></h1>
              <p className="mt-6 max-w-xl text-xl text-[#f2efe8]/85">Sete trabalhos de identidade, edição, fotografia e digital. Escolhe um projeto para abrir o estudo de caso.</p>
            </section>
            <section className={`${wrap} pb-20`}><Projects /></section>
            <ContactBand />
          </>
        ) : current === 'sobre' ? (
          <SobrePage />
        ) : current === 'contacto' ? (
          <section className={`${wrap} grid gap-12 py-12 sm:py-20 lg:grid-cols-[1fr_1.2fr]`}>
            <div>
              <p className={`${tag} text-[#d7ff3e]`}>Contacto</p>
              <h1 className={`${giant} mt-4 text-[16vw] lg:text-[8.5rem]`}>Diz <span className="lm-outline">olá</span></h1>
              <p className="mt-6 max-w-md text-xl text-[#f2efe8]/85">Tens um projeto, uma ideia ainda vaga ou só uma pergunta? Escreve-me — respondo com todo o gosto.</p>
              <dl className="mt-10 space-y-5 border-t border-[#f2efe8]/25 pt-6">
                {[['E-mail', 'ola@lenamoreau.example'], ['Telefone', '+351 000 000 000'], ['Estúdio', 'Rua do Exemplo 12, 1000-000 Lisboa'], ['Horário', 'Segunda a sexta, 10h00 – 18h00']].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[100px_1fr] gap-4">
                    <dt className={`${tag} pt-1 text-[#f2efe8]/70`}>{k}</dt>
                    <dd className="break-words text-lg">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ContactForm />
          </section>
        ) : (
          <HomePage />
        )}
      </main>
      <footer className="border-t border-[#f2efe8]/25">
        <div className={`${wrap} flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between`}>
          <p className="font-display text-lg font-bold uppercase tracking-tight">Lena Moreau<span className="text-[#d7ff3e]">®</span></p>
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {meta.pages.map((p) => <li key={p.key}><Link href={p.key ? `${BASE}/${p.key}` : BASE} className={`${tag} hover:text-[#d7ff3e]`}>{p.label}</Link></li>)}
            </ul>
          </nav>
          <p className="text-xs text-[#f2efe8]/70">© {new Date().getFullYear()} Lena Moreau — portefólio fictício.</p>
        </div>
      </footer>
    </div>
  );
}
