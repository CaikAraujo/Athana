import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { Card, PageHeader } from '@/components/ui';
import { BlogForm } from '../../../ContentForms';

export default async function EditPost({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const post = id === 'new' ? null : await db.blogPost.findUnique({ where: { id } });
  if (id !== 'new' && !post) notFound();
  return (<><PageHeader title={post ? post.title : t('Nouvel article')} /><Card><BlogForm post={post ? JSON.parse(JSON.stringify(post)) : undefined} /></Card></>);
}
