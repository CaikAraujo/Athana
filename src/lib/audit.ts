import { db } from './db';
import type { Prisma } from '@prisma/client';

export async function audit(entry: {
  actorId?: string | null; organizationId?: string | null; action: string;
  entity?: string; entityId?: string; meta?: Prisma.InputJsonValue; ip?: string | null;
}) {
  await db.auditLog.create({ data: entry });
}
