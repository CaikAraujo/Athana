'use client';

import { useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useLocale, useT } from '@/i18n/client';
import { track } from '@/modules/analytics/track';
import { briefingAction } from '@/modules/account/actions';

type Data = Record<string, string>;
type FieldDef = { name: string; label: string; type?: 'text' | 'email' | 'tel' | 'textarea' | 'big'; required?: boolean; hint?: string; span?: boolean };

function Buttons({ status, onIntent }: { status: string; onIntent: (i: string) => void }) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-3">
      <button type="submit" name="intent" value="save" disabled={pending} onClick={() => onIntent('save')} className="btn btn-outline">{pending && <span className="spinner" aria-hidden />}{t('Enregistrer le brouillon')}</button>
      <button type="submit" name="intent" value="submit" disabled={pending} onClick={() => onIntent('submit')} className="btn btn-primary">{status === 'DRAFT' ? t('Envoyer le briefing') : t('Enregistrer les modifications')}</button>
    </div>
  );
}

/** Briefing form: draft saving, later editing, and final confirmation. The field list is declarative (configurable). */
export function BriefingForm({ projectId, data, status, aiConsent }: { projectId: string; data: Data; status: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED'; aiConsent: boolean }) {
  const t = useT();
  const locale = useLocale();
  const [state, action] = useActionState(briefingAction, null);
  const started = useRef(false);
  const [, setIntent] = useState('save');
  const locked = status === 'CONFIRMED';
  const sections: { title: string; fields: FieldDef[] }[] = [
    { title: t('Votre entreprise'), fields: [
      { name: 'companyName', label: t('Nom de l’entreprise'), required: true }, { name: 'sector', label: t('Secteur d’activité') },
      { name: 'contactName', label: t('Nom du responsable'), required: true }, { name: 'email', label: t('Adresse e-mail'), type: 'email', required: true },
      { name: 'phone', label: t('Téléphone'), type: 'tel' }, { name: 'country', label: t('Pays') },
      { name: 'address', label: t('Adresse'), span: true },
    ] },
    { title: t('Votre projet'), fields: [
      { name: 'projectLanguage', label: t('Langue(s) du site') }, { name: 'domain', label: t('Nom de domaine'), hint: t('Existant ou souhaité, par exemple mon-entreprise.ch') },
      { name: 'goal', label: t('Objectif du site'), type: 'textarea', required: true, span: true }, { name: 'audience', label: t('Public cible'), type: 'textarea', span: true },
      { name: 'pages', label: t('Pages nécessaires'), type: 'textarea', span: true, hint: t('Une page par ligne : Accueil, Services, À propos, Contact…') },
      { name: 'features', label: t('Fonctionnalités souhaitées'), type: 'textarea', span: true },
    ] },
    { title: t('Identité et contenus'), fields: [
      { name: 'colors', label: t('Couleurs préférées') }, { name: 'socials', label: t('Réseaux sociaux'), hint: t('Liens vers vos profils') },
      { name: 'references', label: t('Sites de référence que vous appréciez'), type: 'textarea', span: true },
      { name: 'products', label: t('Services ou produits à présenter'), type: 'textarea', span: true },
      { name: 'texts', label: t('Textes du site'), type: 'big', span: true, hint: t('Collez ici vos textes, ou envoyez-les en fichier ci-dessous.') },
      { name: 'extra', label: t('Informations complémentaires'), type: 'textarea', span: true },
    ] },
  ];
  const err = (n: string) => state?.fieldErrors?.[n];
  const input = (f: FieldDef) => {
    const common = { id: `b-${f.name}`, name: f.name, defaultValue: data[f.name] ?? '', disabled: locked, 'aria-invalid': err(f.name) ? true : undefined } as const;
    return f.type === 'textarea' || f.type === 'big'
      ? <textarea {...common} className="textarea" rows={f.type === 'big' ? 8 : 3} />
      : <input {...common} type={f.type ?? 'text'} className="input" />;
  };
  return (
    <form action={action} className="space-y-6" onChange={() => { if (!started.current) { started.current = true; track('briefing_start', { project: projectId }); } }}
      onSubmit={(e) => { const v = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null; if (v?.value === 'submit') track('briefing_submit', { project: projectId }); }}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="projectId" value={projectId} />
      {sections.map((s) => (
        <fieldset key={s.title} className="panel p-5 md:p-6">
          <legend className="px-1 text-lg font-semibold">{s.title}</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {s.fields.map((f) => (
              <div key={f.name} className={f.span ? 'sm:col-span-2' : ''}>
                <label className="label" htmlFor={`b-${f.name}`}>{f.label}{f.required && <span className="text-accent-600" aria-hidden> *</span>}</label>
                {input(f)}
                {f.hint && !err(f.name) && <p className="field-hint">{f.hint}</p>}
                {err(f.name) && <p className="field-error">{err(f.name)}</p>}
              </div>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset className="panel border-accent-500/30! p-5 md:p-6">
        <legend className="px-1 text-lg font-semibold">{t('Avec vos propres mots')}</legend>
        <label className="label mt-2" htmlFor="b-ownWords">{t('Expliquez avec vos propres mots comment vous aimeriez que votre projet fonctionne.')}<span className="text-accent-600" aria-hidden> *</span></label>
        <textarea id="b-ownWords" name="ownWords" rows={10} className="textarea" defaultValue={data.ownWords ?? ''} disabled={locked} aria-invalid={err('ownWords') ? true : undefined} />
        {err('ownWords') && <p className="field-error">{err('ownWords')}</p>}
      </fieldset>
      <label className="flex items-start gap-3 text-sm text-fg-soft">
        <input type="checkbox" name="aiConsent" defaultChecked={aiConsent} disabled={locked} className="check mt-0.5" />
        <span>{t('J’autorise ATHANA à traiter ce briefing à l’aide d’outils d’intelligence artificielle pour préparer mon projet. Facultatif : sans cet accord, vos données personnelles ne sont transmises à aucun outil d’IA.')}</span>
      </label>
      {state && !state.ok && <p role="alert" className="alert alert-danger">{state.message}</p>}
      {state?.ok && state.message === 'saved' && <p role="status" className="alert alert-ok">{t('Brouillon enregistré. Vous pouvez continuer plus tard.')}</p>}
      {state?.ok && state.message === 'submitted' && <p role="status" className="alert alert-ok">{t('Briefing envoyé. Vous pouvez encore le modifier, puis le confirmer définitivement.')}</p>}
      {!locked && <Buttons status={status} onIntent={setIntent} />}
      {status === 'SUBMITTED' && (
        <div className="panel flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-fg-soft">{t('Tout est correct ? Confirmez le briefing pour lancer la production. Il ne sera plus modifiable ensuite.')}</p>
          <button type="submit" name="intent" value="confirm" className="btn btn-secondary" onClick={(e) => { if (!window.confirm(t('Confirmer définitivement le briefing ?'))) e.preventDefault(); }}>{t('Confirmer définitivement')}</button>
        </div>
      )}
    </form>
  );
}
