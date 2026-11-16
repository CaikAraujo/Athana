import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { m } from '@/i18n/translate';
import type { TenantCtx } from '@/modules/tenancy/context';
import { resolveActor, assertAdmin } from './actor';

export const JURISDICTIONS = ['CH', 'FR', 'PT', 'BR', 'OTHER'] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

export type PointageSettings = {
  jurisdiction: Jurisdiction;
  dailyTargetMinutes: number;
  weeklyOvertimeAfterMinutes: number;
  maxDailyMinutes: number;
  minBreakMinutesAfter6h: number;
  retentionMonths: number;
  allowManualCorrections: boolean;
  /** Not implemented: depends on local law. Always false. */
  geolocation: false;
  /** Not implemented: depends on local law. Always false. */
  biometrics: false;
};

type Numbers = Pick<PointageSettings, 'dailyTargetMinutes' | 'weeklyOvertimeAfterMinutes' | 'maxDailyMinutes' | 'minBreakMinutesAfter6h' | 'retentionMonths'>;

/**
 * Indicative starting values per jurisdiction. They are NOT legal advice: working-time rules depend on
 * the sector, collective agreements and individual contracts, and must be validated by a labour-law professional.
 */
export const JURISDICTION_PRESETS: Record<Jurisdiction, Numbers> = {
  CH: { dailyTargetMinutes: 504, weeklyOvertimeAfterMinutes: 2520, maxDailyMinutes: 750, minBreakMinutesAfter6h: 30, retentionMonths: 60 },
  FR: { dailyTargetMinutes: 420, weeklyOvertimeAfterMinutes: 2100, maxDailyMinutes: 600, minBreakMinutesAfter6h: 20, retentionMonths: 36 },
  PT: { dailyTargetMinutes: 480, weeklyOvertimeAfterMinutes: 2400, maxDailyMinutes: 600, minBreakMinutesAfter6h: 60, retentionMonths: 60 },
  BR: { dailyTargetMinutes: 480, weeklyOvertimeAfterMinutes: 2640, maxDailyMinutes: 600, minBreakMinutesAfter6h: 60, retentionMonths: 60 },
  OTHER: { dailyTargetMinutes: 480, weeklyOvertimeAfterMinutes: 2400, maxDailyMinutes: 600, minBreakMinutesAfter6h: 30, retentionMonths: 24 },
};

export const DEFAULT_SETTINGS: PointageSettings = {
  jurisdiction: 'OTHER', ...JURISDICTION_PRESETS.OTHER, allowManualCorrections: true, geolocation: false, biometrics: false,
};

const LIMITS = {
  dailyTargetMinutes: [60, 720], weeklyOvertimeAfterMinutes: [60, 5040], maxDailyMinutes: [60, 1440], minBreakMinutesAfter6h: [0, 240], retentionMonths: [6, 240],
} as const satisfies Record<keyof Numbers, readonly [number, number]>;

/** Reads `organization.settings.pointage`, tolerating missing or malformed keys. */
export function parseSettings(orgSettings: unknown): PointageSettings {
  const raw = ((orgSettings as Record<string, unknown> | null)?.pointage ?? {}) as Record<string, unknown>;
  const out: PointageSettings = { ...DEFAULT_SETTINGS };
  if ((JURISDICTIONS as readonly string[]).includes(String(raw.jurisdiction))) out.jurisdiction = raw.jurisdiction as Jurisdiction;
  for (const key of Object.keys(LIMITS) as (keyof Numbers)[]) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isInteger(v) && v >= LIMITS[key][0] && v <= LIMITS[key][1]) out[key] = v;
  }
  if (typeof raw.allowManualCorrections === 'boolean') out.allowManualCorrections = raw.allowManualCorrections;
  return out;
}

export async function loadOrgSettings(organizationId: string): Promise<{ timezone: string; name: string; settings: PointageSettings }> {
  const org = await db.organization.findUniqueOrThrow({ where: { id: organizationId }, select: { name: true, timezone: true, settings: true } });
  return { name: org.name, timezone: org.timezone, settings: parseSettings(org.settings) };
}

/** Settings are readable by every member of the tenant (the clock screen needs the timezone). */
export async function getSettings(ctx: TenantCtx) {
  return loadOrgSettings(ctx.organizationId);
}

const int = (key: keyof Numbers) => z.coerce.number({ message: m('Nombre invalide.') }).int(m('Nombre entier requis.')).min(LIMITS[key][0], m('Valeur trop petite.')).max(LIMITS[key][1], m('Valeur trop grande.'));

const settingsSchema = z.object({
  jurisdiction: z.enum(JURISDICTIONS, { message: m('Juridiction invalide.') }),
  timezone: z.string().refine((tz) => Intl.supportedValuesOf('timeZone').includes(tz) || tz === 'UTC', m('Fuseau horaire invalide.')),
  dailyTargetMinutes: int('dailyTargetMinutes'),
  weeklyOvertimeAfterMinutes: int('weeklyOvertimeAfterMinutes'),
  maxDailyMinutes: int('maxDailyMinutes'),
  minBreakMinutesAfter6h: int('minBreakMinutesAfter6h'),
  retentionMonths: int('retentionMonths'),
  allowManualCorrections: z.boolean(),
});
export type SettingsInput = z.input<typeof settingsSchema>;

async function writeSettings(ctx: TenantCtx, next: PointageSettings, timezone: string | undefined, action: string) {
  await db.$transaction(async (tx) => {
    // Lock the row: `settings` is shared with other products and is rewritten as a whole.
    await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${ctx.organizationId} FOR UPDATE`;
    const org = await tx.organization.findUniqueOrThrow({ where: { id: ctx.organizationId }, select: { settings: true, timezone: true } });
    const all = (org.settings && typeof org.settings === 'object' && !Array.isArray(org.settings) ? org.settings : {}) as Record<string, unknown>;
    const before = { ...parseSettings(org.settings), timezone: org.timezone };
    await tx.organization.update({
      where: { id: ctx.organizationId },
      data: { settings: { ...all, pointage: next } as Prisma.InputJsonValue, ...(timezone ? { timezone } : {}) },
    });
    await tx.auditLog.create({ data: { actorId: ctx.userId, organizationId: ctx.organizationId, action, entity: 'Organization', entityId: ctx.organizationId, meta: { before, after: { ...next, timezone: timezone ?? org.timezone } } } });
  });
}

/** Admin only. Geolocation and biometrics cannot be enabled: they are stored as `false` whatever is sent. */
export async function updateSettings(ctx: TenantCtx, input: SettingsInput) {
  assertAdmin(await resolveActor(ctx));
  const data = settingsSchema.parse(input);
  if (data.maxDailyMinutes < data.dailyTargetMinutes) throw new AppError(m('La durée maximale par jour doit être supérieure ou égale à la durée cible.'), 'invalid', { maxDailyMinutes: m('La durée maximale par jour doit être supérieure ou égale à la durée cible.') });
  const { timezone, ...rest } = data;
  await writeSettings(ctx, { ...rest, geolocation: false, biometrics: false }, timezone, 'pointage.settings.updated');
}

/** Replaces the numeric values with the indicative preset of a jurisdiction (admin only). */
export async function applyJurisdictionPreset(ctx: TenantCtx, jurisdiction: string) {
  assertAdmin(await resolveActor(ctx));
  const j = z.enum(JURISDICTIONS, { message: m('Juridiction invalide.') }).parse(jurisdiction);
  const current = (await loadOrgSettings(ctx.organizationId)).settings;
  await writeSettings(ctx, { ...current, jurisdiction: j, ...JURISDICTION_PRESETS[j], geolocation: false, biometrics: false }, undefined, 'pointage.settings.preset_applied');
}

