import { ArrowRight, Globe, ShoppingCart, AppWindow, Code2, ShieldCheck, Gauge, Languages, MessagesSquare, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { getMarket, getSetting } from '@/lib/settings';
import { priceFor } from '@/lib/money';
import { pageMeta, JsonLd } from '@/lib/seo';
import { env } from '@/lib/env';
import { listProducts } from '@/modules/catalog/service';
import { ProductCard } from '@/components/site/ProductCard';
import { Section, FaqList, CtaBand } from '@/components/site/Section';
import { Reveal } from '@/components/site/Consent';
import { LeadForm } from '@/components/site/LeadForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return pageMeta(locale, '/', t('ATHANA — Sites web, e-commerce et logiciels professionnels'), t('Sites web, boutiques en ligne, logiciels et applications professionnelles. Choisissez votre solution et démarrez votre projet avec Athana.'));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const market = await getMarket(locale);
  const currency = market?.currency ?? 'CHF';
  const p = (path: string) => localePath(locale, path);
  const [featured, saas, faqs, testimonials, company] = await Promise.all([
    listProducts({ featured: true, take: 4 }),
    db.saasProduct.findMany({ where: { status: { in: ['ACTIVE', 'COMING_SOON'] } }, orderBy: { sortOrder: 'asc' }, include: { plans: { where: { active: true }, orderBy: { sortOrder: 'asc' }, take: 1 } } }),
    db.faq.findMany({ where: { scope: 'home', published: true }, orderBy: { sortOrder: 'asc' } }),
    db.testimonial.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
    getSetting('company'),
  ]);

  const entries = [
    { icon: Globe, title: t('Sites Web'), text: t('Des modèles professionnels personnalisés à votre marque, livrés en quelques jours.'), href: '/templates', cta: t('Voir les modèles') },
    { icon: ShoppingCart, title: t('E-commerce'), text: t('Une boutique en ligne complète : catalogue, panier, paiement et gestion des commandes.'), href: '/ecommerce', cta: t('Créer ma boutique') },
    { icon: AppWindow, title: t('Logiciels'), text: t('CRM, pointage et outils de gestion en abonnement, prêts à l’emploi.'), href: '/software', cta: t('Découvrir les logiciels') },
    { icon: Code2, title: t('Développement sur mesure'), text: t('Applications, plateformes et intégrations conçues pour vos processus.'), href: '/custom', cta: t('Parler de mon projet') },
  ];
  const benefits = [
    { icon: ShieldCheck, title: t('Exigence suisse'), text: t('Un travail précis, des engagements clairs et un interlocuteur qui répond.') },
    { icon: Gauge, title: t('Rapide et performant'), text: t('Des sites légers, optimisés pour le mobile et le référencement.') },
    { icon: Languages, title: t('International'), text: t('Français et portugais, plusieurs devises, des projets livrés en Suisse, en France, au Portugal et au Brésil.') },
    { icon: MessagesSquare, title: t('Suivi transparent'), text: t('Un espace client pour suivre chaque étape, échanger et valider votre projet.') },
  ];
  const steps = [
    [t('Choisissez'), t('Sélectionnez un modèle, un pack et les options dont vous avez besoin.')],
    [t('Commandez'), t('Payez en ligne sur une page sécurisée et recevez votre confirmation.')],
    [t('Briefez'), t('Remplissez le briefing : votre entreprise, vos contenus, vos préférences.')],
    [t('Validez'), t('Suivez la réalisation, demandez vos révisions et validez la mise en ligne.')],
  ];

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Organization', name: company.legalName, url: env.appUrl, logo: `${env.appUrl}/images/athana_logo.svg`,
        email: company.email, ...(company.phone ? { telephone: company.phone } : {}),
        ...(company.address ? { address: { '@type': 'PostalAddress', streetAddress: company.address, postalCode: company.postalCode, addressLocality: company.city, addressCountry: company.country } } : {}),
        ...(company.linkedin ? { sameAs: [company.linkedin] } : {}),
      }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'ATHANA', url: env.appUrl + p('/'), inLanguage: locale }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" aria-hidden />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gold-500/12 blur-3xl" aria-hidden />
        <div className="container-page relative pb-16 pt-16 text-center md:pb-24 md:pt-28">
          <p className="badge badge-gold mx-auto mb-6">{t('Solutions digitales conçues en Suisse')}</p>
          <h1 className="h-display mx-auto max-w-4xl">{t('Votre entreprise mérite de')} <span className="gold-text">{t('meilleures solutions digitales.')}</span></h1>
          <p className="lead mx-auto mt-6 max-w-2xl">{t('Sites web, boutiques en ligne, logiciels et applications professionnelles. Choisissez votre solution et démarrez votre projet avec Athana.')}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a className="btn btn-primary btn-lg" href={p('/templates')}>{t('Choisir un modèle')} <ArrowRight size={18} aria-hidden /></a>
            <a className="btn btn-outline btn-lg" href={p('/quote')}>{t('Demander un devis')}</a>
          </div>
        </div>
      </section>

      {/* Four entries */}
      <section className="container-page pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((e, i) => (
            <Reveal key={e.href}>
              <a href={p(e.href)} className="card card-hover card-pad group flex h-full flex-col no-underline" style={{ transitionDelay: `${i * 40}ms` }}>
                <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300"><e.icon size={20} aria-hidden /></span>
                <h2 className="text-xl font-semibold">{e.title}</h2>
                <p className="muted mt-2 flex-1 text-sm">{e.text}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300">{e.cta} <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" /></span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured templates */}
      <Section eyebrow="ATHANA Web" title={t('Des modèles prêts à devenir votre site')} lead={t('Chaque modèle possède une démonstration navigable. Vous voyez le résultat avant d’acheter.')}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((prod) => <ProductCard key={prod.id} product={prod} locale={locale} currency={currency} t={t} />)}
        </div>
        <div className="mt-8 text-center"><a className="btn btn-outline" href={p('/templates')}>{t('Voir tous les modèles')} <ArrowRight size={16} aria-hidden /></a></div>
      </Section>

      {/* Software */}
      <Section eyebrow="ATHANA Software" title={t('Nos logiciels en abonnement')} lead={t('Des outils de gestion simples, hébergés pour vous, sans installation.')} className="border-y border-line bg-ink-900">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {saas.map((s) => {
            const from = s.plans[0] ? priceFor(s.plans[0].prices, currency) : null;
            const active = s.status === 'ACTIVE';
            return (
              <article key={s.key} className="card card-pad flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  {active ? <span className="badge badge-ok">{t('Disponible')}</span> : <span className="badge">{t('Bientôt')}</span>}
                </div>
                <p className="muted mt-2 flex-1 text-sm">{L(s.tagline, locale)}</p>
                {active && (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    {from !== null ? <span className="text-sm text-fg-soft">{t('dès')} <strong className="text-fg">{formatMoney(from, currency, locale)}</strong> {t('/ mois')}</span> : <span />}
                    <a className="btn btn-outline btn-sm" href={p(`/software/${s.key}`)}>{t('Découvrir')}</a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Section>

      {/* Benefits */}
      <Section eyebrow={t('Pourquoi Athana')} title={t('Une équipe technique, un résultat professionnel')}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Reveal key={b.title} className="panel p-6">
              <b.icon size={22} className="text-gold-400" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="muted mt-2 text-sm">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section eyebrow={t('Comment ça marche')} title={t('De la commande à la mise en ligne, en quatre étapes')} className="border-y border-line bg-ink-900">
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title} className="relative rounded-2xl border border-line p-6">
              <span className="font-display text-4xl font-semibold text-gold-500/40">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="muted mt-2 text-sm">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Testimonials: only real, published ones are shown. */}
      {testimonials.length > 0 && (
        <Section eyebrow={t('Témoignages')} title={t('Ce que disent nos clients')}>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((tm) => (
              <figure key={tm.id} className="card card-pad">
                <blockquote className="text-fg-soft">“{tm.content}”</blockquote>
                <figcaption className="mt-4 text-sm"><strong>{tm.author}</strong>{(tm.role || tm.company) && <span className="muted"> — {[tm.role, tm.company].filter(Boolean).join(', ')}</span>}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section eyebrow="FAQ" title={t('Questions fréquentes')} center>
          <FaqList items={faqs.map((f) => ({ q: L(f.question, locale), a: L(f.answer, locale) }))} />
          <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: L(f.question, locale), acceptedAnswer: { '@type': 'Answer', text: L(f.answer, locale) } })) }} />
        </Section>
      )}

      <CtaBand title={t('Prêt à lancer votre projet ?')} lead={t('Achetez un modèle en ligne ou décrivez-nous votre besoin : nous revenons vers vous avec une proposition.')}>
        <a className="btn btn-primary btn-lg" href={p('/templates')}>{t('Acheter un site')}</a>
        <a className="btn btn-outline btn-lg" href={p('/quote')}>{t('Demander un devis')}</a>
      </CtaBand>

      {/* Contact */}
      <Section id="contact" eyebrow={t('Contact')} title={t('Une question ? Écrivez-nous.')}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <ul className="space-y-3 text-fg-soft">
            {[t('Réponse par une personne de l’équipe, pas par un robot.'), t('Conseil sur la solution la plus adaptée à votre budget.'), t('Devis gratuit et sans engagement.')].map((x) => (
              <li key={x} className="flex gap-3"><Check size={18} className="mt-1 shrink-0 text-gold-400" aria-hidden />{x}</li>
            ))}
            <li className="pt-4 text-sm"><a className="text-gold-300 underline" href={`mailto:${company.email}`}>{company.email}</a>{company.phone && <> · <a className="hover:text-gold-300" href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></>}</li>
          </ul>
          <div className="card card-pad"><LeadForm kind="contact" compact /></div>
        </div>
      </Section>
    </>
  );
}
