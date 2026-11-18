'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, ShoppingBag, User } from 'lucide-react';
import { Link, useLocale, useT } from '@/i18n/client';
import { LOCALES, LOCALE_META, switchLocalePath } from '@/i18n/config';
import { Logo } from './Logo';

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useT();
  return (
    <label className="relative inline-flex items-center gap-1.5 text-sm text-fg-soft">
      <Globe size={16} aria-hidden />
      <span className="sr-only">{t('Langue et pays')}</span>
      <select
        aria-label={t('Langue et pays')}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-sm text-fg-soft hover:text-fg focus:outline-none"
        value={locale}
        onChange={(e) => {
          const to = e.target.value as (typeof LOCALES)[number];
          // Remember the explicit choice so automatic detection never overrides it.
          document.cookie = `athana_locale=${to}; path=/; max-age=31536000; samesite=lax`;
          window.location.assign(switchLocalePath(pathname, to) + window.location.search);
        }}
      >
        {LOCALES.map((l) => <option key={l} value={l} className="bg-ink-850 text-fg">{compact ? l.toUpperCase() : LOCALE_META[l].label}</option>)}
      </select>
    </label>
  );
}

export function HeaderClient({ cartCount, signedIn, isStaff }: { cartCount: number; signedIn: boolean; isStaff: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const nav = [
    { href: '/templates', label: t('Modèles de sites') },
    { href: '/ecommerce', label: t('E-commerce') },
    { href: '/software', label: t('Logiciels') },
    { href: '/automation', label: t('Automatisation') },
    { href: '/custom', label: t('Sur mesure') },
  ];
  return (
    <header className={`no-print sticky top-0 z-40 border-b transition-colors ${scrolled || open ? 'border-line bg-ink-950/85 backdrop-blur-md' : 'border-transparent bg-ink-950/0'}`}>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 no-underline"><Logo /></Link>
        <nav aria-label={t('Navigation principale')} className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-fg-soft no-underline transition-colors hover:bg-black/5 hover:text-fg">{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-1.5">
          <div className="hidden md:block"><LanguageSwitcher compact /></div>
          <Link href="/cart" className="btn btn-ghost btn-sm relative" aria-label={t('Panier')}>
            <ShoppingBag size={18} aria-hidden />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
          <Link href={signedIn ? (isStaff ? '/admin' : '/account') : '/login'} className="btn btn-ghost btn-sm" aria-label={signedIn ? t('Mon compte') : t('Connexion')}>
            <User size={18} aria-hidden /><span className="hidden xl:inline">{signedIn ? t('Mon compte') : t('Connexion')}</span>
          </Link>
          <Link href="/quote" className="btn btn-primary btn-sm hidden sm:inline-flex">{t('Demander un devis')}</Link>
          <button type="button" className="btn btn-ghost btn-sm lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={t('Menu')} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label={t('Navigation principale')} className="container-page flex flex-col gap-1 border-t border-line pb-6 pt-3 lg:hidden">
          {nav.map((n) => <Link key={n.href} href={n.href} className="rounded-lg px-3 py-3 text-base text-fg no-underline hover:bg-black/5">{n.label}</Link>)}
          <Link href="/contact" className="rounded-lg px-3 py-3 text-base text-fg no-underline hover:bg-black/5">{t('Contact')}</Link>
          <div className="mt-3 flex items-center justify-between gap-3 px-3">
            <LanguageSwitcher />
            <Link href="/quote" className="btn btn-primary btn-sm">{t('Demander un devis')}</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
