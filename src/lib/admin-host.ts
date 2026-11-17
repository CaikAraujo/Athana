/**
 * Optional dedicated host for the back office (ADMIN_HOST, e.g. "admin.athana.ch").
 * When it is set, the public site no longer serves /admin and the admin host serves nothing else.
 * Session cookies are host-only, so staff sign in separately on the admin host.
 * This file has no Node/Next imports: it is used by the proxy and by server code.
 */
export function adminHost(): string | null {
  return process.env.ADMIN_HOST?.trim().toLowerCase() || null;
}

export function normalizeHost(host: string | null | undefined): string {
  return (host ?? '').trim().toLowerCase();
}

export type HostDecision = 'allow' | 'not_found' | 'to_admin_home' | 'to_public_site';

/** `segments` are the path segments after the locale (already split). */
export function hostPolicy(requestHost: string | null | undefined, segmentsAfterLocale: string[], configured = adminHost()): HostDecision {
  if (!configured) return 'allow';
  const onAdminHost = normalizeHost(requestHost) === configured;
  const first = segmentsAfterLocale[0] ?? '';
  const isAdminPath = first === 'admin';
  if (!onAdminHost) return isAdminPath ? 'not_found' : 'allow';
  if (isAdminPath) return 'allow';
  // Sign-in and password recovery (internal or localised segment names) stay available on the admin host.
  if (AUTH_SEGMENTS.has(first)) return 'allow';
  return first === '' ? 'to_admin_home' : 'to_public_site';
}

const AUTH_SEGMENTS = new Set([
  'login', 'forgot-password', 'reset-password',
  'connexion', 'mot-de-passe-oublie', 'nouveau-mot-de-passe',
  'entrar', 'recuperar-password', 'nova-password', 'recuperar-senha', 'nova-senha',
]);

/** Absolute base URL of the back office (falls back to the main site when no admin host is configured). */
export function adminBaseUrl(appUrl: string): string {
  const host = adminHost();
  if (!host) return appUrl;
  const protocol = host.startsWith('localhost') || host.includes('.localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
