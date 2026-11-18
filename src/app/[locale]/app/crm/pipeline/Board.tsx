'use client';

import { useEffect, useState, useTransition } from 'react';
import { Link } from '@/i18n/client';
import { moveDealAction } from '@/modules/crm/actions';

export type BoardDeal = { id: string; title: string; value: string; subtitle: string; owner: string | null; due: string | null; won: boolean };
export type BoardStage = { id: string; name: string; probability: number; summary: string; deals: BoardDeal[] };
export type BoardLabels = { moveTo: string; empty: string; won: string; dropHere: string; moving: string };

/**
 * Kanban board. A deal can be moved by drag-and-drop (mouse) or with the stage selector on each card
 * (touch, keyboard, screen readers). The move is applied optimistically and confirmed by the server.
 */
export function Board({ stages: initial, labels }: { stages: BoardStage[]; labels: BoardLabels }) {
  const [stages, setStages] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => setStages(initial), [initial]);

  function move(dealId: string, stageId: string) {
    const from = stages.find((s) => s.deals.some((d) => d.id === dealId));
    const deal = from?.deals.find((d) => d.id === dealId);
    if (!from || !deal || from.id === stageId || deal.won) return;
    const previous = stages;
    setError(null);
    setStages(stages.map((s) => (s.id === from.id ? { ...s, deals: s.deals.filter((d) => d.id !== dealId) } : s.id === stageId ? { ...s, deals: [deal, ...s.deals] } : s)));
    startTransition(async () => {
      const fd = new FormData();
      fd.set('dealId', dealId);
      fd.set('stageId', stageId);
      const result = await moveDealAction(null, fd);
      if (!result?.ok) {
        setStages(previous);
        setError(result?.message ?? null);
      }
    });
  }

  return (
    <div>
      {error && <p role="alert" className="alert alert-danger mb-3">{error}</p>}
      <p className="sr-only" role="status" aria-live="polite">{pending ? labels.moving : ''}</p>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8" aria-busy={pending}>
        {stages.map((stage) => (
          <section
            key={stage.id} aria-label={stage.name}
            className={`flex w-[82vw] max-w-[300px] flex-none snap-start flex-col rounded-xl border bg-ink-850 ${over === stage.id ? 'border-accent-500' : 'border-line'}`}
            onDragOver={(e) => { if (dragging) { e.preventDefault(); setOver(stage.id); } }}
            onDragLeave={() => setOver((o) => (o === stage.id ? null : o))}
            onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain') || dragging; setOver(null); setDragging(null); if (id) move(id, stage.id); }}
          >
            <header className="border-b border-line px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-sm font-semibold">{stage.name}</h2>
                <span className="badge">{stage.probability} %</span>
              </div>
              <p className="muted mt-0.5 text-xs">{stage.summary}</p>
            </header>
            <ul className="flex min-h-24 flex-1 flex-col gap-2 p-2">
              {stage.deals.length === 0 && <li className="muted grid flex-1 place-items-center rounded-lg border border-dashed border-line px-2 py-5 text-center text-xs">{dragging ? labels.dropHere : labels.empty}</li>}
              {stage.deals.map((deal) => (
                <li
                  key={deal.id} draggable={!deal.won}
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', deal.id); e.dataTransfer.effectAllowed = 'move'; setDragging(deal.id); }}
                  onDragEnd={() => { setDragging(null); setOver(null); }}
                  className={`rounded-lg border border-line bg-ink-800 p-3 ${deal.won ? '' : 'cursor-grab active:cursor-grabbing'} ${dragging === deal.id ? 'opacity-50' : ''}`}
                >
                  <Link href={`/app/crm/deals/${deal.id}`} className="block break-words text-sm font-semibold no-underline hover:text-accent-700" draggable={false}>{deal.title}</Link>
                  {deal.subtitle && <p className="muted mt-0.5 truncate text-xs">{deal.subtitle}</p>}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
                    <span className="text-sm font-semibold text-accent-700">{deal.value}</span>
                    {deal.won ? <span className="badge badge-ok">{labels.won}</span> : deal.due && <span className="muted">{deal.due}</span>}
                  </div>
                  {deal.owner && <p className="muted mt-1 truncate text-xs">{deal.owner}</p>}
                  {!deal.won && (
                    <label className="mt-2 block">
                      <span className="sr-only">{labels.moveTo}</span>
                      <select className="select !min-h-9 py-1 text-xs" value={stage.id} disabled={pending} onChange={(e) => move(deal.id, e.target.value)} aria-label={`${labels.moveTo} — ${deal.title}`}>
                        {stages.map((s) => <option key={s.id} value={s.id}>{s.id === stage.id ? s.name : `→ ${s.name}`}</option>)}
                      </select>
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
