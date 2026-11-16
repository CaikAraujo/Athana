'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { Link, useLocale, useT } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { Logo } from '@/components/site/Logo';
import { logoutAction } from '@/modules/auth/actions';

export type NavItem = { href: string; label: string; icon?: React.ReactNode; exact?: boolean };
export type NavGroup = { title?: string; items: NavItem[] };

/**
 * Shared shell for every authenticated area (client account, admin, CRM, Pointage and future products):
 * sidebar on desktop, drawer on mobile, top bar with context switcher slot.
 */
export function AppShell({ product, groups, user, topSlot, unread = 0, notificationsHref = '/account/notifications', children }: {
  product: string; groups: NavGroup[]; user: { name: string; email: string }; topSlot?: React.ReactNode; unread?: number; notificationsHref?: string; children: React.ReactNode;
}) {
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const isActive = (item: NavItem) => {
    const target = localePath(locale, item.href);
    return item.exact ? pathname === target : pathname === target || pathname.startsWith(target + '/');
  };
  const nav = (
    <nav aria-label={product} className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {groups.map((g, i) => (
        <div key={i}>
          {g.title && <p className="muted mb-1.5 px-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em]">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link" aria-current={isActive(item) ? 'page' : undefined}>{item.icon}{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
  const footer = (
    <div className="border-t border-line p-3">
      <div className="px-2 pb-2">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="muted truncate text-xs">{user.email}</p>
      </div>
      <form action={logoutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="nav-link w-full cursor-pointer"><LogOut size={16} aria-hidden />{t('Se déconnecter')}</button>
      </form>
    </div>
  );
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="no-print sticky top-0 hidden h-dvh flex-col border-r border-line bg-ink-900 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <Link href="/" className="no-underline"><Logo size={24} /></Link>
        </div>
        <p className="eyebrow px-5 pt-4">{product}</p>
        {nav}
        {footer}
      </aside>
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-ink-950/90 px-4 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="btn btn-ghost btn-sm lg:hidden" aria-label={t('Menu')} aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20} /></button>
            <span className="eyebrow truncate lg:hidden">{product}</span>
            <div className="hidden min-w-0 lg:block">{topSlot}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="lg:hidden">{topSlot}</div>
            <Link href={notificationsHref} className="btn btn-ghost btn-sm relative" aria-label={t('Notifications')}>
              <Bell size={18} aria-hidden />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-black">{unread > 9 ? '9+' : unread}</span>}
            </Link>
          </div>
        </header>
        <main id="main" className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t('Menu')}>
          <button type="button" className="absolute inset-0 bg-black/70" aria-label={t('Fermer')} onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[82%] max-w-xs flex-col border-r border-line bg-ink-900">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo size={24} />
              <button type="button" className="btn btn-ghost btn-sm" aria-label={t('Fermer')} onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
