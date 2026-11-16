import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Hammer, Leaf, PackageCheck, Recycle } from 'lucide-react';
import type { DemoMeta } from '../types';
import { CartProvider, Header } from './cart';
import { BASE, findProduct, href, ProductArt, PRODUCTS } from './data';
import { CartPage, Featured, ProductDetail, ShopGrid } from './shop';

export const meta: DemoMeta = {
  slug: 'boutique-nord',
  name: 'Boutique Nord',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'boutique', label: 'Boutique' },
    { key: 'produit', label: 'Produit' },
    { key: 'panier', label: 'Panier' },
    { key: 'a-propos', label: 'À propos' },
  ],
};

const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const eyebrow = 'text-xs uppercase tracking-[0.25em] text-[#5d5c56]';
const cta = 'inline-flex items-center gap-2 bg-[#20201d] px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#3b5166]';

function HomePage() {
  const hero = findProduct('halo') ?? PRODUCTS[0];
  const side = findProduct('sten') ?? PRODUCTS[0];
  return (
    <>
      <section className={`${wrap} grid gap-6 py-8 md:grid-cols-[1.1fr_1fr] md:items-stretch md:py-12`}>
        <div className="flex flex-col justify-between bg-[#3b5166] p-8 text-[#f4f1ea] sm:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#f4f1ea]/80">Collection d’automne</p>
          <div className="mt-16 md:mt-32">
            <h1 className="text-5xl font-light leading-[1.02] tracking-tight sm:text-7xl">Des objets calmes pour des maisons vivantes.</h1>
            <p className="mt-6 max-w-md text-lg font-light text-[#f4f1ea]/90">Luminaires, petit mobilier et arts de la table dessinés à Lausanne, fabriqués en petites séries.</p>
            <Link href={href('boutique')} className="mt-8 inline-flex items-center gap-2 bg-[#f4f1ea] px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-[#20201d] transition-colors hover:bg-white">
              Découvrir la collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
          <Link href={`${href('produit')}?p=${hero.id}`} className="group relative block overflow-hidden">
            <ProductArt product={hero} className="aspect-square w-full transition-transform duration-700 group-hover:scale-105 md:aspect-[4/3]" />
            <span className="absolute bottom-3 left-3 bg-white px-3 py-1.5 text-xs uppercase tracking-[0.15em]">{hero.name} — {hero.kind}</span>
          </Link>
          <Link href={`${href('produit')}?p=${side.id}`} className="group relative block overflow-hidden">
            <ProductArt product={side} color={side.variants[1].hex} className="aspect-square w-full transition-transform duration-700 group-hover:scale-105 md:aspect-[4/3]" />
            <span className="absolute bottom-3 left-3 bg-white px-3 py-1.5 text-xs uppercase tracking-[0.15em]">{side.name} — {side.kind}</span>
          </Link>
        </div>
      </section>

      <section className={`${wrap} py-14`}>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">Les indispensables</h2>
          <Link href={href('boutique')} className="text-sm uppercase tracking-[0.15em] underline underline-offset-4">Tout voir</Link>
        </div>
        <div className="mt-8"><Featured ids={['fjord', 'birk', 'kopp', 'ull']} /></div>
      </section>

      <section className="border-y border-[#20201d]/15">
        <ul className={`${wrap} grid divide-y divide-[#20201d]/15 md:grid-cols-3 md:divide-x md:divide-y-0`}>
          {[
            { icon: Hammer, t: 'Petites séries', d: 'Chaque objet est produit en quantité limitée, par des ateliers que nous visitons.' },
            { icon: Leaf, t: 'Matières durables', d: 'Bois massif, grès, laine, verre : des matériaux qui se patinent et se réparent.' },
            { icon: PackageCheck, t: 'Emballage sans plastique', d: 'Carton recyclé et papier kraft, pensés pour être réutilisés.' },
          ].map((f) => (
            <li key={f.t} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <f.icon className="h-6 w-6 text-[#3b5166]" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-medium uppercase tracking-[0.18em]">{f.t}</h3>
              <p className="mt-2 text-[#5d5c56]">{f.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${wrap} grid gap-8 py-16 md:grid-cols-2 md:items-center`}>
        <div className="grid grid-cols-2 gap-4">
          <ProductArt product={findProduct('ull') ?? PRODUCTS[0]} color="#b4735a" className="aspect-[3/4] w-full" />
          <ProductArt product={findProduct('lys') ?? PRODUCTS[0]} className="mt-10 aspect-[3/4] w-full" />
        </div>
        <div className="md:pl-10">
          <p className={eyebrow}>L’atelier</p>
          <h2 className="mt-3 text-4xl font-light tracking-tight">Moins d’objets, mieux choisis.</h2>
          <p className="mt-4 text-[#3c3b37]">Nord est né d’une conviction simple : on vit mieux entouré de peu de choses, à condition qu’elles soient justes. Nous dessinons chaque pièce pour qu’elle traverse les déménagements et les modes.</p>
          <Link href={href('a-propos')} className={`${cta} mt-7`}>Notre démarche</Link>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <section className={`${wrap} py-14 sm:py-20`}>
        <p className={eyebrow}>À propos</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-light leading-[1.05] tracking-tight sm:text-7xl">Un petit studio, une idée fixe : l’essentiel.</h1>
      </section>
      <section className={`${wrap} grid gap-10 border-t border-[#20201d]/15 py-14 md:grid-cols-[1fr_2fr]`}>
        <h2 className="text-sm font-medium uppercase tracking-[0.2em]">Notre histoire</h2>
        <div className="space-y-5 text-lg font-light leading-relaxed text-[#3c3b37]">
          <p>Boutique Nord est une marque fictive de design pour la maison, imaginée à Lausanne. Son catalogue est volontairement court : une vingtaine d’objets, retravaillés d’année en année plutôt que remplacés.</p>
          <p>Nous dessinons les pièces en interne et confions leur fabrication à des ateliers spécialisés — tournage sur bois, céramique, tissage — avec lesquels nous travaillons dans la durée.</p>
        </div>
      </section>
      <section className="bg-[#20201d] text-[#f4f1ea]">
        <div className={`${wrap} py-16`}>
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[#d9a441]">Trois principes</h2>
          <ol className="mt-8 grid gap-10 md:grid-cols-3">
            {[
              ['Dessiner juste', 'Une forme simple, des proportions travaillées longtemps, aucun détail décoratif inutile.'],
              ['Fabriquer près', 'Des ateliers à taille humaine, des séries courtes et des matières dont on connaît l’origine.'],
              ['Faire durer', 'Pièces détachées disponibles, conseils d’entretien fournis et réparations possibles.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <span className="text-6xl font-extralight text-[#f4f1ea]/40">0{i + 1}</span>
                <h3 className="mt-3 text-2xl font-light">{t}</h3>
                <p className="mt-2 text-[#f4f1ea]/75">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className={`${wrap} grid gap-10 py-16 md:grid-cols-[1fr_2fr]`}>
        <h2 className="text-sm font-medium uppercase tracking-[0.2em]">Questions fréquentes</h2>
        <div className="divide-y divide-[#20201d]/15 border-y border-[#20201d]/15">
          {[
            ['Où livrez-vous ?', 'En Suisse et au Liechtenstein. La livraison est offerte dès CHF 150.– d’achat, sinon elle coûte CHF 9.–.'],
            ['Puis-je retourner un article ?', 'Oui, dans les 30 jours suivant la réception, dans son emballage d’origine.'],
            ['Comment entretenir le bois ?', 'Un chiffon légèrement humide suffit. Une fois par an, appliquez une huile naturelle incolore.'],
            ['Proposez-vous des cartes cadeaux ?', 'Oui, sur demande par e-mail, pour le montant de votre choix.'],
          ].map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-2xl font-light transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-xl text-[#5d5c56]">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className={`${wrap} pb-16`}>
        <div className="flex flex-col items-start justify-between gap-6 bg-[#e3e6df] p-8 sm:flex-row sm:items-center sm:p-12">
          <div className="flex items-start gap-4">
            <Recycle className="h-8 w-8 shrink-0 text-[#3b5166]" aria-hidden="true" />
            <p className="max-w-lg text-xl font-light">Un objet abîmé ? Écrivez-nous avant de le remplacer : la plupart des pièces se réparent.</p>
          </div>
          <Link href={href('boutique')} className={cta}>Voir la boutique</Link>
        </div>
      </section>
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const current = meta.pages.some((p) => p.key === page) ? page : '';
  return (
    <div className="bn-root min-h-screen bg-[#f4f1ea] font-sans text-[#20201d]">
      <style>{`.bn-root h1,.bn-root h2,.bn-root h3{font-family:inherit}.bn-root :focus-visible{outline:2px solid #3b5166;outline-offset:3px;border-radius:0}.bn-root ::selection{background:#3b5166;color:#fff}`}</style>
      <CartProvider>
        <a href="#bn-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">Aller au contenu</a>
        <Header pages={meta.pages} current={current} />
        <main id="bn-main">
          {current === 'boutique' ? (
            <section className={`${wrap} py-10`}>
              <p className={eyebrow}>Boutique</p>
              <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">Toute la collection</h1>
              <p className="mt-3 max-w-xl text-[#5d5c56]">Neuf objets pour la maison. Prix en francs suisses, TVA incluse.</p>
              <div className="mt-8"><ShopGrid /></div>
            </section>
          ) : current === 'produit' ? (
            <Suspense fallback={<p className="py-24 text-center text-[#5d5c56]">Chargement…</p>}>
              <ProductDetail />
            </Suspense>
          ) : current === 'panier' ? (
            <section className={`${wrap} py-10`}>
              <p className={eyebrow}>Commande</p>
              <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">Votre panier</h1>
              <div className="mt-8"><CartPage /></div>
            </section>
          ) : current === 'a-propos' ? (
            <AboutPage />
          ) : (
            <HomePage />
          )}
        </main>
        <footer className="border-t border-[#20201d]/15">
          <div className={`${wrap} grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4`}>
            <div>
              <p className="text-xl font-light uppercase tracking-[0.35em]">Nord<span className="text-[#b07a1c]">.</span></p>
              <p className="mt-3 text-sm text-[#5d5c56]">Objets pour la maison, dessinés à Lausanne.</p>
            </div>
            <nav aria-label="Pied de page">
              <p className="text-xs font-medium uppercase tracking-[0.2em]">Boutique</p>
              <ul className="mt-3 space-y-2 text-sm text-[#5d5c56]">
                {meta.pages.filter((p) => p.key !== 'produit').map((p) => <li key={p.key}><Link href={p.key ? `${BASE}/${p.key}` : BASE} className="hover:text-[#20201d] hover:underline">{p.label}</Link></li>)}
              </ul>
            </nav>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em]">Contact</p>
              <address className="mt-3 space-y-1 text-sm not-italic text-[#5d5c56]">
                <p>Rue de l’Exemple 12, 1000 Lausanne</p>
                <p>+41 00 000 00 00</p>
                <p>bonjour@boutique-nord.example.ch</p>
              </address>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em]">Service</p>
              <ul className="mt-3 space-y-1 text-sm text-[#5d5c56]">
                <li>Livraison en Suisse sous 2 à 4 jours</li>
                <li>Retours sous 30 jours</li>
              </ul>
            </div>
          </div>
          <p className="border-t border-[#20201d]/15 py-5 text-center text-xs text-[#5d5c56]">© {new Date().getFullYear()} Boutique Nord — marque fictive.</p>
        </footer>
      </CartProvider>
    </div>
  );
}
