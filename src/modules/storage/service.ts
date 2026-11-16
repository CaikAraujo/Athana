import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { m } from '@/i18n/translate';
import { getSetting } from '@/lib/settings';

/**
 * Storage adapter. Files are private: they are stored outside the web root under random
 * keys and only served through /api/files/[id] after an access check.
 * To move to S3-compatible storage, implement the same three functions for that backend.
 */
export interface StorageAdapter {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

const root = () => path.resolve(env.storageDir);
const resolveKey = (key: string) => {
  if (!/^[a-z0-9]+\/[a-f0-9]{32}\.[a-z0-9]{1,5}$/.test(key)) throw new Error('Invalid storage key');
  return path.join(root(), key);
};

export const localStorage: StorageAdapter = {
  async put(key, data) {
    const file = resolveKey(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data, { mode: 0o600 });
  },
  get: (key) => readFile(resolveKey(key)),
  remove: (key) => unlink(resolveKey(key)).catch(() => {}),
};

export const storage: StorageAdapter = localStorage;

const EXT: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf', 'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx', 'application/zip': 'zip',
};

/** Magic-number check so a renamed executable cannot pass as an image or PDF. */
function sniff(buf: Buffer, mime: string): boolean {
  const hex = buf.subarray(0, 8).toString('hex');
  switch (mime) {
    case 'image/png': return hex.startsWith('89504e47');
    case 'image/jpeg': return hex.startsWith('ffd8ff');
    case 'image/webp': return buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
    case 'application/pdf': return buf.subarray(0, 5).toString() === '%PDF-';
    case 'application/zip':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': return hex.startsWith('504b0304');
    case 'image/svg+xml': { const s = buf.toString('utf8', 0, 4096).toLowerCase(); return s.includes('<svg') && !/<script|on\w+\s*=|javascript:/.test(buf.toString('utf8').toLowerCase()); }
    case 'text/plain': return !buf.subarray(0, 4096).includes(0);
    default: return false;
  }
}

export async function validateUpload(file: { name: string; type: string; size: number }, data: Buffer) {
  const { maxSizeMb, allowedMime } = await getSetting('uploads');
  if (file.size === 0 || data.length === 0) throw new AppError(m('Fichier vide.'));
  if (data.length > maxSizeMb * 1024 * 1024) throw new AppError(m('Fichier trop volumineux.'));
  if (!allowedMime.includes(file.type) || !EXT[file.type]) throw new AppError(m('Type de fichier non autorisé.'));
  if (!sniff(data, file.type)) throw new AppError(m('Le contenu du fichier ne correspond pas à son type.'));
  return { ext: EXT[file.type], originalName: path.basename(file.name).replace(/[^\w.\- ()]/g, '_').slice(0, 120) };
}

export async function storeUpload(namespace: 'projects' | 'tenants', file: File) {
  const data = Buffer.from(await file.arrayBuffer());
  const { ext, originalName } = await validateUpload(file, data);
  const storageKey = `${namespace}/${randomBytes(16).toString('hex')}.${ext}`;
  await storage.put(storageKey, data);
  return { storageKey, originalName, mime: file.type, size: data.length };
}
