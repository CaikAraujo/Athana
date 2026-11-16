import { cache } from 'react';
import { db } from './db';
import type { Prisma } from '@prisma/client';

export type CompanySettings = {
  legalName: string; address: string; postalCode: string; city: string; country: string;
  email: string; phone: string; vatNumber: string; registrationNumber: string; iban: string;
  linkedin: string; whatsapp: string;
};

export const SETTING_DEFAULTS = {
  company: {
    legalName: 'ATHANA', address: '', postalCode: '', city: '', country: 'CH',
    email: 'contact@athana.ch', phone: '', vatNumber: '', registrationNumber: '', iban: '', linkedin: '', whatsapp: '',
  } as CompanySettings,
  invoicing: { prefix: 'ATH', footerNote: '' },
  security: { sessionDays: 30, passwordMinLength: 10, loginMaxAttempts: 8 },
  uploads: { maxSizeMb: 15, allowedMime: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'] },
  privacy: { policyVersion: '2026-11', retentionMonthsLeads: 24 },
  maintenance: { offerEnabled: true },
};
export type SettingKey = keyof typeof SETTING_DEFAULTS;

export const getSetting = cache(async <K extends SettingKey>(key: K): Promise<(typeof SETTING_DEFAULTS)[K]> => {
  const row = await db.setting.findUnique({ where: { key } }).catch(() => null);
  return { ...SETTING_DEFAULTS[key], ...((row?.value as object) ?? {}) } as (typeof SETTING_DEFAULTS)[K];
});

export async function setSetting<K extends SettingKey>(key: K, value: Partial<(typeof SETTING_DEFAULTS)[K]>) {
  const merged = { ...SETTING_DEFAULTS[key], ...value } as Prisma.InputJsonValue;
  await db.setting.upsert({ where: { key }, create: { key, value: merged }, update: { value: merged } });
}

export const getMarket = cache(async (code: string) => db.market.findUnique({ where: { code } }));
