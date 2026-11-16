'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { Artwork, type ArtId } from './art';

const BASE = '/demo/portfolio-lena';
const href = (key: string) => (key ? `${BASE}/${key}` : BASE);

export function Header({ pages, current }: { pages: { key: string; label: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <header className="relative z-40 border-b border-[#f2efe8]/15">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href={BASE} className="font-display text-lg font-bold uppercase tracking-tight">
          Lena Moreau<span className="text-[#d7ff3e]">®</span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
          {pages.map((p, i) => (
            <Link key={p.key} href={href(p.key)} aria-current={current === p.key ? 'page' : undefined} className={`group font-display text-sm uppercase tracking-wider ${current === p.key ? 'text-[#d7ff3e]' : 'text-[#f2efe8] hover:text-[#d7ff3e]'}`}>
              <span className="mr-1.5 text-[10px] text-[#f2efe8]/60">0{i + 1}</span>
              {p.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="font-display text-sm font-bold uppercase tracking-wider md:hidden" aria-expanded={open} aria-controls="lm-mobile-nav" onClick={() => setOpen((o) => !o)}>
          {open ? 'Fechar' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav id="lm-mobile-nav" aria-label="Navegação móvel" className="absolute inset-x-0 top-full bg-[#d7ff3e] px-4 pb-8 pt-4 text-[#0d0d0d] md:hidden">
          {pages.map((p, i) => (
            <Link key={p.key} href={href(p.key)} onClick={() => setOpen(false)} aria-current={current === p.key ? 'page' : undefined} className="flex items-baseline justify-between border-b-2 border-[#0d0d0d] py-4 font-display text-4xl font-bold uppercase tracking-tighter">
              {p.label}
              <span className="text-sm font-medium">0{i + 1}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ───────── Projects with filter + case study ───────── */

type Project = { id: ArtId; title: string; cat: string; year: string; client: string; role: string; lead: string; challenge: string; approach: string; outcome: string; deliverables: string[] };

export const PROJECTS: Project[] = [
  { id: 'mare', title: 'Maré Alta', cat: 'Identidade', year: '2026', client: 'Festival de música (fictício)', role: 'Direção de arte, identidade', lead: 'Uma identidade que se move como o mar para um festival à beira do Atlântico.', challenge: 'O festival precisava de uma imagem reconhecível em cartazes de rua, pulseiras e ecrãs de palco, sem perder legibilidade em nenhum formato.', approach: 'Desenhei um sistema de ondas modulares que se repete, corta e anima. Duas cores fortes e uma tipografia condensada fazem o resto.', outcome: 'Um sistema entregue com regras simples, que a equipa do festival consegue aplicar sozinha a cada nova edição.', deliverables: ['Logótipo e sistema gráfico', 'Cartazes e sinalética', 'Animações para palco', 'Manual de normas'] },
  { id: 'limao', title: 'Casa Limão', cat: 'Identidade', year: '2025', client: 'Marca de conservas (fictícia)', role: 'Identidade, embalagem', lead: 'Embalagens solares para uma pequena conserveira familiar.', challenge: 'Dar personalidade a uma gama de doze latas, mantendo custos de impressão baixos e uma leitura imediata na prateleira.', approach: 'Uma só cor direta por produto, ilustrações de linha grossa e um rótulo que se dobra em receita.', outcome: 'Uma gama coerente, pronta a crescer: cada novo sabor pede apenas uma cor e um desenho.', deliverables: ['Naming da gama', 'Doze rótulos', 'Caixa de oferta', 'Fotografia de produto'] },
  { id: 'folego', title: 'Revista Fôlego', cat: 'Editorial', year: '2025', client: 'Publicação independente (fictícia)', role: 'Design editorial', lead: 'Uma revista semestral sobre desporto lento e vida ao ar livre.', challenge: 'Conciliar ensaios longos com reportagem fotográfica, num objeto que apetece guardar.', approach: 'Grelha de seis colunas, margens generosas e uma cor de destaque que muda a cada número.', outcome: 'Um modelo editorial flexível, com folhas de estilo documentadas para a redação.', deliverables: ['Conceito editorial', 'Grelha e tipografia', 'Capa e paginação', 'Modelos para a redação'] },
  { id: 'linha', title: 'Linha 28', cat: 'Fotografia', year: '2024', client: 'Projeto pessoal', role: 'Fotografia, edição', lead: 'Um ano a fotografar o mesmo elétrico, sempre à mesma hora.', challenge: 'Fugir ao postal turístico e encontrar o quotidiano de quem usa a linha todos os dias.', approach: 'Regressei à mesma paragem ao fim da tarde, semana após semana, deixando a luz e as pessoas mudarem a imagem.', outcome: 'Uma série de quarenta fotografias e uma pequena edição de autor impressa em risografia.', deliverables: ['Série fotográfica', 'Sequência e edição', 'Publicação de autor', 'Exposição em formato cartaz'] },
  { id: 'sal', title: 'Atlas do Sal', cat: 'Fotografia', year: '2024', client: 'Cooperativa de salineiros (fictícia)', role: 'Fotografia documental', lead: 'Retrato de uma paisagem desenhada à mão, tanque a tanque.', challenge: 'Documentar um ofício sazonal, respeitando o ritmo de quem trabalha.', approach: 'Fotografia aérea e de proximidade, lado a lado, para mostrar a geometria e os gestos.', outcome: 'Um arquivo de imagens que a cooperativa utiliza na sua comunicação e nas visitas guiadas.', deliverables: ['Reportagem fotográfica', 'Retratos', 'Banco de imagens', 'Painéis para o centro de visitas'] },
  { id: 'obvio', title: 'Óbvio Studio', cat: 'Digital', year: '2026', client: 'Atelier de arquitetura (fictício)', role: 'Design de interface', lead: 'Um website que mostra arquitetura sem se pôr à frente dela.', challenge: 'Apresentar projetos muito diferentes entre si com uma navegação que se percebe em segundos.', approach: 'Uma página por projeto, desenhos técnicos como elemento gráfico e um único gesto de navegação.', outcome: 'Um site rápido, fácil de atualizar pela equipa do atelier, pensado primeiro para telemóvel.', deliverables: ['Arquitetura de informação', 'Design de interface', 'Protótipo navegável', 'Guia de componentes'] },
  { id: 'tipos', title: 'Tipos de Rua', cat: 'Editorial', year: '2023', client: 'Edição de autor', role: 'Investigação, design de livro', lead: 'Um livro sobre as letras pintadas à mão nas lojas de bairro.', challenge: 'Transformar centenas de fotografias de fachadas num objeto com ritmo e leitura.', approach: 'Organizei as letras por gesto e não por rua, com capítulos curtos e reproduções à escala real.', outcome: 'Um livro de 160 páginas, com capa serigrafada, feito em colaboração com uma tipografia local.', deliverables: ['Levantamento fotográfico', 'Design do livro', 'Capa serigrafada', 'Cartaz de lançamento'] },
];

const CATS = ['Todos', 'Identidade', 'Editorial', 'Fotografia', 'Digital'];

export function Projects() {
  const [cat, setCat] = useState('Todos');
  const [openId, setOpenId] = useState<ArtId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const list = PROJECTS.filter((p) => cat === 'Todos' || p.cat === cat);
  const active = PROJECTS.find((p) => p.id === openId);

  useEffect(() => {
    if (openId) panelRef.current?.focus();
  }, [openId]);

  return (
    <div>
      <div role="group" aria-label="Filtrar projetos por disciplina" className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => { setCat(c); setOpenId(null); }} className={`rounded-full border-2 px-5 py-2 font-display text-sm font-bold uppercase tracking-wider transition-colors ${cat === c ? 'border-[#d7ff3e] bg-[#d7ff3e] text-[#0d0d0d]' : 'border-[#f2efe8]/40 text-[#f2efe8] hover:border-[#d7ff3e] hover:text-[#d7ff3e]'}`}>
            {c}
            <sup className="ml-1 text-[10px]">{c === 'Todos' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c).length}</sup>
          </button>
        ))}
      </div>

      {active && (
        <div ref={panelRef} tabIndex={-1} role="region" aria-label={`Estudo de caso: ${active.title}`} className="mt-8 scroll-mt-4 bg-[#f2efe8] text-[#0d0d0d] outline-none">
          <div className="grid lg:grid-cols-[1fr_1.3fr]">
            <Artwork id={active.id} className="aspect-[4/5] w-full lg:aspect-auto lg:h-full" />
            <div className="p-6 sm:p-10">
              <div className="flex items-start justify-between gap-4">
                <p className="font-display text-xs font-bold uppercase tracking-[0.2em]">Estudo de caso · {active.cat} · {active.year}</p>
                <button type="button" onClick={() => setOpenId(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0d0d0d] text-[#f2efe8] hover:bg-[#5a35e0]" aria-label="Fechar estudo de caso"><X className="h-5 w-5" aria-hidden="true" /></button>
              </div>
              <h2 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.9] tracking-tighter sm:text-7xl">{active.title}</h2>
              <p className="mt-4 text-xl">{active.lead}</p>
              <dl className="mt-8 grid gap-6 border-t-2 border-[#0d0d0d] pt-6 sm:grid-cols-3">
                {[['O desafio', active.challenge], ['A abordagem', active.approach], ['O resultado', active.outcome]].map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-display text-xs font-bold uppercase tracking-[0.2em]">{t}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-[#2b2b2b]">{d}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.2em]">Cliente</p>
                  <p className="mt-1 text-sm">{active.client}</p>
                  <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.2em]">Função</p>
                  <p className="mt-1 text-sm">{active.role}</p>
                </div>
                <div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.2em]">Entregas</p>
                  <ul className="mt-1 text-sm">
                    {active.deliverables.map((d) => <li key={d} className="border-b border-[#0d0d0d]/20 py-1.5">{d}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <li key={p.id} className={i % 3 === 1 ? 'lg:mt-16' : ''}>
            <button type="button" onClick={() => setOpenId(p.id)} aria-expanded={openId === p.id} className="group block w-full text-left">
              <span className="relative block overflow-hidden">
                <Artwork id={p.id} className="aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-[#d7ff3e] text-[#0d0d0d] transition-transform group-hover:rotate-45"><ArrowUpRight className="h-6 w-6" aria-hidden="true" /></span>
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-3 border-b border-[#f2efe8]/25 pb-3">
                <span className="font-display text-2xl font-bold uppercase tracking-tight group-hover:text-[#d7ff3e]">{p.title}</span>
                <span className="shrink-0 text-xs uppercase tracking-wider text-[#f2efe8]/70">{p.cat} — {p.year}</span>
              </span>
              <span className="mt-2 block text-sm text-[#f2efe8]/75">{p.lead}</span>
              <span className="sr-only"> Ver estudo de caso</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Contact form ───────── */

const TOPICS = ['Identidade', 'Editorial', 'Fotografia', 'Digital', 'Outra coisa'];
const field = 'mt-2 w-full border-0 border-b-2 border-[#f2efe8]/40 bg-transparent px-0 py-3 text-xl text-[#f2efe8] placeholder:text-[#f2efe8]/45 focus:border-[#d7ff3e] aria-[invalid=true]:border-[#ff8a70]';
const lab = 'font-display text-xs font-bold uppercase tracking-[0.2em] text-[#f2efe8]/80';

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const err: Record<string, string> = {};
    if (v('nome').length < 2) err.nome = 'Indica o teu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) err.email = 'Indica um endereço de e-mail válido.';
    if (topics.length === 0) err.temas = 'Escolhe pelo menos uma área.';
    if (v('mensagem').length < 20) err.mensagem = 'Conta-me um pouco mais (mínimo de 20 caracteres).';
    setErrors(err);
    if (Object.keys(err).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="bg-[#d7ff3e] p-8 text-[#0d0d0d] sm:p-12">
        <p className="font-display text-6xl font-bold uppercase leading-none tracking-tighter sm:text-8xl">Obrigada!</p>
        <p className="mt-4 text-xl">Isto é uma demonstração: nenhum dado foi enviado.</p>
        <button type="button" onClick={() => { setSent(false); setTopics([]); }} className="mt-8 rounded-full bg-[#0d0d0d] px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-[#f2efe8]">Escrever outra mensagem</button>
      </div>
    );
  }

  const a = (k: string) => ({ id: `lm-${k}`, name: k, 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `lm-${k}-err` : undefined });
  const err = (k: string) => (errors[k] ? <p id={`lm-${k}-err`} className="mt-2 text-sm font-medium text-[#ff8a70]">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-8 sm:grid-cols-2">
        <div><label htmlFor="lm-nome" className={lab}>Nome *</label><input {...a('nome')} autoComplete="name" placeholder="O teu nome" className={field} />{err('nome')}</div>
        <div><label htmlFor="lm-email" className={lab}>E-mail *</label><input {...a('email')} type="email" autoComplete="email" placeholder="nome@example.pt" className={field} />{err('email')}</div>
        <fieldset className="sm:col-span-2" aria-describedby={errors.temas ? 'lm-temas-err' : undefined}>
          <legend className={lab}>Em que posso ajudar? *</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const on = topics.includes(t);
              return (
                <button key={t} type="button" aria-pressed={on} onClick={() => setTopics((p) => (on ? p.filter((x) => x !== t) : [...p, t]))} className={`rounded-full border-2 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wider transition-colors ${on ? 'border-[#d7ff3e] bg-[#d7ff3e] text-[#0d0d0d]' : 'border-[#f2efe8]/40 hover:border-[#d7ff3e]'}`}>
                  {t}
                </button>
              );
            })}
          </div>
          {err('temas')}
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="lm-orcamento" className={lab}>Orçamento previsto</label>
          <select id="lm-orcamento" name="orcamento" defaultValue="" className={`${field} [&>option]:text-[#0d0d0d]`}>
            <option value="">Ainda não sei</option>
            <option>Até 2 000 €</option>
            <option>2 000 € – 5 000 €</option>
            <option>5 000 € – 15 000 €</option>
            <option>Mais de 15 000 €</option>
          </select>
        </div>
        <div className="sm:col-span-2"><label htmlFor="lm-mensagem" className={lab}>Mensagem *</label><textarea {...a('mensagem')} rows={4} placeholder="Fala-me do projeto, dos prazos e do que te entusiasma." className={field} />{err('mensagem')}</div>
      </div>
      <button type="submit" className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#d7ff3e] px-8 py-4 font-display text-lg font-bold uppercase tracking-wider text-[#0d0d0d] transition-colors hover:bg-[#f2efe8]">
        Enviar mensagem <ArrowDownRight className="h-6 w-6 transition-transform group-hover:-rotate-45" aria-hidden="true" />
      </button>
      <p className="mt-4 text-sm text-[#f2efe8]/70">* Campos obrigatórios. Formulário de demonstração: nada é enviado.</p>
    </form>
  );
}
