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
import { BrowserFrame, Split } from '@/components/site/Showcase';
import { HeroStage, type HeroItem } from '@/components/site/HeroStage';
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
  const site = [...featured, ...all].find((x) => x.coverImage && x.slug !== 'boutique-nord');
  const shop = all.find((x) => x.slug === 'boutique-nord' && x.coverImage);
  const heroItems: HeroItem[] = [
    ...(site ? [{ key: 'site', label: t('Site web'), phrase: t('votre site web.'), src: site.coverImage!, alt: t('Aperçu du modèle {name}', { name: site.name }) }] : []),
    ...(shop ? [{ key: 'shop', label: t('Boutique'), phrase: t('votre boutique en ligne.'), src: shop.coverImage!, alt: t('Aperçu du modèle {name}', { name: shop.name }) }] : []),
    ...saasActive.map((x) => ({ key: x.key, label: x.key === 'crm' ? 'CRM' : t('Pointage'), phrase: x.key === 'crm' ? t('votre CRM.') : t('votre pointage d’équipe.'), src: `/images/software/${x.key === 'pointage' ? 'pointage-team' : `${x.key}-pipeline`}.png`, alt: t('Écran de {name}', { name: x.name }) })),
  ];

  const entries = [
    { icon: Globe, title: t('Sites Web'), text: t('Des modèles professionnels personnalisés à votre marque, livrés en quelques jours.'), href: '/templates', cta: t('Voir les modèles') },
    { icon: ShoppingCart, title: t('E-commerce'), text: t('Une boutique en ligne complète : catalogue, panier, paiement et gestion des commandes.'), href: '/ecommerce', cta: t('Créer ma boutique') },
    { icon: AppWindow, title: t('Logiciels'), text: t('CRM, pointage et outils de gestion en abonnement, prêts à l’emploi.'), href: '/software', cta: t('Voir les logiciels') },
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

      <HeroStage prefix={t('Lancez')} items={heroItems} tabsLabel={t('Nos solutions')}>
        <p className="lead mt-6 max-w-[34ch]">{t('Sites web, boutiques en ligne et logiciels de gestion pour les PME. Commandez en ligne, suivez tout depuis votre espace client.')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn btn-primary btn-lg" href={p('/templates')}>{t('Choisir un modèle')} <ArrowRight size={18} aria-hidden /></a>
          <a className="btn btn-outline btn-lg" href={p('/quote')}>{t('Demander un devis')}</a>
        </div>
        <dl className="hero-facts">
          <div><dd>{all.length}</dd><dt className="eyebrow">{t('Modèles disponibles')}</dt></div>
          {minPrice !== null && <div><dd>{formatMoney(minPrice, currency, locale)}</dd><dt className="eyebrow">{t('Site à partir de')}</dt></div>}
          {minDays !== null && <div><dd>{t('{n} jours', { n: minDays })}</dd><dt className="eyebrow">{t('Livraison dès')}</dt></div>}
        </dl>
      </HeroStage>

      {/* Four entries */}
      <Section title={t('Quatre façons de démarrer')} className="screen--surface">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((e) => (
            <a key={e.href} href={p(e.href)} className="card card-hover group flex min-h-[260px] flex-col p-6 no-underline">
              <e.icon size={24} strokeWidth={1.5} className="text-accent-700" aria-hidden />
              <h3 className="mt-8 text-[1.5rem]!">{e.title}</h3>
              <p className="mt-2 text-fg-soft">{e.text}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 font-medium">{e.cta} <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden /></span>
            </a>
          ))}
        </div>
      </Section>

      {/* Featured templates */}
      <Section title={t('Des modèles prêts à devenir votre site')} lead={t('Chaque modèle possède une démonstration navigable. Vous voyez le résultat avant d’acheter.')}
        action={<a className="btn btn-outline" href={p('/templates')}>{t('Voir tous les modèles')} <ArrowRight size={16} aria-hidden /></a>}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((prod, i) => <ProductCard key={prod.id} product={prod} locale={locale} currency={currency} t={t} priority={i === 0} />)}
        </div>
      </Section>

      {/* Software: real product screens, text always on the left */}
      <Section title={t('Nos logiciels en abonnement')} lead={t('Des outils de gestion simples, hébergés pour vous, sans installation.')} className="screen--surface">
        <div className="space-y-20 md:space-y-28">
          {saasActive.map((s) => {
            const from = s.plans[0] ? priceFor(s.plans[0].prices, currency) : null;
            const copy = saasCopy(s.key, t);
            return (
              <Reveal key={s.key}>
                <Split eyebrow={s.name} title={L(s.tagline, locale)} text={L(s.description, locale)} bullets={copy?.features.slice(0, 3).map(([title]) => title)}
                  cta={<>
                    <a className="btn btn-primary" href={p(`/software/${s.key}`)}>{t('Voir {name}', { name: s.name })} <ArrowRight size={16} aria-hidden /></a>
                    {from !== null && <span className="text-fg-soft">{t('dès')} <strong className="font-medium text-fg">{formatMoney(from, currency, locale)}</strong> {t('/ mois')}</span>}
                  </>}
                  visual={<BrowserFrame src={`/images/software/${s.key === 'pointage' ? 'pointage-team' : `${s.key}-pipeline`}.png`} alt={t('Écran de {name}', { name: s.name })} />} />
              </Reveal>
            );
          })}
        </div>
        {saasSoon.length > 0 && (
          <div className="mt-20">
            <p className="eyebrow mb-4">{t('En préparation')}</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {saasSoon.map((s) => <li key={s.key} className="panel p-5"><p className="font-medium">{s.name}</p><p className="mt-1 text-sm text-fg-soft">{L(s.tagline, locale)}</p></li>)}
            </ul>
          </div>
        )}
      </Section>

      {/* Benefits */}
      <Section title={t('Une équipe technique, un résultat professionnel')}>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Reveal key={b.title}>
              <b.icon size={24} strokeWidth={1.5} className="text-accent-700" aria-hidden />
              <h3 className="mt-5 text-[1.5rem]!">{b.title}</h3>
              <p className="mt-2 text-fg-soft">{b.text}</p>
            </Reveal>
          ))}
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

      {/* Contact */}
      <Section id="contact" title={t('Une question ? Écrivez-nous.')} className="screen--surface">
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
