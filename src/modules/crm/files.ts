import { db } from '@/lib/db';
import { AppError, notFoundError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { hasOrgRole, planLimit } from '@/modules/tenancy/context';
import { storage, storeUpload } from '@/modules/storage/service';
import { ATTACHMENT_ENTITIES, type AttachmentEntity } from './labels';
import { requireCompany, requireContact, requireDeal, userNames, type TenantCtx } from './shared';

const MB = 1024 * 1024;

async function assertEntity(ctx: TenantCtx, entityType: string, entityId: string): Promise<AttachmentEntity> {
  if (!(ATTACHMENT_ENTITIES as readonly string[]).includes(entityType)) throw new AppError(m('Type d’élément invalide.'), 'invalid');
  if (entityType === 'contact') await requireContact(ctx, entityId);
  else if (entityType === 'company') await requireCompany(ctx, entityId);
  else await requireDeal(ctx, entityId);
  return entityType as AttachmentEntity;
}

export async function storageUsedBytes(ctx: TenantCtx): Promise<number> {
  const agg = await db.fileAsset.aggregate({ where: { organizationId: ctx.organizationId }, _sum: { size: true } });
  return agg._sum.size ?? 0;
}

/** Stores a file linked to a contact, company or deal. Download: /api/files/<id>. */
export async function uploadAttachment(ctx: TenantCtx, input: { entityType: string; entityId: string; file: File }) {
  const entityType = await assertEntity(ctx, input.entityType, String(input.entityId ?? ''));
  const file = input.file;
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) throw new AppError(m('Veuillez choisir un fichier.'), 'invalid', { file: m('Veuillez choisir un fichier.') });
  const limitMb = planLimit(ctx, 'storageMb');
  if (limitMb !== null && (await storageUsedBytes(ctx)) + file.size > limitMb * MB) {
    throw new AppError(m('Espace de stockage de votre plan atteint. Passez à un plan supérieur pour continuer.'), 'limit');
  }
  const stored = await storeUpload('tenants', file);
  return db.fileAsset.create({
    data: { ...stored, kind: stored.mime.startsWith('image/') ? 'image' : 'document', ownerId: ctx.userId, organizationId: ctx.organizationId, entityType, entityId: input.entityId },
  });
}

export async function listAttachments(ctx: TenantCtx, entityType: string, entityId: string) {
  await assertEntity(ctx, entityType, entityId);
  const files = await db.fileAsset.findMany({
    where: { organizationId: ctx.organizationId, entityType, entityId }, orderBy: { createdAt: 'desc' },
    select: { id: true, originalName: true, mime: true, size: true, createdAt: true, ownerId: true },
  });
  const names = await userNames(files.map((f) => f.ownerId));
  return files.map((f) => ({ ...f, ownerName: names[f.ownerId] ?? null, url: `/api/files/${f.id}`, canDelete: f.ownerId === ctx.userId || hasOrgRole(ctx, 'MANAGER') }));
}

/** The uploader or a MANAGER+ may delete an attachment. */
export async function deleteAttachment(ctx: TenantCtx, id: string) {
  const file = await db.fileAsset.findFirst({ where: { id, organizationId: ctx.organizationId } });
  if (!file) throw notFoundError(m('Fichier introuvable.'));
  if (file.ownerId !== ctx.userId && !hasOrgRole(ctx, 'MANAGER')) throw new AppError(m('Accès refusé.'), 'forbidden');
  await db.fileAsset.deleteMany({ where: { id: file.id, organizationId: ctx.organizationId } });
  await storage.remove(file.storageKey);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'crm.attachment.deleted', entity: 'FileAsset', entityId: file.id, meta: { name: file.originalName } });
}

/** Called when a record is deleted so its files do not stay orphaned (and keep counting against the quota). */
export async function removeEntityFiles(ctx: TenantCtx, entityType: AttachmentEntity, entityId: string) {
  const files = await db.fileAsset.findMany({ where: { organizationId: ctx.organizationId, entityType, entityId } });
  if (!files.length) return;
  await db.fileAsset.deleteMany({ where: { organizationId: ctx.organizationId, entityType, entityId } });
  await Promise.all(files.map((f) => storage.remove(f.storageKey)));
}
