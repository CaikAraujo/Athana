import type { OrderStatus, PaymentStatus, ProjectStatus, SubscriptionStatus } from '@prisma/client';
import { m, type TFn } from '@/i18n/translate';
import { PROJECT_STATUS_LABEL } from '@/modules/automation/events';
import { Badge } from '@/components/ui';

type Tone = 'neutral' | 'gold' | 'ok' | 'warn' | 'danger' | 'info';

export const ORDER_STATUS: Record<OrderStatus, [string, Tone]> = {
  PENDING_PAYMENT: [m('Paiement en attente'), 'warn'], PAID: [m('Payée'), 'ok'], PAYMENT_FAILED: [m('Paiement échoué'), 'danger'],
  CANCELLED: [m('Annulée'), 'neutral'], REFUNDED: [m('Remboursée'), 'info'], PARTIALLY_REFUNDED: [m('Partiellement remboursée'), 'info'],
};
export const PAYMENT_STATUS: Record<PaymentStatus, [string, Tone]> = {
  PENDING: [m('En attente'), 'warn'], SUCCEEDED: [m('Réussi'), 'ok'], FAILED: [m('Échoué'), 'danger'], REFUNDED: [m('Remboursé'), 'info'], PARTIALLY_REFUNDED: [m('Partiellement remboursé'), 'info'],
};
export const SUB_STATUS: Record<SubscriptionStatus, [string, Tone]> = {
  TRIALING: [m('Période d’essai'), 'gold'], ACTIVE: [m('Actif'), 'ok'], PAST_DUE: [m('Paiement en retard'), 'danger'], CANCELED: [m('Résilié'), 'neutral'], INCOMPLETE: [m('Incomplet'), 'warn'],
};
const PROJECT_TONE: Partial<Record<ProjectStatus, Tone>> = {
  PAYMENT_PENDING: 'warn', BRIEFING_PENDING: 'warn', CLIENT_REVIEW: 'gold', REVISION_REQUESTED: 'warn', APPROVED: 'ok', COMPLETED: 'ok', MAINTENANCE: 'ok', IN_DEVELOPMENT: 'info',
};

export const OrderBadge = ({ status, t }: { status: OrderStatus; t: TFn }) => <Badge tone={ORDER_STATUS[status][1]}>{t(ORDER_STATUS[status][0])}</Badge>;
export const PaymentBadge = ({ status, t }: { status: PaymentStatus; t: TFn }) => <Badge tone={PAYMENT_STATUS[status][1]}>{t(PAYMENT_STATUS[status][0])}</Badge>;
export const SubBadge = ({ status, t }: { status: SubscriptionStatus; t: TFn }) => <Badge tone={SUB_STATUS[status][1]}>{t(SUB_STATUS[status][0])}</Badge>;
export const ProjectBadge = ({ status, t }: { status: ProjectStatus; t: TFn }) => <Badge tone={PROJECT_TONE[status] ?? 'neutral'}>{t(PROJECT_STATUS_LABEL[status])}</Badge>;
