import { notFound } from 'next/navigation';
import { DEMOS } from '@/demos/registry';
import { DemoBar } from './DemoBar';

type Props = { params: Promise<{ slug: string; page?: string[] }> };

export function generateStaticParams() {
  return Object.keys(DEMOS).map((slug) => ({ slug, page: [] }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const mod = await DEMOS[slug]?.();
  return { title: mod ? `${mod.meta.name} — démonstration ATHANA` : 'Démonstration' };
}

export default async function DemoPage({ params }: Props) {
  const { slug, page } = await params;
  const load = DEMOS[slug];
  if (!load) notFound();
  const { default: Demo, meta } = await load();
  return (
    <>
      <DemoBar slug={meta.slug} name={meta.name} language={meta.language} />
      <Demo page={page?.[0] ?? ''} />
    </>
  );
}
