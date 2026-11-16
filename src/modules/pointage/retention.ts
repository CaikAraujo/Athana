import { db } from '@/lib/db';
import { parseSettings } from './settings';

/**
 * Deletes time entries and decided absences older than the organization's retention period and writes
 * one audit entry with the counts (only when something was actually deleted, so that the daily job
 * does not fill the trail with empty rows). Pending absences are never purged.
 */
export async function purgeExpired(organizationId: string, now: Date = new Date()) {
  const org = await db.organization.findUnique({ where: { id: organizationId }, select: { settings: true } });
  if (!org) return { entries: 0, absences: 0, cutoff: null as Date | null };
  const { retentionMonths } = parseSettings(org.settings);
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - retentionMonths);
  const cutoffDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate()));
  return db.$transaction(async (tx) => {
    const entries = await tx.ptTimeEntry.deleteMany({ where: { organizationId, at: { lt: cutoff } } });
    const absences = await tx.ptAbsence.deleteMany({ where: { organizationId, status: { in: ['APPROVED', 'REJECTED'] }, endDate: { lt: cutoffDay } } });
    if (entries.count + absences.count > 0) {
      await tx.auditLog.create({
        data: { organizationId, action: 'pointage.retention.purged', entity: 'Organization', entityId: organizationId, meta: { entries: entries.count, absences: absences.count, retentionMonths, cutoff: cutoff.toISOString() } },
      });
    }
    return { entries: entries.count, absences: absences.count, cutoff };
  });
}

/** Daily job: applies the retention policy of every organization that has a Pointage subscription. */
export async function runPointageRetention(now: Date = new Date()) {
  const subscriptions = await db.subscription.findMany({ where: { saasProductKey: 'pointage' }, select: { organizationId: true } });
  let entries = 0;
  let absences = 0;
  let failed = 0;
  for (const { organizationId } of subscriptions) {
    try {
      const res = await purgeExpired(organizationId, now);
      entries += res.entries;
      absences += res.absences;
    } catch (err) {
      failed++;
      console.error('[pointage.retention]', organizationId, err);
    }
  }
  return { organizations: subscriptions.length, entries, absences, failed };
}
