import type { Metadata } from 'next';
import { BarChart3, Building2, CalendarDays, CheckSquare, FileText, KanbanSquare, LayoutDashboard, Search, Settings, UserPlus, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { AppShell, type NavGroup } from '@/components/app/AppShell';
import { getUser } from '@/modules/auth/session';
import { requireTenant } from '@/modules/tenancy/guard';
import { DEFAULT_PIPELINE_NAME, DEFAULT_STAGES, ensureOnboarded } from '@/modules/crm/service';

export const metadata: Metadata = { title: 'ATHANA CRM', robots: { index: false, follow: false } };

export default async function CrmLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const ctx = await requireTenant(locale, 'crm');
  const t = await getT(locale);
  await ensureOnboarded(ctx, { pipeline: t(DEFAULT_PIPELINE_NAME), stages: DEFAULT_STAGES.map((s) => t(s.name)) });
  const [user, unread] = await Promise.all([getUser(), db.notification.count({ where: { userId: ctx.userId, readAt: null } })]);

  const groups: NavGroup[] = [
    { items: [
      { href: '/app/crm', label: t('Tableau de bord'), icon: <LayoutDashboard size={16} aria-hidden />, exact: true },
      { href: '/app/crm/search', label: t('Recherche'), icon: <Search size={16} aria-hidden /> },
    ] },
    { title: t('Ventes'), items: [
      { href: '/app/crm/leads', label: t('Leads'), icon: <UserPlus size={16} aria-hidden /> },
      { href: '/app/crm/contacts', label: t('Contacts'), icon: <Users size={16} aria-hidden /> },
      { href: '/app/crm/companies', label: t('Entreprises'), icon: <Building2 size={16} aria-hidden /> },
      { href: '/app/crm/pipeline', label: t('Pipeline'), icon: <KanbanSquare size={16} aria-hidden /> },
      { href: '/app/crm/proposals', label: t('Propositions'), icon: <FileText size={16} aria-hidden /> },
    ] },
    { title: t('Organisation'), items: [
      { href: '/app/crm/tasks', label: t('Tâches'), icon: <CheckSquare size={16} aria-hidden /> },
      { href: '/app/crm/calendar', label: t('Calendrier'), icon: <CalendarDays size={16} aria-hidden /> },
      { href: '/app/crm/reports', label: t('Rapports'), icon: <BarChart3 size={16} aria-hidden /> },
    ] },
    { title: t('Configuration'), items: [
      { href: '/app/crm/settings', label: t('Paramètres'), icon: <Settings size={16} aria-hidden /> },
    ] },
  ];

  return (
    <AppShell
      product="ATHANA CRM" groups={groups} unread={unread}
      user={{ name: user?.name ?? '', email: user?.email ?? '' }}
      topSlot={<span className="block max-w-[38vw] truncate text-sm font-medium text-fg-soft lg:max-w-none" title={ctx.organization.name}>{ctx.organization.name}</span>}
    >
      {children}
    </AppShell>
  );
}
