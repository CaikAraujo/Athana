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
    <label className="site-lang relative inline-flex items-center gap-1.5 text-sm text-fg-soft">
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
    <header className="site-header no-print sticky top-0 z-40" data-solid={scrolled || open}>
      <div className="container-page flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0 no-underline"><Logo size={30} /></Link>
        <nav aria-label={t('Navigation principale')} className="site-nav hidden items-center lg:flex">
          {nav.map((n) => <Link key={n.href} href={n.href} className="no-underline">{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-1">
          <div className="hidden md:block"><LanguageSwitcher compact /></div>
          <Link href="/cart" className="site-icon relative" aria-label={t('Panier')}>
            <ShoppingBag size={19} strokeWidth={1.75} aria-hidden />
            {cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
          <Link href={signedIn ? (isStaff ? '/admin' : '/account') : '/login'} className="site-icon" aria-label={signedIn ? t('Mon compte') : t('Connexion')}>
            <User size={19} strokeWidth={1.75} aria-hidden />
          </Link>
          <Link href="/quote" className="btn btn-primary site-cta ml-2 hidden sm:inline-flex">{t('Demander un devis')}</Link>
          <button type="button" className="site-icon lg:hidden!" aria-expanded={open} aria-controls="mobile-nav" aria-label={t('Menu')} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={21} /> : <Menu size={21} />}
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
