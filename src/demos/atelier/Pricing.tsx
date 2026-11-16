'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Établi',
    desc: 'Pour les petites équipes qui quittent le tableur.',
    monthly: 29,
    features: ['Jusqu’à 10 utilisateurs', 'Planning et ordres de travail', 'Devis et bons de livraison', 'Assistance par e-mail'],
  },
  {
    name: 'Atelier',
    desc: 'Pour les PME qui pilotent plusieurs équipes.',
    monthly: 59,
    featured: true,
    features: ['Utilisateurs illimités', 'Suivi des temps et des marges', 'Automatisations sans code', 'Connecteurs comptabilité et ERP', 'Assistance prioritaire'],
  },
  {
    name: 'Manufacture',
    desc: 'Pour les groupes multi-sites aux exigences avancées.',
    monthly: null,
    features: ['Multi-sites et multi-entités', 'SSO et gestion fine des droits', 'Hébergement dédié en Suisse', 'Accompagnement au déploiement'],
  },
];

export default function Pricing({ contactHref, compact = false }: { contactHref: string; compact?: boolean }) {
  const [annual, setAnnual] = useState(true);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div role="group" aria-label="Période de facturation" className="inline-flex rounded-full border-2 border-[#0d0f1a] bg-white p-1">
          {[
            { v: false, l: 'Mensuel' },
            { v: true, l: 'Annuel' },
          ].map((o) => (
            <button
              key={o.l}
              type="button"
              aria-pressed={annual === o.v}
              onClick={() => setAnnual(o.v)}
              className="rounded-full px-5 py-2 text-sm font-semibold aria-pressed:bg-[#0d0f1a] aria-pressed:text-white"
            >
              {o.l}
            </button>
          ))}
        </div>
        <span className="rounded-full bg-[#d9ff5b] px-3 py-1 text-xs font-bold uppercase tracking-wide">2 mois offerts en annuel</span>
      </div>

      <ul className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((p) => {
          const price = p.monthly === null ? null : annual ? Math.round((p.monthly * 10) / 12) : p.monthly;
          return (
            <li
              key={p.name}
              className={`flex flex-col rounded-3xl border-2 border-[#0d0f1a] p-7 ${
                p.featured ? 'bg-[#0d0f1a] text-white shadow-[8px_8px_0_#2b3bff]' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                {p.featured && <span className="rounded-full bg-[#d9ff5b] px-3 py-1 text-xs font-bold text-[#0d0f1a]">Le plus choisi</span>}
              </div>
              <p className={`mt-2 text-sm ${p.featured ? 'text-white/75' : 'text-[#0d0f1a]/70'}`}>{p.desc}</p>
              <p className="mt-6 flex items-baseline gap-2" aria-live="polite">
                {price === null ? (
                  <span className="font-display text-4xl font-bold">Sur devis</span>
                ) : (
                  <>
                    <span className="font-display text-5xl font-bold tracking-tight">CHF {price}</span>
                    <span className={`text-sm ${p.featured ? 'text-white/75' : 'text-[#0d0f1a]/70'}`}>/ utilisateur / mois</span>
                  </>
                )}
              </p>
              <p className={`mt-1 text-xs ${p.featured ? 'text-white/60' : 'text-[#0d0f1a]/60'}`}>
                {price === null ? 'Tarification adaptée à votre périmètre' : annual ? 'Facturé annuellement, hors TVA' : 'Facturé chaque mois, hors TVA'}
              </p>
              {!compact && (
                <ul className="mt-6 grid gap-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${p.featured ? 'text-[#d9ff5b]' : 'text-[#2b3bff]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={contactHref}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  p.featured ? 'bg-[#d9ff5b] text-[#0d0f1a] hover:bg-white' : 'border-2 border-[#0d0f1a] hover:bg-[#0d0f1a] hover:text-white'
                }`}
              >
                {price === null ? 'Parler à un expert' : 'Démarrer l’essai gratuit'}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
