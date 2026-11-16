'use client';

import { ActionForm, Submit } from '@/components/ui/form';
import { useLocale, useT } from '@/i18n/client';
import { sandboxPayAction } from '@/modules/orders/actions';

export function SandboxButtons({ kind, refId, session }: { kind: string; refId: string; session: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={sandboxPayAction} className="mt-6 space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="ref" value={refId} />
      <input type="hidden" name="session" value={session} />
      <Submit className="btn btn-primary btn-lg btn-block" name="outcome" value="success">{t('Simuler un paiement réussi')}</Submit>
      <Submit className="btn btn-outline btn-block" name="outcome" value="failure">{t('Simuler un paiement refusé')}</Submit>
    </ActionForm>
  );
}
