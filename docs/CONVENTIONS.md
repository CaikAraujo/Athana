# Development conventions

Read this before adding code. It is short on purpose.

## Stack
Next.js 16 (App Router, React 19, Server Components + Server Actions), TypeScript strict, Tailwind CSS 4,
PostgreSQL + Prisma 6, Vitest (integration tests against a real test database), Playwright (E2E).
Next 16 specifics: `params` / `searchParams` are Promises (`await` them); the middleware file is `src/proxy.ts`.

## Layout of the code
```
prisma/schema.prisma            single schema; tenant tables are prefixed Crm* / Pt*
src/lib/                        cross-cutting helpers (db, env, errors, action wrapper, money, rate limit, audit)
src/modules/<module>/service.ts business logic — plain async functions, no Next.js imports, unit-testable
src/modules/<module>/actions.ts 'use server' actions: guard → validate → call the service → revalidate
src/app/[locale]/…              pages (Server Components by default)
src/components/ui/              design-system components (index.tsx = server-safe, form.tsx = client)
src/components/app/AppShell.tsx shell for every authenticated area
tests/*.test.ts                 Vitest
```

## Rules
1. **Business logic lives in services.** Pages and actions never query Prisma for tenant data directly.
2. **Tenant isolation.** Every CRM / Pointage service function takes `ctx: TenantCtx` first and puts
   `organizationId: ctx.organizationId` in every `where` / `data`. To load a record by id use
   `findFirst({ where: { id, organizationId: ctx.organizationId } })`, never `findUnique({ where: { id } })`.
   Related ids received from the client (companyId, stageId, employeeId…) must be re-validated against the tenant.
3. **Permissions are enforced in the backend** (`assertOrgRole`, `assertFeature`, `assertWithinLimit`,
   `assertPermission`). Hiding a button is never enough.
4. **Errors.** Throw `new AppError(m('Message en français.'))` for anything the user may read.
   Actions wrap their body in `run(async () => { … })` from `@/lib/action`, which returns an `ActionState`.
5. **i18n.** French is the source language and the key: `t('Texte en français')` (server: `const t = await getT(locale)`,
   client: `const t = useT()`), interpolation `t('Bonjour {name}', { name })`. Strings outside a `t()` call that
   must be translated later (error messages, zod messages, label maps) are wrapped in `m('…')` from `@/i18n/translate`
   and translated at display time with `t(value)`. Only plain string literals (no template literals, no concatenation)
   so the extraction script can find them. Never edit `src/i18n/messages/*.json` by hand in a feature branch —
   run `npm run i18n:check` to list missing translations.
6. **Links.** Internal paths are written unlocalised (`/app/crm/contacts`). Client components use `Link` from
   `@/i18n/client`; server code uses `localePath(locale, path)`.
7. **Money** is an integer in minor units + a currency code; format with `formatMoney`. Dates with
   `formatDate` / `formatDateTime`. Prices, taxes and limits come from the database, never from constants.
8. **UI.** Use the classes from `src/app/globals.css` (`btn`, `card`, `panel`, `input`, `badge`, `table`, `alert`,
   `empty`…) and the components in `src/components/ui`. Forms use `ActionForm` + `Input`/`Select`/`Textarea`/`Submit`;
   one-click mutations use `ActionButton`; dialogs use `Modal`. Every list has an empty state; every form shows
   field errors and a pending state; add a `loading.tsx` (`<PageSkeleton />`) per section.
   Everything must work from 360 px wide.
9. **Audit.** State-changing operations on sensitive data call `audit({...})`.
10. **Tests.** Each module ships a `tests/<module>.test.ts` using `tests/helpers.ts`. Tests create their own
    uniquely-named data and never truncate tables.
