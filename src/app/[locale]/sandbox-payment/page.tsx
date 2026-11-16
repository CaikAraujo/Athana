import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { assertLocale, getT } from '@/i18n/server';
import { formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { subscriptionAmount } from '@/modules/billing/service';
import { Logo } from '@/components/site/Logo';
import { SandboxButtons } from './SandboxButtons';

export const metadata = { robots: { index: false } };
export const dynamic = 'force-dynamic';

/**
 * Stand-in for the hosted payment page when PAYMENTS_MODE=test.
 * It is unmistakably labelled as a test and does not exist when a real provider is configured.
 */
export default async function SandboxPaymentPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ kind?: string; ref?: string; session?: string }> }) {
  if (env.paymentsMode !== 'test') notFound();
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const { kind, ref, session } = await searchParams;
  const t = await getT(locale);
  let label = '';
  let amount = '';
  if (kind === 'order') {
    const order = await db.order.findFirst({ where: { id: ref, userId: user.id, providerSessionId: session } });
    if (!order) notFound();
    label = t('Commande {n}', { n: order.number });
    amount = formatMoney(order.total, order.currency, locale);
  } else if (kind === 'subscription') {
    const sub = await db.subscription.findFirst({ where: { id: ref, organization: { memberships: { some: { userId: user.id } } } }, include: { plan: true, saasProduct: true } });
    if (!sub) notFound();
    label = `${sub.saasProduct.name} ${sub.plan.name}`;
    amount = `${formatMoney(subscriptionAmount(sub.plan, sub.currency, sub.seats), sub.currency, locale)} ${t('/ mois')}`;
  } else notFound();
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-ink-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="card card-pad text-center">
          <p className="badge badge-warn mx-auto">{t('PAIEMENT DE TEST — AUCUN DÉBIT RÉEL')}</p>
          <h1 className="mt-4 text-2xl font-semibold">{label}</h1>
          <p className="mt-2 font-display text-4xl font-semibold">{amount}</p>
          <p className="muted mt-4 text-sm">{t('Cette page remplace le prestataire de paiement tant que ses identifiants ne sont pas configurés. Elle permet de tester le parcours complet sans mouvement d’argent.')}</p>
          <SandboxButtons kind={kind!} refId={ref!} session={session!} />
        </div>
      </div>
    </main>
  );
}
