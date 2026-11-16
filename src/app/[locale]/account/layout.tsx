import { LayoutDashboard, User, Building2, ShoppingBag, CreditCard, FileText, FolderKanban, Bell, LifeBuoy, Repeat, History, Shield, AppWindow } from 'lucide-react';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireUser } from '@/modules/auth/session';
import { AppShell } from '@/components/app/AppShell';

export const metadata = { robots: { index: false } };

export default async function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale, '/account');
  const t = await getT(locale);
  const [unread, subs] = await Promise.all([
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.subscription.findMany({ where: { organization: { memberships: { some: { userId: user.id } } }, status: { not: 'CANCELED' } }, select: { saasProductKey: true, saasProduct: { select: { name: true } } }, distinct: ['saasProductKey'] }),
  ]);
  const i = (I: typeof User) => <I size={16} aria-hidden />;
  return (
    <AppShell product={t('Espace client')} user={{ name: user.name, email: user.email }} unread={unread} groups={[
      { items: [{ href: '/account', label: t('Tableau de bord'), icon: i(LayoutDashboard), exact: true }, { href: '/account/projects', label: t('Projets'), icon: i(FolderKanban) }, { href: '/account/orders', label: t('Commandes'), icon: i(ShoppingBag) }] },
      { title: t('Facturation'), items: [{ href: '/account/payments', label: t('Paiements'), icon: i(CreditCard) }, { href: '/account/invoices', label: t('Factures'), icon: i(FileText) }, { href: '/account/subscriptions', label: t('Abonnements'), icon: i(Repeat) }] },
      ...(subs.length ? [{ title: t('Mes logiciels'), items: subs.map((s) => ({ href: `/app/${s.saasProductKey}`, label: s.saasProduct.name, icon: i(AppWindow) })) }] : []),
      { title: t('Compte'), items: [{ href: '/account/profile', label: t('Mes données'), icon: i(User) }, { href: '/account/companies', label: t('Entreprises'), icon: i(Building2) }, { href: '/account/notifications', label: t('Notifications'), icon: i(Bell) }, { href: '/account/support', label: t('Support'), icon: i(LifeBuoy) }, { href: '/account/activity', label: t('Historique'), icon: i(History) }] },
      ...(user.platformRole ? [{ title: 'ATHANA', items: [{ href: '/admin', label: t('Administration'), icon: i(Shield) }] }] : []),
    ]}>
      {children}
    </AppShell>
  );
}
