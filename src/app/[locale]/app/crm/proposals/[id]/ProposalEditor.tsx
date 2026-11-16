'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useLocale } from '@/i18n/client';
import { formatMoney } from '@/i18n/translate';
import { ActionForm, Input, Select, Submit, Textarea, useFieldError } from '@/components/ui/form';
import { updateProposalAction } from '@/modules/crm/actions';

type Row = { key: number; description: string; quantity: string; price: string };
export type EditorLabels = Record<
  'title' | 'recipient' | 'deal' | 'validUntil' | 'notes' | 'notesHint' | 'lines' | 'description' | 'quantity' | 'unitPrice' | 'lineTotal' | 'addLine' | 'removeLine' | 'total' | 'save' | 'saved' | 'noLines',
  string
>;

const num = (s: string) => {
  const n = Number(s.replace(/[\s'’]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

function LinesError() {
  const error = useFieldError('lines');
  return error ? <p className="field-error" role="alert">{error}</p> : null;
}

/** Line-item editor of a draft proposal: rows are plain form fields, the total shown is recomputed by the server on save. */
export function ProposalEditor({ proposal, deals, labels }: {
  proposal: { id: string; title: string; recipient: string; dealId: string; validUntil: string; notes: string; currency: string; lines: { description: string; quantity: number; unitAmount: number }[] };
  deals: { value: string; label: string }[]; labels: EditorLabels;
}) {
  const locale = useLocale();
  const [rows, setRows] = useState<Row[]>(() => {
    const initial = proposal.lines.map((l, i) => ({ key: i, description: l.description, quantity: String(l.quantity), price: (l.unitAmount / 100).toFixed(2) }));
    return initial.length ? initial : [{ key: 0, description: '', quantity: '1', price: '' }];
  });
  const [nextKey, setNextKey] = useState(rows.length);
  const set = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const rowTotal = (r: Row) => Math.round(num(r.quantity) * Math.round(num(r.price) * 100));
  const total = rows.reduce((sum, r) => sum + rowTotal(r), 0);
  const money = (v: number) => formatMoney(v, proposal.currency, locale);

  return (
    <ActionForm action={updateProposalAction} className="space-y-5" successMessage={labels.saved}>
      <input type="hidden" name="id" value={proposal.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Input label={labels.title} name="title" required maxLength={200} defaultValue={proposal.title} /></div>
        <Input label={labels.recipient} name="recipient" maxLength={300} defaultValue={proposal.recipient} />
        <Select label={labels.deal} name="dealId" defaultValue={proposal.dealId} options={deals} />
        <Input label={labels.validUntil} name="validUntil" type="date" defaultValue={proposal.validUntil} />
      </div>

      <fieldset>
        <legend className="label">{labels.lines}</legend>
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li key={r.key} className="grid grid-cols-2 gap-2 rounded-xl border border-line p-3 md:grid-cols-[minmax(0,1fr)_90px_130px_120px_auto] md:items-end">
              <label className="col-span-2 md:col-span-1">
                <span className="label">{labels.description}</span>
                <input name="lineDescription" className="input" maxLength={300} value={r.description} onChange={(e) => set(r.key, { description: e.target.value })} />
              </label>
              <label>
                <span className="label">{labels.quantity}</span>
                <input name="lineQuantity" className="input" inputMode="decimal" value={r.quantity} onChange={(e) => set(r.key, { quantity: e.target.value })} />
              </label>
              <label>
                <span className="label">{labels.unitPrice} ({proposal.currency})</span>
                <input name="linePrice" className="input" inputMode="decimal" placeholder="0.00" value={r.price} onChange={(e) => set(r.key, { price: e.target.value })} />
              </label>
              <div className="flex items-center justify-between gap-2 md:block">
                <span className="label !mb-0 md:!mb-1.5">{labels.lineTotal}</span>
                <output className="block text-sm font-semibold md:py-2.5">{money(rowTotal(r))}</output>
              </div>
              <button type="button" className="btn btn-ghost btn-sm justify-self-end" onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : [{ ...r, description: '', quantity: '1', price: '' }]))} aria-label={`${labels.removeLine} ${i + 1}`}>
                <Trash2 size={16} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <LinesError />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="btn btn-outline btn-sm" disabled={rows.length >= 100} onClick={() => { setRows((rs) => [...rs, { key: nextKey, description: '', quantity: '1', price: '' }]); setNextKey((k) => k + 1); }}>
            <Plus size={16} aria-hidden />{labels.addLine}
          </button>
          <p className="text-base">{labels.total} : <strong className="text-gold-300">{money(total)}</strong></p>
        </div>
      </fieldset>

      <Textarea label={labels.notes} name="notes" maxLength={5000} defaultValue={proposal.notes} hint={labels.notesHint} />
      <Submit>{labels.save}</Submit>
    </ActionForm>
  );
}
