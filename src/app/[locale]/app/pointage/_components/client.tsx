'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionForm, Checkbox, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import { useT } from '@/i18n/client';
import {
  addCorrectionAction, applyPresetAction, clockAction, createEmployeeAction, requestAbsenceAction, saveDepartmentAction, saveScheduleAction,
  updateEmployeeAction, updateSettingsAction, voidEntryAction,
} from '@/modules/pointage/actions';
import { ABSENCE_LABELS, ACTION_LABELS, ENTRY_LABELS, JURISDICTION_LABELS, ROLE_LABELS, WEEKDAY_LABELS } from '@/modules/pointage/labels';
import type { EntryType, ScheduleDay } from '@/modules/pointage/time';

type Option = { value: string; label: string };

// ───────────────────────────── Clock ─────────────────────────────

const ACTION_STYLE: Record<EntryType, string> = {
  CLOCK_IN: 'btn btn-primary', CLOCK_OUT: 'btn btn-danger', BREAK_START: 'btn btn-outline', BREAK_END: 'btn btn-primary',
};

/** Big, thumb-friendly buttons for the valid next actions only. The time is never sent: the server stamps it. */
export function ClockButtons({ actions }: { actions: EntryType[] }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(clockAction, null);
  const [source, setSource] = useState('');
  useEffect(() => {
    setSource(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900) ? 'mobile' : 'web');
  }, []);
  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="source" value={source} />
      {actions.map((a) => (
        <button key={a} type="submit" name="action" value={a} disabled={pending} aria-busy={pending} className={`${ACTION_STYLE[a]} btn-block min-h-[72px] rounded-2xl text-lg`}>
          {pending && <span className="spinner" aria-hidden />}
          {t(ACTION_LABELS[a])}
        </button>
      ))}
      {state && !state.ok && state.message && <p role="alert" className="alert alert-danger">{state.message}</p>}
      {state?.ok && <p role="status" className="alert alert-ok">{t('Pointage enregistré.')}</p>}
    </form>
  );
}

/** Wall clock of the organization's timezone; also refreshes the server-rendered totals every minute. */
export function LiveClock({ timeZone, intl }: { timeZone: string; intl: string }) {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    const refresh = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, 60_000);
    return () => { clearInterval(tick); clearInterval(refresh); };
  }, [router]);
  return (
    <time className="font-display text-5xl font-semibold tabular-nums tracking-tight" suppressHydrationWarning>
      {now ? new Intl.DateTimeFormat(intl, { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now) : '--:--:--'}
    </time>
  );
}

// ───────────────────────────── Corrections ─────────────────────────────

export function CorrectionForm({ employeeId, date }: { employeeId: string; date: string }) {
  const t = useT();
  const [kind, setKind] = useState('CLOCK_OUT');
  const pair = kind === 'BREAK' || kind === 'DAY';
  const kinds: Option[] = [
    ...(['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'] as EntryType[]).map((k) => ({ value: k, label: t(ENTRY_LABELS[k]) })),
    { value: 'BREAK', label: t('Pause complète (début et fin)') }, { value: 'DAY', label: t('Journée complète (entrée et sortie)') },
  ];
  return (
    <ActionForm action={addCorrectionAction} className="space-y-4" resetOnSuccess successMessage={t('Correction enregistrée.')}>
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="date" value={date} />
      <Select label={t('Pointage à ajouter')} name="kind" options={kinds} value={kind} onChange={(e) => setKind(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={pair ? t('Heure de début') : t('Heure')} name="time" type="time" required />
        {pair && <Input label={t('Heure de fin')} name="time2" type="time" required />}
      </div>
      <Textarea label={t('Motif de la correction')} name="reason" required minLength={3} maxLength={500} hint={t('Obligatoire. Le motif est conservé dans le journal d’audit.')} />
      <Submit>{t('Ajouter le pointage')}</Submit>
    </ActionForm>
  );
}

export function VoidEntryButton({ entryId, label }: { entryId: string; label: string }) {
  const t = useT();
  return (
    <Modal trigger={t('Annuler')} triggerClassName="btn btn-danger btn-sm" title={t('Annuler ce pointage')}>
      {(close) => (
        <ActionForm action={voidEntryAction} className="space-y-4" onDone={close}>
          <input type="hidden" name="entryId" value={entryId} />
          <p className="text-sm text-fg-soft">{label}</p>
          <p className="muted text-sm">{t('Le pointage n’est pas supprimé : il est marqué comme annulé et reste visible dans l’historique.')}</p>
          <Textarea label={t('Motif de la correction')} name="reason" required minLength={3} maxLength={500} />
          <Submit className="btn btn-danger">{t('Annuler ce pointage')}</Submit>
        </ActionForm>
      )}
    </Modal>
  );
}

// ───────────────────────────── Absences ─────────────────────────────

export function AbsenceForm({ employees, today }: { employees?: Option[]; today: string }) {
  const t = useT();
  return (
    <ActionForm action={requestAbsenceAction} className="space-y-4" resetOnSuccess successMessage={t('Demande enregistrée.')}>
      {employees && <Select label={t('Employé')} name="employeeId" options={employees} required />}
      <Select label={t('Type d’absence')} name="type" options={(Object.keys(ABSENCE_LABELS) as (keyof typeof ABSENCE_LABELS)[]).map((k) => ({ value: k, label: t(ABSENCE_LABELS[k]) }))} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('Du')} name="startDate" type="date" defaultValue={today} required />
        <Input label={t('Au')} name="endDate" type="date" defaultValue={today} required />
      </div>
      <Textarea label={t('Remarque')} name="note" maxLength={1000} />
      <Submit>{employees ? t('Enregistrer l’absence') : t('Envoyer la demande')}</Submit>
    </ActionForm>
  );
}

// ───────────────────────────── Employees ─────────────────────────────

export type EmployeeFormValue = { id: string; firstName: string; lastName: string; email: string | null; role: string; departmentId: string | null; scheduleId: string | null; vacationDays: number; linked: boolean };

function EmployeeFields({ value, departments, schedules }: { value?: EmployeeFormValue; departments: Option[]; schedules: Option[] }) {
  const t = useT();
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('Prénom')} name="firstName" defaultValue={value?.firstName} required maxLength={80} />
        <Input label={t('Nom')} name="lastName" defaultValue={value?.lastName} required maxLength={80} />
      </div>
      <Input label={t('Adresse e-mail')} name="email" type="email" defaultValue={value?.email ?? ''} hint={t('Nécessaire pour inviter l’employé à se connecter.')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label={t('Rôle')} name="role" defaultValue={value?.role ?? 'EMPLOYEE'} options={(['EMPLOYEE', 'MANAGER', 'ADMIN'] as const).map((r) => ({ value: r, label: t(ROLE_LABELS[r]) }))} />
        <Input label={t('Jours de vacances par an')} name="vacationDays" type="number" min={0} max={365} defaultValue={value?.vacationDays ?? 20} required />
        <Select label={t('Département')} name="departmentId" defaultValue={value?.departmentId ?? ''} options={[{ value: '', label: t('Aucun') }, ...departments]} />
        <Select label={t('Horaire')} name="scheduleId" defaultValue={value?.scheduleId ?? ''} options={[{ value: '', label: t('Aucun (durée cible de l’entreprise)') }, ...schedules]} />
      </div>
    </>
  );
}

export function NewEmployeeButton(props: { departments: Option[]; schedules: Option[] }) {
  const t = useT();
  return (
    <Modal trigger={t('Ajouter un employé')} title={t('Nouvel employé')}>
      {(close) => (
        <ActionForm action={createEmployeeAction} className="space-y-4" onDone={close}>
          <EmployeeFields {...props} />
          <Checkbox name="invite" label={t('Envoyer une invitation pour que l’employé puisse se connecter et pointer')} />
          <Submit>{t('Créer l’employé')}</Submit>
        </ActionForm>
      )}
    </Modal>
  );
}

export function EditEmployeeForm({ value, ...props }: { value: EmployeeFormValue; departments: Option[]; schedules: Option[] }) {
  const t = useT();
  return (
    <ActionForm action={updateEmployeeAction} className="space-y-4" successMessage={t('Modifications enregistrées.')}>
      <input type="hidden" name="id" value={value.id} />
      <EmployeeFields value={value} {...props} />
      <Submit>{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

// ───────────────────────────── Departments ─────────────────────────────

export function DepartmentButton({ value, managers }: { value?: { id: string; name: string; managerId: string | null }; managers: Option[] }) {
  const t = useT();
  return (
    <Modal trigger={value ? t('Modifier') : t('Ajouter un département')} triggerClassName={value ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={value ? t('Modifier le département') : t('Nouveau département')}>
      {(close) => (
        <ActionForm action={saveDepartmentAction} className="space-y-4" onDone={close}>
          {value && <input type="hidden" name="id" value={value.id} />}
          <Input label={t('Nom')} name="name" defaultValue={value?.name} required minLength={2} maxLength={80} />
          <Select label={t('Responsable')} name="managerId" defaultValue={value?.managerId ?? ''} options={[{ value: '', label: t('Aucun') }, ...managers]} hint={t('Le responsable voit et gère les employés de ce département. Il reçoit le rôle Responsable.')} />
          <Submit>{t('Enregistrer')}</Submit>
        </ActionForm>
      )}
    </Modal>
  );
}

// ───────────────────────────── Schedules ─────────────────────────────

export function ScheduleButton({ value }: { value?: { id: string; name: string; days: ScheduleDay[] } }) {
  const t = useT();
  const initial = (day: number) => value?.days.find((d) => d.day === day);
  const [on, setOn] = useState<Record<number, boolean>>(() => Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((d) => [d, value ? !!initial(d) : d <= 5])));
  return (
    <Modal trigger={value ? t('Modifier') : t('Ajouter un horaire')} triggerClassName={value ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={value ? t('Modifier l’horaire') : t('Nouvel horaire')}>
      {(close) => (
        <ActionForm action={saveScheduleAction} className="space-y-4" onDone={close}>
          {value && <input type="hidden" name="id" value={value.id} />}
          <Input label={t('Nom')} name="name" defaultValue={value?.name} required minLength={2} maxLength={80} />
          <fieldset className="space-y-2">
            <legend className="label">{t('Jours travaillés')}</legend>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div key={d} className="rounded-xl border border-line p-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <input type="checkbox" className="check" name={`d${d}_on`} checked={on[d]} onChange={(e) => setOn({ ...on, [d]: e.target.checked })} />
                  {t(WEEKDAY_LABELS[d])}
                </label>
                {on[d] && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <label className="text-xs text-fg-muted">{t('Début')}<input className="input mt-1" type="time" name={`d${d}_start`} defaultValue={initial(d)?.start ?? '08:00'} required /></label>
                    <label className="text-xs text-fg-muted">{t('Fin')}<input className="input mt-1" type="time" name={`d${d}_end`} defaultValue={initial(d)?.end ?? '17:00'} required /></label>
                    <label className="text-xs text-fg-muted">{t('Pause (min)')}<input className="input mt-1" type="number" min={0} max={600} name={`d${d}_break`} defaultValue={initial(d)?.breakMinutes ?? 60} required /></label>
                  </div>
                )}
              </div>
            ))}
          </fieldset>
          <Submit>{t('Enregistrer')}</Submit>
        </ActionForm>
      )}
    </Modal>
  );
}

// ───────────────────────────── Settings ─────────────────────────────

export type SettingsFormValue = {
  jurisdiction: string; timezone: string; dailyTargetMinutes: number; weeklyOvertimeAfterMinutes: number; maxDailyMinutes: number;
  minBreakMinutesAfter6h: number; retentionMonths: number; allowManualCorrections: boolean;
};

export function SettingsForm({ value, timezones }: { value: SettingsFormValue; timezones: string[] }) {
  const t = useT();
  const jurisdictions = (Object.keys(JURISDICTION_LABELS) as (keyof typeof JURISDICTION_LABELS)[]).map((k) => ({ value: k, label: t(JURISDICTION_LABELS[k]) }));
  return (
    <ActionForm action={updateSettingsAction} className="space-y-4" successMessage={t('Paramètres enregistrés.')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label={t('Juridiction de référence')} name="jurisdiction" defaultValue={value.jurisdiction} options={jurisdictions} />
        <Select label={t('Fuseau horaire de l’entreprise')} name="timezone" defaultValue={value.timezone} options={timezones.map((z) => ({ value: z, label: z }))} hint={t('Toutes les heures sont affichées et calculées dans ce fuseau.')} />
        <Input label={t('Durée cible par jour (minutes)')} name="dailyTargetMinutes" type="number" min={60} max={720} defaultValue={value.dailyTargetMinutes} required />
        <Input label={t('Heures supplémentaires au-delà de (minutes par semaine)')} name="weeklyOvertimeAfterMinutes" type="number" min={60} max={5040} defaultValue={value.weeklyOvertimeAfterMinutes} required hint={t('Utilisé pour les employés sans horaire attribué.')} />
        <Input label={t('Durée maximale par jour (minutes)')} name="maxDailyMinutes" type="number" min={60} max={1440} defaultValue={value.maxDailyMinutes} required hint={t('Au-delà, la journée est signalée comme anomalie.')} />
        <Input label={t('Pause minimale après 6 h de travail (minutes)')} name="minBreakMinutesAfter6h" type="number" min={0} max={240} defaultValue={value.minBreakMinutesAfter6h} required />
        <Input label={t('Durée de conservation des données (mois)')} name="retentionMonths" type="number" min={6} max={240} defaultValue={value.retentionMonths} required hint={t('Les pointages et absences traitées plus anciens sont supprimés automatiquement.')} />
      </div>
      <Checkbox name="allowManualCorrections" defaultChecked={value.allowManualCorrections} label={t('Autoriser les corrections manuelles par les responsables et administrateurs (toujours tracées dans le journal d’audit)')} />
      <Submit>{t('Enregistrer les paramètres')}</Submit>
    </ActionForm>
  );
}

export function PresetForm({ jurisdiction }: { jurisdiction: string }) {
  const t = useT();
  const jurisdictions = (Object.keys(JURISDICTION_LABELS) as (keyof typeof JURISDICTION_LABELS)[]).map((k) => ({ value: k, label: t(JURISDICTION_LABELS[k]) }));
  return (
    <ActionForm action={applyPresetAction} className="space-y-4" successMessage={t('Valeurs indicatives appliquées. Vérifiez-les avant de les utiliser.')}>
      <Select label={t('Juridiction')} name="jurisdiction" defaultValue={jurisdiction} options={jurisdictions} />
      <Submit className="btn btn-outline">{t('Pré-remplir avec les valeurs indicatives')}</Submit>
    </ActionForm>
  );
}
