import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { pageMeta, Breadcrumbs } from '@/lib/seo';
import { PageHero, CtaBand } from '@/components/site/Section';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return pageMeta(locale, '/work', t('Réalisations — projets web et logiciels'), t('Quelques projets réalisés par ATHANA : sites web, plateformes et systèmes sur mesure.'));
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  // Projects carried over from the previous athana.ch portfolio.
  const projects = [
    { title: 'VF Froid', image: '/images/vf-froid.png', link: 'https://vffroid.ch', tags: [t('Site vitrine')], text: t('Site vitrine pour un spécialiste de la réfrigération : présentation des services, design sombre et animations fluides.') },
    { title: 'Chez Energie', image: '/images/chez-energie.jpg', link: 'https://github.com/CaikAraujo/chez-energie', tags: [t('Plateforme'), 'IA'], text: t('Plateforme d’économie d’énergie pour l’habitat, avec analyse et recommandations assistées par intelligence artificielle.') },
    { title: 'Fridge Telemetry', image: null, link: 'https://github.com/CaikAraujo/Fridge-Telemetry-System', tags: ['IoT', t('Rapports')], text: t('Système de surveillance thermique : alertes en temps réel et rapports PDF automatisés pour la chaîne du froid.') },
    { title: 'Scheduler API', image: null, link: 'https://github.com/CaikAraujo/Scheduler-API', tags: ['API'], text: t('API de gestion de plannings : transactions atomiques et architecture pensée pour la montée en charge.') },
  ];
  return (
    <>
      <PageHero eyebrow={t('Réalisations')} title={t('Des projets concrets, du site vitrine au système métier')} lead={t('Une sélection de travaux réalisés par notre équipe.')} />
      <div className="container-page py-10">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Réalisations'), '/work']]} />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((pr) => (
            <article key={pr.title} className="card overflow-hidden">
              <div className="relative aspect-[16/9] bg-ink-800">
                {pr.image ? <Image src={pr.image} alt={pr.title} fill sizes="(min-width:768px) 560px, 100vw" className="object-cover" /> : <div className="bg-grid grid h-full place-items-center"><span className="font-display text-3xl font-semibold text-gold-500/50">{pr.title}</span></div>}
              </div>
              <div className="p-6">
                <div className="mb-2 flex flex-wrap gap-2">{pr.tags.map((tag) => <span key={tag} className="badge">{tag}</span>)}</div>
                <h2 className="text-xl font-semibold">{pr.title}</h2>
                <p className="muted mt-2 text-sm">{pr.text}</p>
                <a className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:underline" href={pr.link} target="_blank" rel="noopener noreferrer">{t('Voir le projet')} <ExternalLink size={14} aria-hidden /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
      <CtaBand title={t('Votre projet pourrait être le prochain')}><a className="btn btn-primary btn-lg" href={localePath(locale, '/quote')}>{t('Demander un devis')}</a><a className="btn btn-outline btn-lg" href={localePath(locale, '/templates')}>{t('Voir les modèles')}</a></CtaBand>
    </>
  );
}
