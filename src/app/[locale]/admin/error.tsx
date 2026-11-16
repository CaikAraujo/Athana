'use client';
import { ErrorState } from '@/components/app/ErrorState';
export default function Error({ reset }: { error: Error; reset: () => void }) { return <ErrorState reset={reset} />; }
