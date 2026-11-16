import { BarChart3, Building2, CalendarClock, CalendarDays, ClipboardCheck, Clock, History, Plane, Settings, ShieldCheck, UserCog, Users } from 'lucide-react';
import { AppShell, type NavGroup } from '@/components/app/AppShell';
import { Badge, Empty } from '@/components/ui';
import { getUser } from '@/modules/auth/session';
import { unreadNotifications } from '@/modules/pointage/service';
import { ROLE_LABELS } from '@/modules/pointage/labels';
import { BASE, atLeast, pointagePage } from './_components/server';

export const metadata = { title: 'ATHANA Pointage', robots: { index: false } };

export default async function PointageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { ctx, actor, t } = await pointagePage(params);
  const [user, unread] = await Promise.all([getUser(), unreadNotifications(ctx)]);
  const icon = { size: 16, 'aria-hidden': true } as const;

  // The navigation differs per role: employee → manager → admin.
  const groups: NavGroup[] = [];
  if (actor.role !== 'NONE') {
    groups.push({
      items: [
        { href: BASE, label: actor.employee ? t('Pointer') : t('Tableau de bord'), icon: <Clock {...icon} />, exact: true },
        ...(actor.employee ? [
          { href: `${BASE}/history`, label: t('Mon historique'), icon: <History {...icon} /> },
          { href: `${BASE}/absences`, label: t('Mes absences'), icon: <Plane {...icon} /> },
        ] : []),
      ],
    });
  }
  if (atLeast(actor, 'MANAGER')) {
    groups.push({
      title: t('Équipe'),
      items: [
        { href: `${BASE}/team`, label: t('Équipe'), icon: <Users {...icon} /> },
        { href: `${BASE}/approvals`, label: t('Absences à valider'), icon: <ClipboardCheck {...icon} /> },
        { href: `${BASE}/calendar`, label: t('Calendrier'), icon: <CalendarDays {...icon} /> },
        { href: `${BASE}/reports`, label: t('Rapports'), icon: <BarChart3 {...icon} /> },
      ],
    });
  }
  if (actor.role === 'ADMIN') {
    groups.push({
      title: t('Administration'),
      items: [
        { href: `${BASE}/employees`, label: t('Employés'), icon: <UserCog {...icon} /> },
        { href: `${BASE}/departments`, label: t('Départements'), icon: <Building2 {...icon} /> },
        { href: `${BASE}/schedules`, label: t('Horaires'), icon: <CalendarClock {...icon} /> },
        { href: `${BASE}/audit`, label: t('Audit'), icon: <ShieldCheck {...icon} /> },
        { href: `${BASE}/settings`, label: t('Paramètres'), icon: <Settings {...icon} /> },
      ],
    });
  }
  groups.push({ items: [{ href: '/account', label: t('Mon compte') }] });

  const topSlot = (
    <div className="flex min-w-0 items-center gap-2">
      <span className="max-w-[40vw] truncate text-sm font-medium lg:max-w-xs">{ctx.organization.name}</span>
      {actor.role !== 'NONE' && <span className="hidden sm:inline"><Badge tone="gold">{t(ROLE_LABELS[actor.role])}</Badge></span>}
    </div>
  );

  return (
    <AppShell product="ATHANA Pointage" groups={groups} user={{ name: user?.name ?? '', email: user?.email ?? '' }} topSlot={topSlot} unread={unread}>
      {actor.role === 'NONE' ? (
        <Empty title={t('Votre compte n’est pas lié à une fiche employé.')}>
          {t('Demandez à un administrateur de {organization} de créer votre fiche employé et de vous inviter avec cette adresse e-mail : {email}.', { organization: ctx.organization.name, email: user?.email ?? '' })}
        </Empty>
      ) : children}
    </AppShell>
  );
}
