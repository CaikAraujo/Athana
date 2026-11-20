import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { DICTIONARIES } from '@/i18n/dictionaries';
import { requireStaff } from '@/modules/auth/session';
import { Empty, PageHeader } from '@/components/ui';
import { TranslationForm } from '../../ContentForms';

const LANGS = ['de', 'pt-PT', 'en', 'fr'] as const;

export default async function AdminTranslations({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ lang?: string; q?: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const sp = await searchParams;
  const language = (LANGS as readonly string[]).includes(sp.lang ?? '') ? (sp.lang as (typeof LANGS)[number]) : 'pt-PT';
  const q = (sp.q ?? '').trim().toLowerCase();
  // The source list is every French string known to the Portuguese dictionary (the most complete one).
  const sources = Object.keys(DICTIONARIES['pt-PT']);
  const overrides = new Map((await db.translationOverride.findMany({ where: { language } })).map((o) => [o.source, o.value]));
  const dict = DICTIONARIES[language];
  const matches = q.length >= 2 ? sources.filter((s) => s.toLowerCase().includes(q) || (dict[s] ?? '').toLowerCase().includes(q)).slice(0, 40) : [...overrides.keys()].slice(0, 40);
  return (
    <>
      <PageHeader title={t('Traductions')} subtitle={t('Recherchez un texte de l’interface et saisissez une correction. Laissez vide pour revenir à la traduction d’origine.')} />
      <form method="get" action={localePath(locale, '/admin/content/translations')} className="mb-5 flex flex-wrap gap-2">
        <select name="lang" defaultValue={language} className="select max-w-[180px]" aria-label={t('Langue')}>{LANGS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
        <input name="q" defaultValue={sp.q} placeholder={t('Texte à rechercher (2 caractères min.)')} className="input max-w-sm" aria-label={t('Rechercher')} />
        <button className="btn btn-outline" type="submit">{t('Rechercher')}</button>
      </form>
      {matches.length === 0 ? <Empty title={q ? t('Aucun texte trouvé.') : t('Aucune correction enregistrée pour cette langue. Lancez une recherche.')} /> : (
        <ul className="panel divide-y divide-line">{matches.map((s) => <li key={s} className="p-4"><TranslationForm language={language} source={s} value={overrides.get(s) ?? ''} base={dict[s] ?? s} /></li>)}</ul>
      )}
    </>
  );
}
