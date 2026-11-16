import { LayoutDashboard, ShoppingBag, FolderKanban, Package, Tags, Puzzle, Users, CreditCard, TicketPercent, Repeat, Layers, Inbox, LifeBuoy, FileText, Settings, ListChecks, ScrollText, ShieldAlert } from 'lucide-react';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { can, type Permission } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { AppShell, type NavGroup, type NavItem } from '@/components/app/AppShell';

export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireStaff(locale, 'dashboard.view');
  const t = await getT(locale);
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });
  const i = (I: typeof Users) => <I size={16} aria-hidden />;
  // The menu mirrors backend permissions; every page and action re-checks them on the server.
  const item = (perm: Permission, it: NavItem) => (can(user.platformRole, perm) ? [it] : []);
  const groups: NavGroup[] = [
    { items: [{ href: '/admin', label: t('Tableau de bord'), icon: i(LayoutDashboard), exact: true }, { href: '/admin/tasks', label: t('Tâches'), icon: i(ListChecks) }] },
    { title: t('Ventes'), items: [...item('orders.view', { href: '/admin/orders', label: t('Commandes'), icon: i(ShoppingBag) }), ...item('projects.view', { href: '/admin/projects', label: t('Projets'), icon: i(FolderKanban) }), ...item('customers.view', { href: '/admin/customers', label: t('Clients'), icon: i(Users) }), ...item('leads.view', { href: '/admin/leads', label: t('Leads'), icon: i(Inbox) }), ...item('support.manage', { href: '/admin/support', label: t('Support'), icon: i(LifeBuoy) })] },
    { title: t('Catalogue'), items: [...item('catalog.manage', { href: '/admin/products', label: t('Produits'), icon: i(Package) }), ...item('catalog.manage', { href: '/admin/categories', label: t('Catégories'), icon: i(Tags) }), ...item('catalog.manage', { href: '/admin/addons', label: t('Options'), icon: i(Puzzle) })] },
    { title: t('Finance'), items: [...item('finance.view', { href: '/admin/finance', label: t('Paiements & rapports'), icon: i(CreditCard) }), ...item('saas.manage', { href: '/admin/subscriptions', label: t('Abonnements'), icon: i(Repeat) }), ...item('saas.manage', { href: '/admin/plans', label: t('Logiciels & plans'), icon: i(Layers) }), ...item('marketing.manage', { href: '/admin/coupons', label: t('Coupons'), icon: i(TicketPercent) })] },
    { title: t('Plateforme'), items: [...item('content.manage', { href: '/admin/content', label: t('Contenu'), icon: i(FileText) }), ...item('settings.manage', { href: '/admin/settings', label: t('Paramètres'), icon: i(Settings) }), ...item('customers.manage', { href: '/admin/data-requests', label: t('Demandes RGPD'), icon: i(ShieldAlert) }), ...item('audit.view', { href: '/admin/audit', label: t('Journal d’audit'), icon: i(ScrollText) })] },
  ].filter((g) => g.items.length);
  return <AppShell product={t('Administration')} groups={groups} user={{ name: user.name, email: user.email }} unread={unread} notificationsHref="/account/notifications">{children}</AppShell>;
}
