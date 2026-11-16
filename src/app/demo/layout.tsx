import type { Metadata } from 'next';
import '../globals.css';

// Demos are previews with fictional content: they must not be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DemoRootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body style={{ background: '#fff' }}>{children}</body></html>;
}
