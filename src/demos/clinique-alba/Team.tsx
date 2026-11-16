'use client';

import { useState } from 'react';
import { CalendarDays, Languages } from 'lucide-react';
import Link from 'next/link';
import { specialties, team } from './data';

export default function Team({ bookHref }: { bookHref: string }) {
  const [filter, setFilter] = useState<string>('Toutes');
  const list = team.filter((p) => filter === 'Toutes' || p.specialty === filter);
  return (
    <div>
      <div role="group" aria-label="Filtrer l’équipe par spécialité" className="flex flex-wrap gap-2">
        {['Toutes', ...specialties.map((s) => s.key)].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className="rounded-full border border-[#b9d3dc] bg-white px-4 py-2 text-sm font-medium text-[#12344d] transition hover:border-[#0c7c78] aria-pressed:border-[#0c7c78] aria-pressed:bg-[#0c7c78] aria-pressed:text-white"
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#4a6577]" aria-live="polite">
        {list.length} praticien{list.length > 1 ? 's' : ''} affiché{list.length > 1 ? 's' : ''}
      </p>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <li key={p.name} className="flex flex-col rounded-2xl border border-[#d5e6ec] bg-white p-6">
            <span aria-hidden="true" className="grid size-16 place-items-center rounded-full text-xl font-semibold text-white" style={{ background: p.tone }}>
              {p.initials}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[#12344d]">{p.name}</h2>
            <p className="text-sm font-medium text-[#0c7c78]">{p.role}</p>
            <p className="mt-3 text-sm text-[#4a6577]">{p.focus}</p>
            <dl className="mt-4 grid gap-2 border-t border-[#d5e6ec] pt-4 text-sm text-[#12344d]">
              <div className="flex items-start gap-2">
                <dt>
                  <CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-[#0c7c78]" />
                  <span className="sr-only">Jours de consultation</span>
                </dt>
                <dd>{p.days}</dd>
              </div>
              <div className="flex items-start gap-2">
                <dt>
                  <Languages aria-hidden="true" className="mt-0.5 size-4 text-[#0c7c78]" />
                  <span className="sr-only">Langues parlées</span>
                </dt>
                <dd>{p.langs}</dd>
              </div>
            </dl>
            <Link href={bookHref} className="mt-5 inline-flex justify-center rounded-lg border border-[#0c7c78] px-4 py-2.5 text-sm font-semibold text-[#07504d] transition hover:bg-[#e2f4f2] lg:mt-auto">
              Prendre rendez-vous
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
