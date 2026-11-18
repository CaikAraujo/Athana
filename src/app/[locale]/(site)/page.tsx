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
import { BrowserFrame, PhoneFrame, Split } from '@/components/site/Showcase';
import { saasCopy } from '@/modules/content/saas-copy';

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
  const [featured, all, saas, faqs, testimonials, company] = await Promise.all([
    listProducts({ featured: true, take: 4 }),
    listProducts(),
    db.saasProduct.findMany({ where: { status: { in: ['ACTIVE', 'COMING_SOON'] } }, orderBy: { sortOrder: 'asc' }, include: { plans: { where: { active: true }, orderBy: { sortOrder: 'asc' }, take: 1 } } }),
    db.faq.findMany({ where: { scope: 'home', published: true }, orderBy: { sortOrder: 'asc' } }),
    db.testimonial.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
    getSetting('company'),
  ]);

  const showcase = featured.filter((x) => x.coverImage).slice(0, 3);
  const prices = all.map((x) => priceFor(x.startingPrices, currency)).filter((x): x is number => x !== null);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const minDays = all.length ? Math.min(...all.map((x) => x.deliveryDays)) : null;
  const saasActive = saas.filter((x) => x.status === 'ACTIVE');
  const saasSoon = saas.filter((x) => x.status !== 'ACTIVE');

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

      {/* Hero: asymmetric, left-aligned, with real figures from the catalogue */}
      <section className="border-b border-line-strong">
        <div className="container-page grid gap-12 pb-14 pt-12 md:pb-20 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow mb-6">{t('Solutions digitales conçues en Suisse')}</p>
            <h1 className="h-display" style={{ fontSize: 'clamp(2.6rem, 4.9vw, 4.3rem)' }}>{t('Votre entreprise mérite de')} <span className="mark">{t('meilleures solutions digitales.')}</span></h1>
            <p className="lead mt-6 max-w-xl">{t('Sites web, boutiques en ligne, logiciels et applications professionnelles. Choisissez votre solution et démarrez votre projet avec Athana.')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn btn-primary btn-lg" href={p('/templates')}>{t('Choisir un modèle')} <ArrowRight size={18} aria-hidden /></a>
              <a className="btn btn-outline btn-lg" href={p('/quote')}>{t('Demander un devis')}</a>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line-strong pt-6">
              <div><dt className="muted text-sm">{t('Modèles disponibles')}</dt><dd className="mt-1 font-display text-3xl font-semibold tracking-tight">{all.length}</dd></div>
              {minPrice !== null && <div><dt className="muted text-sm">{t('Site à partir de')}</dt><dd className="mt-1 font-display text-3xl font-semibold tracking-tight">{formatMoney(minPrice, currency, locale)}</dd></div>}
              {minDays !== null && <div><dt className="muted text-sm">{t('Livraison dès')}</dt><dd className="mt-1 font-display text-3xl font-semibold tracking-tight">{t('{n} jours', { n: minDays })}</dd></div>}
            </dl>
          </div>
          {showcase.length >= 2 && (
            <div className="relative pb-10 pr-6 md:pr-10">
              <BrowserFrame src={showcase[0].coverImage!} alt={t('Aperçu du modèle {name}', { name: showcase[0].name })} priority sizes="(min-width:1024px) 600px, 100vw" />
              <BrowserFrame src={showcase[1].coverImage!} alt={t('Aperçu du modèle {name}', { name: showcase[1].name })} sizes="320px" className="absolute -bottom-2 right-0 w-[52%]" />
            </div>
          )}
        </div>
      </section>

      {/* Four entries */}
      <section className="container-page py-12 md:py-16">
        <div className="tile-grid sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((e, i) => (
            <a key={e.href} href={p(e.href)} className="tile">
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <span className="tile-title mt-3 block">{e.title}</span>
              <span className="muted mt-2 block text-[0.95rem]">{e.text}</span>
              <span className="tile-arrow inline-flex items-center gap-2 text-sm font-medium">{e.cta} <ArrowRight size={16} aria-hidden /></span>
            </a>
          ))}
        </div>
      </section>

      {/* Featured templates */}
      <Section eyebrow="ATHANA Web" title={t('Des modèles prêts à devenir votre site')} lead={t('Chaque modèle possède une démonstration navigable. Vous voyez le résultat avant d’acheter.')} className="pt-2!">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((prod, i) => <ProductCard key={prod.id} product={prod} locale={locale} currency={currency} t={t} priority={i === 0} />)}
        </div>
        <div className="mt-8 text-center"><a className="btn btn-outline" href={p('/templates')}>{t('Voir tous les modèles')} <ArrowRight size={16} aria-hidden /></a></div>
      </Section>

      {/* Software: real product screens */}
      <Section eyebrow="ATHANA Software" title={t('Nos logiciels en abonnement')} lead={t('Des outils de gestion simples, hébergés pour vous, sans installation.')} className="border-y border-line bg-ink-900">
        <div className="space-y-16 md:space-y-20">
          {saasActive.map((s, i) => {
            const from = s.plans[0] ? priceFor(s.plans[0].prices, currency) : null;
            const copy = saasCopy(s.key, t);
            return (
              <Reveal key={s.key}>
                <Split flip={i % 2 === 1} eyebrow={s.name} title={L(s.tagline, locale)} text={L(s.description, locale)} bullets={copy?.features.slice(0, 3).map(([title]) => title)}
                  cta={<>
                    <a className="btn btn-primary" href={p(`/software/${s.key}`)}>{t('Découvrir')} <ArrowRight size={16} aria-hidden /></a>
                    {from !== null && <span className="self-center text-fg-soft">{t('dès')} <strong className="text-fg">{formatMoney(from, currency, locale)}</strong> {t('/ mois')}</span>}
                  </>}
                  visual={s.key === 'pointage'
                    ? <div className="relative flex items-end justify-center gap-0"><BrowserFrame src="/images/software/pointage-team.png" alt={t('Écran de {name}', { name: s.name })} className="w-full" /><PhoneFrame src="/images/software/pointage-mobile.png" alt={t('{name} sur mobile', { name: s.name })} className="-ml-24 mb-[-18px] hidden w-[170px]! sm:block" /></div>
                    : <BrowserFrame src={`/images/software/${s.key}-pipeline.png`} alt={t('Écran de {name}', { name: s.name })} />} />
              </Reveal>
            );
          })}
        </div>
        {saasSoon.length > 0 && (
          <div className="mt-14">
            <p className="eyebrow mb-4">{t('En préparation')}</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {saasSoon.map((s) => <li key={s.key} className="panel p-4"><p className="font-semibold">{s.name}</p><p className="muted mt-1 text-sm">{L(s.tagline, locale)}</p></li>)}
            </ul>
          </div>
        )}
      </Section>

      {/* Benefits */}
      <Section eyebrow={t('Pourquoi Athana')} title={t('Une équipe technique, un résultat professionnel')}>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Reveal key={b.title} className="border-t border-line-strong pt-5">
              <h3 className="text-xl font-semibold">{b.title}</h3>
              <p className="muted mt-2 text-[0.95rem]">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Process: dark band for rhythm */}
      <section className="section-dark py-14 md:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-2xl md:mb-14">
            <p className="eyebrow mb-3">{t('Comment ça marche')}</p>
            <h2 className="h-section">{t('De la commande à la mise en ligne, en quatre étapes')}</h2>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], i) => (
              <li key={title} className="bg-ink-950 p-6 md:p-7">
                <span className="font-display text-sm font-medium text-accent-300">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="muted mt-2 text-[0.95rem]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

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

      {/* Contact */}
      <Section id="contact" eyebrow={t('Contact')} title={t('Une question ? Écrivez-nous.')} className="border-t border-line bg-ink-900">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <ul className="space-y-3 text-fg-soft">
            {[t('Réponse par une personne de l’équipe, pas par un robot.'), t('Conseil sur la solution la plus adaptée à votre budget.'), t('Devis gratuit et sans engagement.')].map((x) => (
              <li key={x} className="flex gap-3"><Check size={18} className="mt-1 shrink-0 text-accent-600" aria-hidden />{x}</li>
            ))}
            <li className="pt-4 text-sm"><a className="text-accent-700 underline" href={`mailto:${company.email}`}>{company.email}</a>{company.phone && <> · <a className="hover:text-accent-700" href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></>}</li>
          </ul>
          <div className="card card-pad"><LeadForm kind="contact" compact /></div>
        </div>
      </Section>

      <CtaBand title={t('Prêt à lancer votre projet ?')} lead={t('Achetez un modèle en ligne ou décrivez-nous votre besoin : nous revenons vers vous avec une proposition.')}>
        <a className="btn btn-primary btn-lg" href={p('/templates')}>{t('Acheter un site')}</a>
        <a className="btn btn-outline btn-lg" href={p('/quote')}>{t('Demander un devis')}</a>
      </CtaBand>
    </>
  );
}
