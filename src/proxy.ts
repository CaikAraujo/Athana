import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, SEGMENTS, internalSegment, isLocale, localePath, type Locale } from '@/i18n/config';

const LOCALE_COOKIE = 'athana_locale';

function detectLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const header = (req.headers.get('accept-language') || '').toLowerCase();
  for (const part of header.split(',')) {
    const tag = part.split(';')[0].trim();
    if (tag === 'pt-br') return 'pt-br';
    if (tag.startsWith('pt')) return 'pt-pt';
    if (tag === 'fr-ch') return 'fr-ch';
    if (tag === 'fr-fr' || tag === 'fr-be' || tag === 'fr-lu') return 'fr-fr';
    if (tag.startsWith('fr')) return 'fr-ch';
  }
  return DEFAULT_LOCALE;
}

/**
 * 1. Requests without a locale prefix are redirected once to the visitor's preferred locale
 *    (explicit choice cookie > Accept-Language > default). A visitor on a localised URL is
 *    never redirected away from it, so switching language manually always works.
 * 2. Localised first segments (/fr-ch/modeles) are rewritten to the internal route (/fr-ch/templates).
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const parts = pathname.split('/').filter(Boolean);

  if (!isLocale(parts[0])) {
    const url = req.nextUrl.clone();
    url.pathname = localePath(detectLocale(req), '/' + parts.join('/'));
    return NextResponse.redirect(url, 307);
  }

  const locale = parts[0];
  const first = parts[1];
  let res: NextResponse;
  if (first) {
    const internal = internalSegment(locale, first);
    if (internal && internal !== first) {
      const url = req.nextUrl.clone();
      url.pathname = '/' + [locale, internal, ...parts.slice(2)].join('/');
      res = NextResponse.rewrite(url);
    } else if (!internal && SEGMENTS[first]) {
      // Internal key used publicly (e.g. /fr-ch/templates) → canonical localised URL.
      return NextResponse.redirect(new URL(localePath(locale, '/' + parts.slice(1).join('/')) + search, req.url), 308);
    } else {
      res = NextResponse.next();
    }
  } else {
    res = NextResponse.next();
  }
  res.headers.set('x-athana-path', pathname);
  return res;
}

export const config = {
  // Everything except API routes, Next internals, template demos and static files.
  matcher: ['/((?!api|_next|demo|images|favicon|icon|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]{2,5}$).*)'],
};
