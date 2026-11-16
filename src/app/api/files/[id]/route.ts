import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { can } from '@/modules/auth/rbac';
import { getUser } from '@/modules/auth/session';
import { storage } from '@/modules/storage/service';

export const dynamic = 'force-dynamic';

/**
 * Private file download. Access: the uploader, the project's customer, ATHANA staff with
 * projects.view (project files only), or a member of the owning organization (tenant files).
 * Unknown and forbidden files both answer 404 so ids cannot be probed.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const file = await db.fileAsset.findUnique({ where: { id: (await params).id }, include: { project: { select: { userId: true } } } });
  let allowed = false;
  if (file) {
    if (file.organizationId) {
      allowed = !!(await db.membership.findUnique({ where: { userId_organizationId: { userId: user.id, organizationId: file.organizationId } } }));
    } else {
      allowed = file.ownerId === user.id || file.project?.userId === user.id || (!!file.projectId && can(user.platformRole, 'projects.view'));
    }
  }
  if (!file || !allowed) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const data = await storage.get(file.storageKey).catch(() => null);
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': file.mime,
      'Content-Length': String(data.length),
      // Always download: uploaded SVG/HTML-like content is never rendered on our origin.
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'private, no-store',
    },
  });
}
