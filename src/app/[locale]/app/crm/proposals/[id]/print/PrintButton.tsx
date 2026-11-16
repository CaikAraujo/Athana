'use client';

import { Printer } from 'lucide-react';

export function PrintButton({ label }: { label: string }) {
  return <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}><Printer size={16} aria-hidden />{label}</button>;
}
