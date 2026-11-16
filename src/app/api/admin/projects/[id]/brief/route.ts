import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { getUser } from '@/modules/auth/session';
import { exportProjectBrief } from '@/modules/projects/service';

export const dynamic = 'force-dynamic';

/** Structured project brief for the production workflow (staff only; personal data redacted without AI consent). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const brief = await exportProjectBrief(user, id);
    await audit({ actorId: user.id, action: 'project.brief_export', entity: 'Project', entityId: id, meta: { aiConsent: brief.aiProcessingConsent } });
    return new NextResponse(JSON.stringify(brief, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${brief.project.reference}-brief.json"`, 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    if (e instanceof AppError) return NextResponse.json({ error: e.code }, { status: e.code === 'forbidden' ? 403 : 404 });
    throw e;
  }
}
