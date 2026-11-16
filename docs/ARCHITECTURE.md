# Arquitetura da plataforma ATHANA

Este documento descreve a arquitetura tal como está no código do ramo `claude/athana-platform`. Tudo o que está preparado mas não implementado, ou implementado mas não verificado, é assinalado como tal.

Documentos relacionados: [DATABASE.md](DATABASE.md), [ENVIRONMENT.md](ENVIRONMENT.md), [DEPLOYMENT.md](DEPLOYMENT.md), [SECURITY.md](SECURITY.md), [INTEGRATIONS.md](INTEGRATIONS.md), [TESTING.md](TESTING.md), [CONVENTIONS.md](CONVENTIONS.md) (regras de desenvolvimento, em inglês).

## 1. Stack e justificação

| Camada | Tecnologia (versão instalada) | Porquê |
|---|---|---|
| Framework | Next.js 16.4 (App Router, Server Components, Server Actions), React 19.3 | Um único projeto serve o site público, a área de cliente, o backoffice e as aplicações SaaS, com renderização no servidor para SEO. |
| Linguagem | TypeScript 7 em modo `strict` | Tipos partilhados entre base de dados, serviços e interface. |
| Base de dados | PostgreSQL 16 + Prisma 6.19 | Transações, restrições de unicidade e sequências usadas pelo fluxo de pagamentos e pela numeração. |
| Estilos | Tailwind CSS 4 (`src/app/globals.css`) | Sistema de classes próprio (`btn`, `card`, `input`…). |
| Validação | zod 4 | Validação de entradas em serviços e ações. |
| Pagamentos | SDK `stripe` 23 (Checkout alojado) + fornecedor de teste interno | Ver secção 6. |
| E-mail | SDK `resend` 6 ou modo `log` | Ver [INTEGRATIONS.md](INTEGRATIONS.md). |
| PDF | `pdf-lib` | Relatórios do Pointage. |
| Testes | Vitest 5 (integração sobre PostgreSQL real), Playwright 1.63 (E2E) | Ver [TESTING.md](TESTING.md). |

### De onde vem o projeto

O repositório original era uma SPA Vite/React com três funções Vercel (`legacy/api/contact.ts`, `callback.ts`, `elite-filter.ts`) que só enviavam e-mail. Não tinha base de dados nem autenticação. Esse código foi movido sem alterações para `legacy/` e não é compilado nem publicado (está excluído em `.dockerignore`).

A plataforma pedida (catálogo com encomendas e pagamentos, área de cliente, backoffice, software por subscrição com várias empresas clientes) exige um backend real. Por isso foi reconstruída como **monólito modular em Next.js**: um único processo e uma única base de dados, com o código de negócio separado por módulos. A alternativa de vários serviços foi rejeitada por acrescentar operação (deploys, rede, consistência entre bases de dados) sem benefício para uma equipa pequena.

`next.config.ts` mantém redirecionamentos dos URL antigos (`/fr/...`, `/:locale/projets`, `/:locale/impressum`, etc.) para os novos.

## 2. Estrutura de pastas

```
prisma/
  schema.prisma              esquema único (56 modelos, 23 enums)
  migrations/                2 migrações (init + sequências)
  seed.ts, seed-data/        dados de referência (idempotente)
src/
  proxy.ts                   middleware do Next 16: deteção de idioma e reescrita de URL
  lib/                       utilitários transversais (db, env, erros, action, crypto, rate-limit, audit, csv, money, markdown, seo, settings)
  i18n/                      configuração de locales, dicionários, t() servidor e cliente
  modules/<módulo>/          lógica de negócio (service.ts) e Server Actions (actions.ts)
  app/[locale]/(site)/       site público (catálogo, carrinho, checkout, blog, legal, landing pages)
  app/[locale]/(auth)/       login, registo, recuperação de palavra-passe
  app/[locale]/account/      área de cliente
  app/[locale]/admin/        backoffice ATHANA
  app/[locale]/app/crm/      ATHANA CRM
  app/[locale]/app/pointage/ ATHANA Pointage
  app/[locale]/sandbox-payment/  página de pagamento de teste (só com PAYMENTS_MODE=test)
  app/api/                   11 route handlers (webhooks, cron, ficheiros, exportações, health, consent)
  app/demo/[slug]/           demonstrações navegáveis dos modelos
  demos/                     código das 10 demonstrações + registry.ts
  components/ui/             componentes do design system (index.tsx servidor, form.tsx cliente)
  components/app/            AppShell e peças das áreas autenticadas
  components/site/           cabeçalho, rodapé, consentimento, configurador, formulários públicos
tests/                       Vitest (3 ficheiros)
e2e/                         Playwright (3 specs + setup)
scripts/                     i18n-check.ts, capture-catalog.mjs, check-public-assets.mjs
deploy/                      Caddyfile, backup.sh, restore.sh
legacy/                      site antigo, intocado
```

Contagens atuais: 107 páginas (`page.tsx`), das quais 35 no backoffice, 16 na área de cliente, 17 no CRM e 13 no Pointage.

## 3. Mapa de módulos (`src/modules/*`)

| Módulo | Ficheiros principais | Responsabilidade |
|---|---|---|
| `auth` | `service.ts`, `session.ts`, `rbac.ts`, `actions.ts` | Registo, login, recuperação e alteração de palavra-passe; sessões em base de dados; papéis e permissões da equipa ATHANA; guardas `requireUser`, `requireStaff`, `assertUser`, `assertPermission`. |
| `tenancy` | `context.ts`, `guard.ts`, `members.ts` | `TenantCtx`, papéis por organização, limites e funcionalidades do plano, criação de organizações, convites e gestão de membros. |
| `catalog` | `service.ts` | Leitura de categorias, produtos (modelos), pacotes e opções. |
| `orders` | `cart.ts`, `cart-cookie.ts`, `service.ts`, `actions.ts` | Carrinho em cookie, cálculo de preços no servidor, cupões, criação e cancelamento de encomendas, numeração. |
| `payments` | `types.ts`, `service.ts`, `stripe-provider.ts`, `test-provider.ts` | Interface de fornecedor, pipeline único de webhooks, reembolsos. |
| `projects` | `service.ts` | Projeto por item de encomenda, briefing, estados, mensagens, revisões, aprovação, exportação do brief. |
| `billing` | `service.ts` | Subscrições SaaS: período de teste, ativação, mudança de plano, cancelamento, retoma, tarefa diária. |
| `automation` | `events.ts` | Eventos de domínio → e-mails, notificações e tarefas internas. |
| `email` | `service.ts` | Envio por modelo guardado em base de dados; registo em `EmailLog`. |
| `storage` | `service.ts` | Adaptador de armazenamento (disco local), validação de uploads. |
| `content` | `actions.ts`, `campaigns.ts`, `services.ts`, `saas-copy.ts` | Formulário de contacto/orçamento (leads), textos das páginas de serviço, das páginas SaaS e das landing pages de campanha. |
| `analytics` | `track.ts` | Camada `track()` neutra, dependente do consentimento. |
| `admin` | `actions.ts`, `queries.ts` | Server Actions do backoffice (catálogo, encomendas, projetos, finanças, conteúdo, definições, equipa, pedidos RGPD) e consultas de indicadores. |
| `account` | `actions.ts` | Server Actions da área de cliente (perfil, empresas, subscrições, briefing, ficheiros, mensagens, tickets, notificações). |
| `crm` | `contacts.ts`, `pipeline.ts`, `engagement.ts`, `proposals.ts`, `files.ts`, `insights.ts`, `export.ts`, `team.ts`, `onboarding.ts`, `shared.ts`, `service.ts` (reexporta), `actions.ts` | ATHANA CRM. |
| `pointage` | `service.ts`, `time.ts`, `actor.ts`, `settings.ts`, `reports.ts`, `retention.ts`, `actions.ts` | ATHANA Pointage (registo de ponto, ausências, relatórios, retenção). |

Regra estrutural: os ficheiros `service.ts` são funções assíncronas simples, sem importações do Next.js, e por isso são chamados diretamente pelos testes. Os ficheiros `actions.ts` (`'use server'`) fazem apenas: guarda → validação → serviço → revalidação.

## 4. Fluxo de um pedido

```
Browser
  │
  ▼
src/proxy.ts ─── sem prefixo de locale → 307 para /<locale>/… (cookie athana_locale > Accept-Language > fr-ch)
  │           ─── /fr-ch/modeles → reescrita interna para /fr-ch/templates
  │           ─── /fr-ch/templates (chave interna usada em público) → 308 para /fr-ch/modeles
  ▼
src/app/[locale]/…  Server Components (layouts aplicam as guardas)
  │
  ├─ leitura: chamam os serviços / Prisma e renderizam no servidor
  │
  └─ escrita: <form action={serverAction}>  →  src/modules/*/actions.ts
                                               └─ run(async () => { guarda; validação; serviço; revalidatePath })
                                                     └─ src/modules/*/service.ts → Prisma → PostgreSQL
                                                           └─ emit(evento) → src/modules/automation/events.ts
```

### Proxy e URL localizados

`src/proxy.ts` é o middleware (no Next 16 o ficheiro chama-se `proxy.ts`). O `matcher` exclui `/api`, `/_next`, `/demo`, `/images` e ficheiros estáticos.

Os URL públicos têm o formato `/<locale>/<segmento-traduzido>/…`. Só o primeiro segmento a seguir ao locale é traduzido, segundo o mapa `SEGMENTS` de `src/i18n/config.ts` (21 segmentos). Exemplos: a rota interna `/templates` é `/fr-ch/modeles`, `/pt-pt/modelos` e `/pt-br/modelos`; `/account` é `/compte` e `/conta`.

O código escreve sempre caminhos internos (`/app/crm/contacts`). A conversão é feita por `localePath(locale, path)` no servidor e pelo componente `Link` de `src/i18n/client.tsx` no cliente.

### Guardas

| Zona | Guarda | Ficheiro |
|---|---|---|
| Área de cliente | `requireUser(locale)` no layout | `src/app/[locale]/account/layout.tsx` |
| Backoffice | `requireStaff(locale, 'dashboard.view')` no layout; cada página e ação volta a verificar a permissão específica | `src/app/[locale]/admin/layout.tsx`, `src/modules/admin/actions.ts` |
| CRM / Pointage (páginas) | `requireTenant(locale, 'crm' \| 'pointage')` | `src/app/[locale]/app/crm/_ui/page.ts`, `src/app/[locale]/app/pointage/_components/server.tsx` |
| CRM / Pointage (ações e API) | `tenantFromSession(productKey)` | `src/modules/tenancy/guard.ts` |

### `run()` — invólucro das Server Actions

`src/lib/action.ts` exporta `run(fn, locale?)`. Todas as ações devolvem um `ActionState` (`{ ok, message?, fieldErrors?, data? }`):

- `AppError` (`src/lib/errors.ts`) → mensagem traduzida e erros por campo;
- `ZodError` → erros por campo traduzidos;
- qualquer outro erro → registado com `console.error('[action]', …)` e substituído por uma mensagem genérica (os detalhes internos nunca chegam ao browser);
- os redirecionamentos do Next.js passam sem ser intercetados.

No cliente, `ActionForm` (`src/components/ui/form.tsx`) usa `useActionState` para mostrar estado pendente, erros e confirmação.

## 5. Modelo multi-empresa (multi-tenant)

Uma **organização** (`Organization`) é uma empresa cliente. Um utilizador pode pertencer a várias através de `Membership` (papéis `OWNER`, `ADMIN`, `MANAGER`, `MEMBER`). Todas as tabelas dos produtos SaaS (`Crm*`, `Pt*`) têm `organizationId`. Há uma única base de dados partilhada; o isolamento é feito no código de serviço, não por esquemas ou por Row Level Security do PostgreSQL.

```ts
// src/modules/tenancy/context.ts
type TenantCtx = {
  userId: string;
  organizationId: string;
  role: OrgRole;
  subscription: (Subscription & { plan: Plan }) | null;
};
```

| Peça | Comportamento |
|---|---|
| Organização ativa | Guardada em `Session.activeOrganizationId`, no servidor. É definida ao criar a sessão (a adesão mais antiga) e alterada por `switchOrganization`, que verifica a adesão. Nunca é lida do corpo do pedido. |
| `loadTenantCtx(userId, organizationId, productKey?)` | Lê a adesão e a subscrição na base de dados; sem adesão lança `forbidden`. |
| `requireTenant(locale, productKey)` | Para páginas. Sem sessão → login; sem organização ativa ou sem adesão → `/account/companies?need=<produto>`; sem subscrição utilizável → `/account/subscriptions?product=<produto>`. |
| `tenantFromSession(productKey)` | Para ações e rotas de API. Lança erro em vez de redirecionar e exige subscrição utilizável. |
| `subscriptionIsUsable` | `ACTIVE` e `PAST_DUE` são utilizáveis; `TRIALING` e `CANCELED` só até `currentPeriodEnd`; `INCOMPLETE` não é. |
| `assertOrgRole`, `assertFeature`, `assertWithinLimit` | Papel mínimo, funcionalidade incluída em `Plan.features`, limite numérico de `Plan.limits` (ausente = ilimitado). |

Regras aplicadas em todos os serviços CRM e Pointage (ver `docs/CONVENTIONS.md`): o primeiro argumento é `ctx: TenantCtx`; todos os `where` e `data` incluem `organizationId: ctx.organizationId`; um registo é carregado com `findFirst({ where: { id, organizationId } })`; os identificadores relacionados vindos do cliente (empresa, etapa, funcionário…) são validados de novo contra a organização (`requireCompany`, `requireStage`, etc. em `src/modules/crm/shared.ts`).

O Pointage acrescenta um papel próprio por cima do papel da organização (`resolveActor` em `src/modules/pointage/actor.ts`): `ADMIN`, `MANAGER` (limitado aos departamentos que gere), `EMPLOYEE` ou `NONE`.

## 6. Pagamentos

### Abstração de fornecedor

`src/modules/payments/types.ts` define a interface `PaymentProvider`:

| Método | Função |
|---|---|
| `createCheckout` | Pagamento único de uma encomenda; devolve o URL da página de pagamento alojada. |
| `createSubscriptionCheckout` | Ativação de uma subscrição mensal. |
| `refund` | Reembolso total ou parcial. |
| `setCancelAtPeriodEnd` | Agendar ou anular o cancelamento no fim do período. |
| `parseWebhook` | Verifica a assinatura e converte o evento do fornecedor num `PaymentEvent` neutro. |

Existem dois fornecedores: `stripeProvider` e `testProvider` (sandbox interno, só disponível com `PAYMENTS_MODE=test`). `getProvider()` escolhe conforme `env.paymentsMode`. Não existe adaptador PayPal; o tipo `id` da interface só admite `'stripe' | 'test'`.

Só há **checkout alojado**: os dados de cartão nunca passam pelos servidores da ATHANA.

### Pipeline único de webhooks

`processWebhook(providerId, rawBody, signature)` em `src/modules/payments/service.ts` é a única porta de entrada, usada por `/api/webhooks/stripe`, por `/api/webhooks/test` e pela ação `sandboxPayAction`:

1. O adaptador verifica a assinatura. Se for inválida lança erro e nada é escrito (resposta HTTP 400).
2. Numa única transação: insere-se a linha em `WebhookEvent` (único por `provider` + `eventId`) e aplicam-se os efeitos (`apply`).
3. Se o evento já existir, a restrição de unicidade falha (`P2002`) e a função devolve `duplicate` sem efeitos.
4. Se algo falhar, a transação é anulada, o endpoint responde 500 e o fornecedor pode repetir o envio.
5. Depois do commit, os eventos de domínio resultantes são emitidos (`emit`).

Em `checkout.completed`, o montante e a moeda do evento são comparados com `order.total` e `order.currency`; se forem diferentes, o evento é rejeitado. A encomenda só passa a `PAID` por este caminho — o estado de pagamento não pode ser alterado manualmente (`setProjectStatus` recusa `PAYMENT_PENDING` e `PAID`).

Efeitos de `checkout.completed`: encomenda `PAID`, registo `Payment`, incremento do cupão, projetos em `BRIEFING_PENDING` com `Briefing` vazio criado, fatura emitida com numeração por sequência.

## 7. Camada de automação por eventos de domínio

`src/modules/automation/events.ts` define o tipo `DomainEvent` e a função `emit(event)`. Os serviços chamam `emit` depois de a transação ter sido confirmada. Os handlers nunca propagam erros a quem os chamou (são registados com `console.error('[automation]', …)`).

| Evento | Efeitos |
|---|---|
| `user.registered` | E-mail `welcome`. |
| `order.paid` | E-mail `order_confirmation`; notificação ao cliente; tarefa `order_review` (prazo 1 dia); notificação à equipa; e-mail interno `admin_new_order`. |
| `order.payment_failed` | E-mail `payment_failed`; notificação ao cliente. |
| `order.refunded` | E-mail `refund`. |
| `briefing.submitted` | Tarefa `production` (prazo 2 dias); notificação à equipa; e-mails `admin_briefing_submitted` e `briefing_received`. |
| `project.status_changed` | Notificação e e-mail `project_status` (exceto para `INTERNAL_REVIEW`, `PAID`, `BRIEFING_SUBMITTED`). Em `APPROVED`: tarefa `delivery` e, se `maintenance.offerEnabled`, tarefa `maintenance_offer`. |
| `project.message` | Mensagem da equipa → notificação e e-mail `new_message` ao cliente. Mensagem do cliente → notificação ao responsável do projeto ou, se não houver, à equipa. |
| `subscription.activated`, `.payment_failed`, `.canceled`, `.cancel_scheduled`, `.renewal_notice` | E-mail `subscription_*` e notificação aos `OWNER` da organização. |
| `lead.created` | Notificação à equipa; e-mails `admin_new_lead` e `lead_ack`. |

É uma camada síncrona dentro do mesmo processo: não há fila de mensagens nem repetição automática. Se um handler falhar a meio, os passos seguintes desse evento não são executados.

## 8. Internacionalização

| Aspeto | Implementação |
|---|---|
| Locales encaminhados | `fr-ch`, `fr-fr`, `pt-pt`, `pt-br` (`LOCALES` em `src/i18n/config.ts`). `en` está em `PREPARED_LOCALES`, com `en.json` vazio: **preparado, não ativo**. |
| Estilo gettext | A frase de origem em francês é a chave: `t('Texte en français')`, com interpolação `t('Bonjour {name}', { name })`. |
| `m('…')` | Marca uma frase para extração sem a traduzir (mensagens de `AppError`, zod, mapas de etiquetas). É traduzida no momento de mostrar. |
| Dicionários | `src/i18n/messages/pt-PT.json` e `pt-BR.json` (1804 frases cada, completos). `fr-FR.json` e `en.json` estão vazios: `fr-fr` usa as frases de origem. `pt-BR` recorre a `pt-PT` em caso de falta. |
| Servidor | `const t = await getT(locale)` (`src/i18n/server.ts`). O dicionário é JSON + substituições da tabela `TranslationOverride` (editável no backoffice). |
| Cliente | `useT()` (`src/i18n/client.tsx`). Só as 399 frases usadas em componentes `'use client'` são enviadas ao browser, segundo `src/i18n/generated/client-keys.json`. |
| Ferramenta | `npm run i18n:check` (`scripts/i18n-check.ts`) extrai as chamadas `t('…')` e `m('…')` de `src/` (exceto `src/demos`), falha se faltar uma tradução pt-PT/pt-BR, se os marcadores `{x}` não coincidirem ou se `client-keys.json` estiver desatualizado. `-- --write` regenera os ficheiros de `generated/`. |
| Conteúdo em base de dados | Campos `Json` localizados (`{ "fr": …, "pt-PT": …, "pt-BR": … }`), resolvidos por `pick()` / `L()`. Artigos de blog, páginas legais e modelos de e-mail têm uma linha por idioma. |
| Tabela `Market` | Liga cada locale a idioma, país, moeda, taxa e etiqueta de imposto, fuso horário e lista informativa de meios de pagamento. É editável no backoffice; os valores de `LOCALE_META` são apenas os valores iniciais do seed. |
| SEO | `pageMeta()` (`src/lib/seo.tsx`) gera canonical e `hreflang` para todos os mercados; `sitemap.ts` e `robots.ts` são dinâmicos. |

Limitações factuais: as mensagens de erro devolvidas por `run()` usam os dicionários JSON e não as substituições de `TranslationOverride`; os títulos das tarefas internas e das notificações para a equipa estão escritos em francês no código; o conteúdo das demonstrações não passa pelo sistema de tradução.

## 9. Arquitetura para software futuro: como acrescentar um produto SaaS

A plataforma foi desenhada para receber novos produtos sem tocar em autenticação, empresas, faturação ou notificações. O seed já cria quatro produtos com estado `COMING_SOON` e sem planos: `pos` (ATHANA POS), `stock` (ATHANA Stock), `booking` (ATHANA Booking) e `projects` (ATHANA Projects). Aparecem na página inicial e em `/software` como "em preparação". **Não têm código, tabelas nem rotas.**

Passos para lançar um produto com a chave `<key>`:

1. **Dados.** Criar ou atualizar a linha `SaasProduct` (`status: ACTIVE`) e as linhas `Plan` (preços por moeda, `includedSeats`, `seatPrices`, `limits`, `features`, `trialDays`). Para um produto novo, acrescentar a `prisma/seed-data/saas.ts`; os planos são depois editáveis em Admin → Planos.
2. **Esquema.** Acrescentar os modelos em `prisma/schema.prisma` com um prefixo próprio, `organizationId` obrigatório, relação `onDelete: Cascade` com `Organization` e índices a começar por `organizationId`. Gerar uma migração aditiva (`npm run db:migrate:dev`).
3. **Módulo.** Criar `src/modules/<key>/service.ts` (funções com `ctx: TenantCtx` como primeiro argumento) e `actions.ts` (cada ação começa por `tenantFromSession('<key>')` e é envolvida por `run()`).
4. **Rotas.** Criar `src/app/[locale]/app/<key>/layout.tsx` com `requireTenant(locale, '<key>')` e o `AppShell`, e as páginas por baixo. O segmento `app` já está em `SEGMENTS`; não é preciso mexer no proxy.
5. **Página pública.** Acrescentar o texto do produto a `saasCopy()` em `src/modules/content/saas-copy.ts`. Sem essa entrada, `/software/<key>` devolve 404 mesmo com o produto `ACTIVE`. Se a página deve entrar no sitemap, acrescentar o caminho à lista `STATIC` de `src/app/sitemap.ts`.
6. **Traduções.** Correr `npm run i18n:check -- --write` e preencher as frases em falta em `pt-PT.json` e `pt-BR.json`.
7. **Testes.** Criar `tests/<key>.test.ts` com os utilitários de `tests/helpers.ts` (`createTenant` só aceita hoje `'crm' | 'pointage'`; alargar o tipo).

O que é reutilizado sem alterações:

| Capacidade | Onde |
|---|---|
| Contas, sessões, recuperação de palavra-passe | `src/modules/auth` |
| Empresas, membros, convites, troca de empresa ativa | `src/modules/tenancy`, `/account/companies` |
| Período de teste, ativação paga, cancelamento, retoma | `src/modules/billing`; a página `/account/subscriptions` lista todos os produtos `ACTIVE` a partir da base de dados |
| Entrada no menu "O meu software" da área de cliente | `src/app/[locale]/account/layout.tsx` (gerada a partir das subscrições) |
| Notificações e e-mails de subscrição | `src/modules/automation/events.ts` |
| Limites e funcionalidades por plano | `assertWithinLimit`, `assertFeature` |
| Anexos privados | `storeUpload('tenants', file)` + `FileAsset.organizationId` |
| Auditoria | `audit({ organizationId, … })` |

Pontos onde o código atual ainda tem o produto escrito à mão e que teriam de ser generalizados: `syncSeats` do Pointage atualiza `Subscription.seats` só para `pointage`; a retenção diária (`runPointageRetention`) é específica do Pointage; `/api/cron/daily` chama os trabalhos um a um.

## 10. Da encomenda ao projeto de desenvolvimento

1. **Carrinho.** O cookie `athana_cart` guarda apenas identificadores (produto, pacote, opções, código de cupão). `priceCart()` recalcula tudo a partir da base de dados e do `Market` do locale.
2. **Encomenda.** `createOrder()` cria, numa transação, a `Order` (`PENDING_PAYMENT`, número `ATH-<ano>-<nnnnn>`), um `OrderItem` por linha (com cópia do nome, escalão, preço e opções) e **um `Project` por item** (`PRJ-<ano>-<nnnnn>`, estado `PAYMENT_PENDING`).
3. **Pagamento.** `startCheckout()` redireciona para a página alojada. O evento verificado `checkout.completed` passa a encomenda a `PAID`, os projetos a `BRIEFING_PENDING`, cria o `Briefing` e a fatura.
4. **Briefing** (`/account/projects/[id]/briefing`). O cliente guarda rascunhos (`saveBriefing`), envia (`submitBriefing`, que exige `companyName`, `contactName`, `email`, `goal` e `ownWords`) e confirma definitivamente (`confirmBriefing`). O projeto passa a `BRIEFING_SUBMITTED` e depois a `PROJECT_QUEUED`. Pode anexar ficheiros (logótipo, imagens, documentos). A caixa de consentimento de IA (`Briefing.aiConsent`) está desligada por omissão.
5. **Produção.** A equipa atribui um responsável e um prazo (`assignProject`, permissão `projects.manage`) e altera o estado (`setProjectStatus`, permissão `projects.work`; quem não tem `projects.manage` só altera projetos que lhe estão atribuídos).
6. **Revisão do cliente.** Em `CLIENT_REVIEW` o cliente pede uma revisão (`requestRevision` → `REVISION_REQUESTED`) ou aprova (`approveProject` → `APPROVED`).
7. **Entrega.** A equipa passa a `DEPLOYMENT_PENDING`, `COMPLETED` e, se aplicável, `MAINTENANCE`.

Estados (`ProjectStatus`), por ordem: `PAYMENT_PENDING`, `PAID`, `BRIEFING_PENDING`, `BRIEFING_SUBMITTED`, `PROJECT_QUEUED`, `IN_DEVELOPMENT`, `INTERNAL_REVIEW`, `CLIENT_REVIEW`, `REVISION_REQUESTED`, `APPROVED`, `DEPLOYMENT_PENDING`, `COMPLETED`, `MAINTENANCE`. Cada transição fica registada em `ProjectEvent`. A equipa pode escolher qualquer estado exceto os dois de pagamento; a ordem não é imposta pelo código.

Tarefas internas (`Task`, visíveis em Admin → Tarefas) são criadas pelas automações: `order_review`, `production`, `delivery`, `maintenance_offer`, `data_request`.

### Exportação do brief em JSON

`GET /api/admin/projects/[id]/brief` (permissão `projects.view`) devolve um ficheiro `<referência>-brief.json` com o esquema `athana.project-brief/v1`: projeto, produto (modelo, escalão, demonstração, tecnologias, opções, páginas e revisões incluídas), briefing e lista de ficheiros. Cada exportação é registada no `AuditLog`.

Redação sem consentimento de IA: quando `aiConsent` é falso, os campos `contact.name`, `contact.email`, `contact.phone` e `company.address` são substituídos por `[redacted — no AI consent]`. O nome da empresa e os campos de texto livre (objetivo, público, textos, "pelas suas palavras"…) são exportados em qualquer caso; se o cliente lá escreveu dados pessoais, eles constam do ficheiro. O campo `aiProcessingConsent` indica o estado do consentimento.

Nada é enviado automaticamente a nenhum serviço de IA. O ficheiro é descarregado por um membro da equipa, que decide o que fazer com ele.

### Demonstrações dos modelos

`src/demos/<slug>/` contém as 10 demonstrações navegáveis (`atelier`, `maison-lumiere`, `clinique-alba`, `helvetia-immo`, `studio-eclat`, `batipro`, `alpina-voyages`, `boutique-nord`, `cabinet-meridien`, `portfolio-lena`), registadas em `src/demos/registry.ts` e servidas em `/demo/<slug>/<página>`. Servem de montra (incorporadas na página do produto com `?embed=1`), de origem das imagens do catálogo (`scripts/capture-catalog.mjs`) e de ponto de partida para o desenvolvimento do site do cliente. Estão marcadas `noindex`.

## 11. Decisões e compromissos

| Decisão | Motivo | Contrapartida |
|---|---|---|
| Autenticação própria (sessões em base de dados, scrypt) em vez de uma biblioteca | Controlo total sobre a organização ativa na sessão, revogação imediata, sem dependência externa. | Não há 2FA, login social nem verificação de e-mail; qualquer funcionalidade nova tem de ser escrita e revista. |
| Carrinho em cookie (`athana_cart`, httpOnly, 30 dias) | Funciona sem conta e sem tabela; só guarda identificadores e os preços são recalculados no servidor. | O carrinho não acompanha o utilizador entre dispositivos; máximo de 10 artigos. |
| Limitador de pedidos em PostgreSQL (`RateLimit`) | Os limites valem para todas as instâncias sem Redis. | Uma escrita na base de dados por pedido limitado; janela fixa (permite rajadas no limite entre duas janelas). |
| Armazenamento em disco local com interface `StorageAdapter` | Simples num servidor único; os ficheiros ficam fora da raiz web. | Exige volume persistente e impede várias instâncias sem disco partilhado. O adaptador S3 **não está escrito**. |
| Só checkout alojado | Nenhum dado de cartão nos servidores; âmbito PCI mínimo. | O aspeto da página de pagamento é o do fornecedor. |
| Uma linha de Stripe com o total calculado pela ATHANA | O total cobrado é sempre igual ao da encomenda (descontos e impostos calculados com as definições do backoffice). | O Stripe não conhece o detalhe por artigo nem calcula impostos (Stripe Tax não é usado). |
| Automação síncrona no mesmo processo | Sem infraestrutura adicional. | Sem repetição automática; um e-mail lento atrasa a resposta. |
| Isolamento multi-empresa ao nível do serviço | Uma base de dados, migrações simples. | Depende da disciplina do código; coberto por testes de acesso cruzado, não por RLS. |
| Monólito modular | Um deploy, uma base de dados, transações simples. | Escala apenas em bloco; os limites entre módulos são convenção. |
