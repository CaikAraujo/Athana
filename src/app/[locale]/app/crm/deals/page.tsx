import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/config';
import { assertLocale } from '@/i18n/server';

/** Deals are browsed from the pipeline board. */
export default async function DealsIndex({ params }: { params: Promise<{ locale: string }> }) {
  redirect(localePath(assertLocale((await params).locale), '/app/crm/pipeline'));
}
