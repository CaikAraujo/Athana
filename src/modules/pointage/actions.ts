'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { run, formObject, type ActionState } from '@/lib/action';
import { AppError } from '@/lib/errors';
import { m } from '@/i18n/translate';
import { tenantFromSession } from '@/modules/tenancy/guard';
import {
  addManualEntries, cancelAbsence, clock, createDepartment, createEmployee, createSchedule, decideAbsence, deleteDepartment, deleteSchedule,
  inviteEmployee, requestAbsence, setEmployeeActive, updateDepartment, updateEmployee, updateSchedule, voidEntry,
} from './service';
import { applyJurisdictionPreset, updateSettings } from './settings';
import type { EntryType } from './time';

/** Every Pointage page depends on the same data: refresh the whole section. */
function refresh() {
  revalidatePath('/[locale]/app/pointage', 'layout');
}

/**
 * Self-service clocking. Only the action comes from the form: the tenant and the employee come from the
 * session, the time from the server clock.
 */
export async function clockAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    const hinted = String(fd.get('source') ?? '');
    const ua = (await headers()).get('user-agent') ?? '';
    const source = hinted === 'mobile' || (hinted !== 'web' && /Mobi|Android|iPhone|iPad/i.test(ua)) ? 'mobile' : 'web';
    await clock(ctx, String(fd.get('clock') ?? '') as EntryType, { source });
    refresh();
  });
}

const CORRECTION_KINDS: Record<string, EntryType[]> = {
  CLOCK_IN: ['CLOCK_IN'], CLOCK_OUT: ['CLOCK_OUT'], BREAK_START: ['BREAK_START'], BREAK_END: ['BREAK_END'],
  BREAK: ['BREAK_START', 'BREAK_END'], DAY: ['CLOCK_IN', 'CLOCK_OUT'],
};

export async function addCorrectionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    const f = formObject(fd);
    const types = CORRECTION_KINDS[String(f.kind)];
    if (!types) throw new AppError(m('Type de pointage invalide.'), 'invalid', { kind: m('Type de pointage invalide.') });
    const times = [String(f.time ?? ''), String(f.time2 ?? '')];
    if (types.length === 2 && !times[1]) throw new AppError(m('Indiquez l’heure de fin.'), 'invalid', { time2: m('Indiquez l’heure de fin.') });
    await addManualEntries(ctx, { employeeId: String(f.employeeId ?? ''), date: String(f.date ?? ''), reason: String(f.reason ?? ''), entries: types.map((type, i) => ({ type, time: times[i] })) });
    refresh();
  });
}

export async function voidEntryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await voidEntry(ctx, { entryId: String(fd.get('entryId') ?? ''), reason: String(fd.get('reason') ?? '') });
    refresh();
  });
}

// ───────────────────────────── Absences ─────────────────────────────

export async function requestAbsenceAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    const f = formObject(fd);
    await requestAbsence(ctx, { employeeId: f.employeeId ? String(f.employeeId) : null, type: String(f.type) as never, startDate: String(f.startDate ?? ''), endDate: String(f.endDate ?? ''), note: String(f.note ?? '') });
    refresh();
  });
}

export async function cancelAbsenceAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await cancelAbsence(ctx, String(fd.get('id') ?? ''));
    refresh();
  });
}

export async function decideAbsenceAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await decideAbsence(ctx, String(fd.get('id') ?? ''), String(fd.get('decision') ?? '') as 'APPROVED' | 'REJECTED');
    refresh();
  });
}

// ───────────────────────────── Employees ─────────────────────────────

function employeeInput(fd: FormData) {
  const f = formObject(fd);
  return {
    firstName: String(f.firstName ?? ''), lastName: String(f.lastName ?? ''), email: String(f.email ?? ''), role: String(f.role || 'EMPLOYEE') as never,
    departmentId: String(f.departmentId ?? ''), scheduleId: String(f.scheduleId ?? ''), vacationDays: String(f.vacationDays ?? '20'), invite: f.invite === 'on',
  };
}

export async function createEmployeeAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await createEmployee(ctx, employeeInput(fd));
    refresh();
  });
}

export async function updateEmployeeAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await updateEmployee(ctx, String(fd.get('id') ?? ''), employeeInput(fd));
    refresh();
  });
}

export async function setEmployeeActiveAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await setEmployeeActive(ctx, String(fd.get('id') ?? ''), fd.get('active') === '1');
    refresh();
  });
}

export async function inviteEmployeeAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await inviteEmployee(ctx, String(fd.get('id') ?? ''));
    refresh();
  });
}

// ───────────────────────────── Departments & schedules ─────────────────────────────

export async function saveDepartmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    const f = formObject(fd);
    const input = { name: String(f.name ?? ''), managerId: String(f.managerId ?? '') };
    if (f.id) await updateDepartment(ctx, String(f.id), input);
    else await createDepartment(ctx, input);
    refresh();
  });
}

export async function deleteDepartmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await deleteDepartment(ctx, String(fd.get('id') ?? ''));
    refresh();
  });
}

export async function saveScheduleAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    const f = formObject(fd);
    const days = [1, 2, 3, 4, 5, 6, 7].filter((d) => f[`d${d}_on`] === 'on').map((day) => ({ day, start: String(f[`d${day}_start`] ?? ''), end: String(f[`d${day}_end`] ?? ''), breakMinutes: String(f[`d${day}_break`] || '0') }));
    const input = { name: String(f.name ?? ''), days };
    if (f.id) await updateSchedule(ctx, String(f.id), input);
    else await createSchedule(ctx, input);
    refresh();
  });
}

export async function deleteScheduleAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await deleteSchedule(ctx, String(fd.get('id') ?? ''));
    refresh();
  });
}

// ───────────────────────────── Settings ─────────────────────────────

export async function updateSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    const f = formObject(fd);
    // Geolocation and biometrics are not read from the form: they cannot be enabled.
    await updateSettings(ctx, {
      jurisdiction: String(f.jurisdiction ?? '') as never, timezone: String(f.timezone ?? ''),
      dailyTargetMinutes: String(f.dailyTargetMinutes ?? ''), weeklyOvertimeAfterMinutes: String(f.weeklyOvertimeAfterMinutes ?? ''), maxDailyMinutes: String(f.maxDailyMinutes ?? ''),
      minBreakMinutesAfter6h: String(f.minBreakMinutesAfter6h ?? ''), retentionMonths: String(f.retentionMonths ?? ''), allowManualCorrections: f.allowManualCorrections === 'on',
    });
    refresh();
  });
}

export async function applyPresetAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const ctx = await tenantFromSession('pointage');
    await applyJurisdictionPreset(ctx, String(fd.get('jurisdiction') ?? ''));
    refresh();
  });
}
