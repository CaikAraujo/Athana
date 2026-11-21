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
import { Section, FaqList } from '@/components/site/Section';
import { Reveal } from '@/components/site/Consent';
import { LeadForm } from '@/components/site/LeadForm';
import { BrowserFrame, Split } from '@/components/site/Showcase';
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

  const prices = all.map((x) => priceFor(x.startingPrices, currency)).filter((x): x is number => x !== null);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const minDays = all.length ? Math.min(...all.map((x) => x.deliveryDays)) : null;
  const saasActive = saas.filter((x) => x.status === 'ACTIVE');
  const saasSoon = saas.filter((x) => x.status !== 'ACTIVE');
  const reel = all.filter((x) => x.coverImage);

  const entries = [
    { title: t('Sites Web'), text: t('Des modèles professionnels personnalisés à votre marque, livrés en quelques jours.'), href: '/templates', cta: t('Voir les modèles') },
    { title: t('E-commerce'), text: t('Une boutique en ligne complète : catalogue, panier, paiement et gestion des commandes.'), href: '/ecommerce', cta: t('Créer ma boutique') },
    { title: t('Logiciels'), text: t('CRM, pointage et outils de gestion en abonnement, prêts à l’emploi.'), href: '/software', cta: t('Voir les logiciels') },
    { title: t('Automatisation'), text: t('Vos tâches répétitives automatisées et vos outils connectés entre eux.'), href: '/automation', cta: t('Automatiser mes tâches') },
    { title: t('Sur mesure'), text: t('Applications, plateformes et intégrations conçues pour vos processus.'), href: '/custom', cta: t('Parler de mon projet') },
  ];
  const proofs: [string, string][] = [
    ...(minDays !== null ? [[t('Dès {n} jours ouvrés', { n: minDays }), t('Le délai de chaque modèle est indiqué sur sa fiche, avant la commande.')] as [string, string]] : []),
    [t('Prix affichés'), t('Packs, options et total sont visibles avant le paiement. Pas de devis obligatoire pour un modèle.')],
    [t('Démonstration navigable'), t('Chaque modèle se teste sur ordinateur et sur mobile avant l’achat.')],
    [t('Quatre langues, un seul tarif'), t('Français, allemand, portugais et anglais. Les prix sont les mêmes partout, en francs suisses.')],
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

      {/* Hero: statement on the left, two real templates on the right. */}
      <section className="hero">
        <div className="container-page hero-grid">
          <div data-enter>
            <p className="eyebrow mb-6">{t('Solutions digitales conçues en Suisse')}</p>
            <h1>{minDays !== null ? t('Votre site professionnel en ligne dès {n} jours,', { n: minDays }) : t('Votre site professionnel en ligne,')} <span className="mark">{t('à prix affiché.')}</span></h1>
            <p className="lead mt-6 max-w-[50ch]">{minPrice !== null ? t('Sites web dès {price}, boutiques en ligne et logiciels de gestion pour les PME. Vous testez la démonstration avant d’acheter et suivez chaque étape dans votre espace client.', { price: formatMoney(minPrice, currency, locale) }) : t('Sites web, boutiques en ligne et logiciels de gestion pour les PME. Vous testez la démonstration avant d’acheter et suivez chaque étape dans votre espace client.')}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a className="btn btn-primary btn-lg" href={p('/templates')}>{t('Choisir un modèle')}</a>
              <a className="btn btn-outline btn-lg" href={p('/quote')}>{t('Demander un devis')}</a>
            </div>
          </div>
          {reel.length >= 1 && (
            <div className="hero-visual">
              <BrowserFrame src={reel[0].coverImage!} alt={t('Aperçu du modèle {name}', { name: reel[0].name })} priority sizes="(min-width:1024px) 600px, 100vw" />
              <BrowserFrame src="/images/software/crm-pipeline.png" alt={t('Écran de {name}', { name: 'ATHANA CRM' })} priority sizes="340px" />
            </div>
          )}
        </div>
      </section>

      {/* Four entries */}
      <Section title={t('Ce que nous faisons')} className="screen--surface">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {entries.map((e) => (
            <a key={e.href} href={p(e.href)} className="card card-hover group flex min-h-[210px] flex-col p-5 no-underline">
              <h3 className="text-[1.25rem]!">{e.title}</h3>
              <p className="mt-2 text-fg-soft">{e.text}</p>
              <span className="mt-auto pt-6"><span className="link font-medium text-accent-800">{e.cta}</span></span>
            </a>
          ))}
        </div>
      </Section>

      {/* Featured templates */}
      <Section title={t('Des modèles prêts à devenir votre site')} lead={t('Chaque modèle possède une démonstration navigable. Vous voyez le résultat avant d’acheter.')}
        action={<a className="btn btn-outline" href={p('/templates')}>{t('Voir tous les modèles')}</a>}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((prod, i) => <ProductCard key={prod.id} product={prod} locale={locale} currency={currency} t={t} priority={i === 0} />)}
        </div>
      </Section>

      {/* Software: real product screens, text always on the left */}
      <Section title={t('Nos logiciels en abonnement')} lead={t('Des outils de gestion simples, hébergés pour vous, sans installation.')} className="screen--surface">
        <div className="space-y-20 md:space-y-28">
          {saasActive.map((s, i) => {
            const from = s.plans[0] ? priceFor(s.plans[0].prices, currency) : null;
            const copy = saasCopy(s.key, t);
            return (
              <Reveal key={s.key}>
                <Split flip={i % 2 === 1} eyebrow={s.name} title={L(s.tagline, locale)} text={L(s.description, locale)} bullets={copy?.features.slice(0, 3).map(([title]) => title)}
                  cta={<>
                    <a className="btn btn-primary" href={p(`/software/${s.key}`)}>{t('Voir {name}', { name: s.name })}</a>
                    {from !== null && <span className="text-fg-soft">{t('dès')} <strong className="font-medium text-fg">{formatMoney(from, currency, locale)}</strong> {t('/ mois')}</span>}
                  </>}
                  visual={<BrowserFrame src={`/images/software/${s.key === 'pointage' ? 'pointage-team' : `${s.key}-pipeline`}.png`} alt={t('Écran de {name}', { name: s.name })} />} />
              </Reveal>
            );
          })}
        </div>
        {saasSoon.length > 0 && (
          <p className="mt-16 text-sm text-fg-muted">{t('Prochainement')} : {saasSoon.map((x) => x.name).join(' · ')}. <a className="link text-fg" href={p('/contact')}>{t('Être prévenu du lancement')}</a></p>
        )}
      </Section>

      {/* Why Athana: facts and the real client area */}
      <Section title={t('Vous voyez tout, à chaque étape')} lead={t('Après la commande, votre espace client montre où en est votre projet, ce qui est attendu de vous et ce que vous devez valider.')}>
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
          <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:pr-8">
            {proofs.map(([k, v]) => <div key={k} className="proof"><dt className="font-display text-[1.375rem] font-semibold tracking-tight">{k}</dt><dd className="mt-1 text-fg-soft">{v}</dd></div>)}
          </dl>
          <div className="zoom lg:col-span-7"><BrowserFrame src="/images/software/espace-client.png" alt={t('Suivi d’un projet dans l’espace client')} /></div>
        </div>
      </Section>

      {/* Process: dark ground */}
      <Section title={t('De la commande à la mise en ligne, en quatre étapes')} className="section-dark">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title} className="card min-h-[220px] p-6">
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-8 text-[1.5rem]!">{title}</h3>
              <p className="mt-2 text-fg-soft">{text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Testimonials: only real, published ones are shown. */}
      {testimonials.length > 0 && (
        <Section title={t('Ce que disent nos clients')}>
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
        <Section title={t('Questions fréquentes')}>
          <FaqList items={faqs.map((f) => ({ q: L(f.question, locale), a: L(f.answer, locale) }))} />
          <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: L(f.question, locale), acceptedAnswer: { '@type': 'Answer', text: L(f.answer, locale) } })) }} />
        </Section>
      )}

      {/* Closing: the call to action and the form are one block */}
      <Section id="contact" title={t('Prêt à lancer votre projet ?')} lead={t('Achetez un modèle en ligne ou décrivez-nous votre besoin : nous revenons vers vous avec une proposition.')} className="section-dark">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <ul className="space-y-3 text-fg-soft">
              {[t('Réponse par une personne de l’équipe, pas par un robot.'), t('Conseil sur la solution la plus adaptée à votre budget.'), t('Devis gratuit et sans engagement.')].map((x) => (
                <li key={x} className="flex gap-3"><span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-300" />{x}</li>
              ))}
            </ul>
            <p className="mt-8"><a className="link text-fg" href={`mailto:${company.email}`}>{company.email}</a>{company.phone && <><br /><a className="link text-fg" href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></>}</p>
            <a className="btn btn-primary mt-8" href={p('/templates')}>{t('Voir les modèles')}</a>
          </div>
          <div className="section-light card card-pad"><LeadForm kind="contact" compact /></div>
        </div>
      </Section>
    </>
  );
}
