import { assertLocale } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { Logo } from '@/components/site/Logo';

export const metadata = { robots: { index: false } };

export default async function AuthLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  return (
    <main id="main" className="bg-grid grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <a href={localePath(locale, '/')} className="mb-8 flex justify-center no-underline"><Logo size={34} /></a>
        <div className="card card-pad">{children}</div>
      </div>
    </main>
  );
}
