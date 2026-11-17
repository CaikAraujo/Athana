# Base de dados

Derivado de `prisma/schema.prisma` e de `prisma/migrations/`. PostgreSQL 16, uma única base de dados, acedida através do Prisma 6 (`src/lib/db.ts`).

O esquema tem 56 modelos e 23 enums. A migração inicial cria 58 tabelas: as 56 dos modelos e as duas tabelas de junção implícitas do Prisma para as relações muitos-para-muitos de `Product` (`_ProductAddons` e `_RelatedProducts`).

## 1. Convenções

| Convenção | Regra |
|---|---|
| Identificadores | `String` com `cuid()`. Exceções: `Setting.key`, `Market.code`, `SaasProduct.key` e `RateLimit.key` são chaves naturais. |
| Dinheiro | Inteiro em **unidades mínimas** (cêntimos) + código de moeda explícito. `39000` com `CHF` = 390,00 CHF. Formatação com `formatMoney`. |
| Mapas de preços | `Json` no formato `{ "CHF": 39000, "EUR": 41000, "BRL": 249000 }`. Uma moeda ausente significa que o artigo não é vendido nessa moeda (`priceFor` devolve `null`). |
| Conteúdo localizado | `Json` no formato `{ "fr": "…", "pt-PT": "…", "pt-BR": "…", "en": "…" }`, resolvido por `pick()` com recurso a `fr`. |
| Impostos | Taxa em pontos base (`taxRateBps`: `810` = 8,1 %). |
| Datas | `DateTime` em UTC. `PtAbsence.startDate` e `endDate` são `@db.Date`. |
| Eliminação lógica | `deletedAt` em `User`, `Organization`, `Category`, `Product`. |
| Cópias no momento da venda | `OrderItem` (nome, escalão, preço, opções), `Order` (taxa, etiqueta, faturação) e `Invoice` (linhas, vendedor, faturação) guardam cópias: alterar o catálogo ou as definições não altera documentos já emitidos. |
| Tabelas de empresa cliente | Prefixo `Crm*` ou `Pt*`, coluna `organizationId` obrigatória, `onDelete: Cascade` a partir de `Organization`. |

## 2. Modelos por domínio

### 2.1 Identidade e acesso

| Modelo | Finalidade | Restrições e índices importantes |
|---|---|---|
| `User` | Conta (cliente, membro de empresa ou equipa ATHANA). `platformRole` nulo = não é da equipa. `disabledAt` e `deletedAt` bloqueiam o acesso. | `email` único; índice em `platformRole`. `emailVerifiedAt` existe mas **não é escrito nem lido** pelo código atual. |
| `Session` | Sessão de login. Guarda apenas o hash SHA-256 do token, a organização ativa, IP, user-agent e validade. | `tokenHash` único; índices em `userId` e `expiresAt`; apagada em cascata com o utilizador. |
| `PasswordResetToken` | Token de recuperação/convite (hash), validade e `usedAt` (uso único). | `tokenHash` único; índice em `userId`. |
| `Organization` | Empresa cliente. `settings` (`Json`) guarda definições por produto, por exemplo `{ pointage: { jurisdiction, retentionMonths, … } }`. `onboardedAt` marca a primeira utilização do CRM. | `slug` único. |
| `Membership` | Ligação utilizador ↔ organização com papel `OWNER`/`ADMIN`/`MANAGER`/`MEMBER`. | Único por (`userId`, `organizationId`); índice em `organizationId`. |
| `AuditLog` | Registo de auditoria: ator, organização, ação, entidade, metadados, IP. | Índices em (`organizationId`, `createdAt`), (`actorId`, `createdAt`), (`entity`, `entityId`). Sem chaves estrangeiras, para sobreviver à eliminação dos registos referidos. |
| `Consent` | Prova da escolha de cookies: identificador anónimo, utilizador (se autenticado), categorias, versão da política, hash do IP, user-agent. | Índices em `anonymousId` e `userId`. |
| `DataRequest` | Pedido do titular dos dados (`EXPORT` ou `DELETE`), com estado `PENDING`/`COMPLETED`/`REJECTED`. | Índice em `status`. |

Enums: `PlatformRole` (`SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `SUPPORT`, `FINANCE`, `MARKETING`), `OrgRole`, `DataRequestType`, `DataRequestStatus`.

### 2.2 Configuração

| Modelo | Finalidade | Notas |
|---|---|---|
| `Setting` | Definições globais por chave (`company`, `invoicing`, `security`, `uploads`, `privacy`, `maintenance`). O valor é fundido com os valores por omissão de `src/lib/settings.ts`. | Chave primária `key`. |
| `Market` | Liga um locale de URL (`fr-ch`, `fr-fr`, `pt-pt`, `pt-br`) a idioma, país, moeda, `taxRateBps`, `taxLabel`, `pricesIncludeTax`, fuso horário, lista informativa de meios de pagamento e `enabled`. | Chave primária `code`. As taxas são criadas a **0** pelo seed: cabe ao proprietário defini-las depois de validação fiscal. |

### 2.3 Catálogo

| Modelo | Finalidade | Restrições e índices |
|---|---|---|
| `Category` | Categoria de modelos (nome localizado). | `slug` único. |
| `Product` | Modelo de site: textos localizados, tecnologias, `demoSlug`, imagens, `startingPrices`, FAQ, SEO, estado `DRAFT`/`PUBLISHED`/`ARCHIVED`. Relações muitos-para-muitos com `Addon` e consigo próprio (produtos relacionados). | `slug` único; índices em (`status`, `deletedAt`) e `categoryId`. |
| `Package` | Escalão de um produto (`BASIC`, `BUSINESS`, `PREMIUM`): preços, prazo, páginas e revisões incluídas. | Único por (`productId`, `tier`); cascata com o produto. |
| `Addon` | Opção adicional com preços. `global = true` é oferecida em todos os produtos. | `slug` único. |

### 2.4 Comércio

| Modelo | Finalidade | Restrições e índices |
|---|---|---|
| `Coupon` | Código promocional `PERCENT` ou `FIXED` (este exige `currency`), com limites, datas e mínimo de subtotal. | `code` único. `redeemedCount` só é incrementado quando o pagamento é confirmado. |
| `Order` | Encomenda: totais, imposto, dados de faturação (`Json`), mercado, fornecedor e sessão de pagamento. Estados `PENDING_PAYMENT`, `PAID`, `PAYMENT_FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`. | `number` único; `providerSessionId` único; índices em `userId` e (`status`, `createdAt`). |
| `OrderItem` | Linha da encomenda, com cópia de nome, escalão, preço e opções. | Índice em `orderId`; cascata com a encomenda. |
| `Payment` | Pagamento de uma encomenda ou de uma subscrição: referência do fornecedor, montante, estado, montante reembolsado. | Único por (`provider`, `providerRef`); índices em `orderId` e `subscriptionId`. |
| `Refund` | Reembolso administrativo (montante, motivo, autor). | — |
| `Invoice` | Fatura emitida no pagamento: linhas, vendedor e faturação copiados. | `number` único; índice em `userId`. |
| `WebhookEvent` | **Livro de idempotência**: cada evento de um fornecedor é processado no máximo uma vez. | Único por (`provider`, `eventId`). A coluna `error` existe mas não é preenchida: um evento falhado é anulado com a transação e não deixa linha. |

`Order.userId`, `OrderItem.productId`, `OrderItem.packageId`, `Payment.orderId`, `Project.orderItemId` e `Project.userId` não têm cascata: não é possível apagar fisicamente um utilizador, produto ou pacote que tenha encomendas. Por isso a eliminação de contas é feita por anonimização (ver [SECURITY.md](SECURITY.md)) e a de produtos por `deletedAt`.

### 2.5 Projetos e entrega

| Modelo | Finalidade | Restrições e índices |
|---|---|---|
| `Project` | Projeto de produção de um item comprado: estado, responsável, prazo, URL de pré-visualização e de produção. | `reference` único; `orderItemId` único (um projeto por item); índices em `userId`, `status`, `assigneeId`. |
| `ProjectEvent` | Histórico (mudanças de estado, notas). | Índice em (`projectId`, `createdAt`). |
| `Briefing` | Respostas do cliente (`data` `Json`), estado `DRAFT`/`SUBMITTED`/`CONFIRMED`, `aiConsent` (falso por omissão). | `projectId` único. |
| `FileAsset` | Metadados de um ficheiro privado. Pertence a um projeto/briefing **ou** a uma organização (`organizationId` + `entityType` + `entityId`, usado pelos anexos do CRM). | `storageKey` único; índices em `projectId` e (`organizationId`, `entityType`, `entityId`). |
| `Message` | Mensagem de um projeto ou de um ticket; `internal` = nota só para a equipa. | Índices em (`projectId`, `createdAt`) e (`ticketId`, `createdAt`). |
| `Revision` | Pedido de revisão do cliente e resposta. | Índice em `projectId`. |
| `Task` | Fila de trabalho interna criada pelas automações (`order_review`, `production`, `delivery`, `maintenance_offer`, `data_request`). | Índice em (`status`, `dueAt`). |
| `Ticket` | Pedido de suporte (`OPEN`, `ANSWERED`, `CLOSED`). | Índices em `userId` e `status`. |

### 2.6 Notificações e e-mail

| Modelo | Finalidade | Restrições |
|---|---|---|
| `Notification` | Notificação na aplicação. | Índice em (`userId`, `readAt`, `createdAt`). |
| `EmailTemplate` | Modelo de e-mail em texto simples com `{{variáveis}}`, editável no backoffice. | Único por (`key`, `language`). |
| `EmailLog` | Todos os e-mails enviados ou apenas registados: destinatário, assunto, corpo, fornecedor, estado (`sent`, `logged`, `failed`), erro. | Índice em (`to`, `createdAt`). |

### 2.7 Produtos SaaS e subscrições

| Modelo | Finalidade | Restrições |
|---|---|---|
| `SaasProduct` | Produto de software (`crm`, `pointage`, `pos`, `stock`, `booking`, `projects`), estado `ACTIVE`/`COMING_SOON`/`HIDDEN`. | Chave primária `key`. |
| `Plan` | Plano de um produto: preço mensal por moeda, `includedSeats`, `seatPrices`, `limits`, `features`, `highlights`, `trialDays`. | Único por (`saasProductKey`, `key`). `stripePriceIds` existe mas **não é usado**: o checkout do Stripe é criado com preço em linha. |
| `Subscription` | Subscrição de uma organização a um produto: plano, estado (`TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `INCOMPLETE`), moeda, lugares, período, cancelamento no fim do período. | Único por (`organizationId`, `saasProductKey`); `providerSubId` único; índice em (`status`, `currentPeriodEnd`). |

### 2.8 ATHANA CRM (por organização)

| Modelo | Finalidade | Restrições e índices |
|---|---|---|
| `CrmCompany` | Empresa do cliente. | Índice em (`organizationId`, `name`). |
| `CrmContact` | Contacto/lead, com ciclo de vida `LEAD`/`PROSPECT`/`CUSTOMER`/`INACTIVE`. | Índices em (`organizationId`, `lastName`), (`organizationId`, `lifecycle`), (`organizationId`, `email`). |
| `CrmPipeline` | Funil de vendas; um é o predefinido. | Índice em `organizationId`. |
| `CrmStage` | Etapa de um funil (posição, probabilidade). Não tem `organizationId` próprio: pertence à organização através do funil. | Índice em (`pipelineId`, `position`). |
| `CrmDeal` | Negócio (valor, moeda, estado `OPEN`/`WON`/`LOST`). | Índices em (`organizationId`, `status`) e (`organizationId`, `stageId`). |
| `CrmActivity` | Histórico de comunicação (nota, chamada, e-mail, reunião). | Índice em (`organizationId`, `occurredAt`). |
| `CrmTask` | Tarefa com prazo e responsável. | Índice em (`organizationId`, `doneAt`, `dueAt`). |
| `CrmProposal` | Proposta comercial com linhas e total. | Único por (`organizationId`, `number`): a numeração é por organização. |

### 2.9 ATHANA Pointage (por organização)

| Modelo | Finalidade | Restrições e índices |
|---|---|---|
| `PtDepartment` | Departamento, com responsável (`managerId` = id de `PtEmployee`). | Único por (`organizationId`, `name`). |
| `PtSchedule` | Horário semanal (`days` em `Json`, `weeklyMinutes`). | Índice em `organizationId`. |
| `PtEmployee` | Funcionário; `userId` opcional liga a uma conta de login; papel `ADMIN`/`MANAGER`/`EMPLOYEE`. | Único por (`organizationId`, `userId`); índice em (`organizationId`, `active`). |
| `PtTimeEntry` | Marcação (`CLOCK_IN`, `CLOCK_OUT`, `BREAK_START`, `BREAK_END`). `at` é sempre a hora do servidor. As correções **não apagam**: anulam (`voidedAt`, `voidedById`) e criam nova linha. | Índices em (`organizationId`, `at`) e (`employeeId`, `at`). |
| `PtAbsence` | Ausência (`VACATION`, `SICK`, `UNPAID`, `OTHER`) com aprovação. | Índices em (`organizationId`, `startDate`) e (`employeeId`, `startDate`). |

### 2.10 Conteúdo e marketing

| Modelo | Finalidade | Restrições |
|---|---|---|
| `BlogPost` | Artigo escrito por idioma; `translationKey` agrupa traduções (hreflang). | Único por (`language`, `slug`); índice em (`status`, `publishedAt`). |
| `Faq` | Pergunta frequente localizada, por âmbito (`home`, `templates`, `crm`, `pointage`). | Índice em (`scope`, `sortOrder`). |
| `Testimonial` | Testemunho de cliente. **A tabela é entregue vazia**; só devem ser inseridos testemunhos reais. | — |
| `Banner` | Faixa de aviso com datas. | — |
| `ContentPage` | Página editável (legais): `mentions-legales`, `confidentialite`, `cgv`, `cookies`. | Único por (`key`, `language`). |
| `TranslationOverride` | Substituição de uma tradução, editada no backoffice. | Único por (`language`, `source`). |
| `Lead` | Pedido de contacto, orçamento ou campanha, com UTM e estado. | Índice em (`status`, `createdAt`). |
| `RateLimit` | Contador do limitador de pedidos (janela fixa). | Chave primária `key`. |

## 3. Tabelas com dados de empresas clientes

Todas as leituras e escritas passam por serviços que recebem `TenantCtx` e filtram por `organizationId` (ver [ARCHITECTURE.md](ARCHITECTURE.md), secção 5).

| Tabela | Como se liga à organização |
|---|---|
| `CrmCompany`, `CrmContact`, `CrmPipeline`, `CrmDeal`, `CrmActivity`, `CrmTask`, `CrmProposal` | Coluna `organizationId` |
| `CrmStage` | Através de `CrmPipeline.organizationId` |
| `PtDepartment`, `PtSchedule`, `PtEmployee`, `PtTimeEntry`, `PtAbsence` | Coluna `organizationId` |
| `Subscription`, `Membership` | Coluna `organizationId` |
| `FileAsset` (anexos do CRM) | `organizationId` preenchido |
| `AuditLog` (ações dentro de uma organização) | `organizationId` preenchido |
| `Order` | `organizationId` opcional; o código atual não o preenche |

Não existe Row Level Security no PostgreSQL: o isolamento é aplicativo.

## 4. Migrações

| Migração | Conteúdo |
|---|---|
| `20261116222948_init` | Todas as tabelas, enums, índices e chaves estrangeiras. |
| `20261116223000_sequences` | Três sequências PostgreSQL, todas com início em 1001: `order_number_seq`, `invoice_number_seq`, `project_ref_seq`. |

As sequências dão contadores sem condições de corrida e toleram falhas na numeração (um número pode ser consumido por uma transação anulada). São lidas por `nextRef()` em `src/modules/orders/service.ts` e produzem `ATH-<ano>-<nnnnn>` (encomendas), `<prefixo>-F-<ano>-<nnnnn>` (faturas; o prefixo vem de `Setting invoicing.prefix`, por omissão `ATH`) e `PRJ-<ano>-<nnnnn>` (projetos). O contador **não reinicia** no início do ano.

Nota para o proprietário: em alguns países a numeração de faturas tem de ser contínua, sem lacunas. A sequência atual não o garante. Validar com o contabilista antes de emitir faturas reais.

As sequências não estão descritas em `schema.prisma` (o Prisma não as modela). Ao criar migrações com `prisma migrate dev`, confirmar que o SQL gerado não as remove.

### Comandos

| Comando | Uso |
|---|---|
| `npx prisma migrate deploy` (ou `npm run db:migrate`) | Aplica as migrações pendentes. É o único comando a usar em staging e produção. |
| `npm run db:migrate:dev` | Desenvolvimento: cria uma nova migração a partir das alterações ao esquema e aplica-a. |
| `npm run db:generate` | Regenera o cliente Prisma. |
| `npx prisma migrate status` | Mostra as migrações aplicadas e pendentes. |
| `npx prisma studio` | Explorador de dados (só em desenvolvimento). |

Política: migrações só para a frente e aditivas. Ver o guia de reversão em [DEPLOYMENT.md](DEPLOYMENT.md).

## 5. Seed (`prisma/seed.ts`)

Executa-se com `npm run db:seed`. Cria apenas dados de referência e é **idempotente**: usa `upsert` com `update: {}` ou verifica a existência antes de criar, pelo que nunca sobrepõe valores editados depois no backoffice. Pode ser repetido em cada deploy (é o que faz o serviço `migrate` do `docker-compose.yml`).

| Dados | Quantidade | Regra |
|---|---|---|
| Mercados | 4 (`fr-ch`, `fr-fr`, `pt-pt`, `pt-br`) | Taxas de imposto a 0. |
| `Setting company` | 1 | Só se não existir; dados da menção legal do site antigo, com NIF/IVA, registo e IBAN vazios. |
| Produtos SaaS | 6 | `crm` e `pointage` `ACTIVE` com 3 planos cada (`STARTER`, `BUSINESS`, `PRO`); `pos`, `stock`, `booking`, `projects` `COMING_SOON` sem planos. |
| Categorias | 15 | — |
| Opções (`Addon`) | 9 | Preços derivados do valor em CHF pela função `p()`. |
| Produtos (modelos) | 10 | Publicados, com 3 pacotes cada, imagens em `/images/catalog/<slug>/` e produtos relacionados. Não são recriados se o `slug` existir. |
| FAQ | Perguntas da página inicial | Só se a tabela estiver vazia. |
| Modelos de e-mail | 19 chaves | 16 em `fr`, `pt-PT` e `pt-BR`; 3 internos (`admin_new_order`, `admin_briefing_submitted`, `admin_new_lead`) só em `fr`. |
| Páginas legais | 4 chaves × 3 idiomas | Modelos de texto, a validar juridicamente. |
| Artigos de blog | 3 (um por idioma, mesmo tema) | Publicados. |

Os preços em EUR e BRL das opções e pacotes são calculados a partir do preço em CHF (`EUR = CHF`; `BRL` ≈ 6 × CHF arredondado). São valores iniciais, não uma política de preços: rever no backoffice.

### Conta de administrador

| Situação | Resultado |
|---|---|
| `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` definidos | Cria o utilizador como `SUPER_ADMIN`. Se o e-mail já existir, promove-o a `SUPER_ADMIN` **sem alterar a palavra-passe**. Falha se a palavra-passe tiver menos de 12 caracteres. |
| Variáveis ausentes, `NODE_ENV` ≠ `production`, sem nenhum `SUPER_ADMIN` | Cria `admin@athana.local` com palavra-passe aleatória, **mostrada uma única vez** na consola. |
| Variáveis ausentes, `NODE_ENV=production`, sem nenhum `SUPER_ADMIN` | Não cria nada e avisa na consola. |

### `SEED_DEMO=true`

Cria o cupão `TEST10` (10 %, campanha `sandbox`). É necessário para os testes E2E. Não ativar em produção.

## 6. Cópias de segurança e restauro

Ver [DEPLOYMENT.md](DEPLOYMENT.md), secção de cópias de segurança. Em resumo:

- `deploy/backup.sh` faz `pg_dump --format=custom` da base de dados e um `tar.gz` da pasta de uploads (a partir do contentor `app`), com retenção local de 30 dias;
- `deploy/restore.sh <ficheiro.dump> [uploads.tar.gz]` substitui a base de dados (`pg_restore --clean --if-exists`), com confirmação manual, e, se for indicado o segundo argumento, extrai o arquivo de uploads;
- a base de dados e a pasta de uploads têm de ser guardadas **juntas**: `FileAsset.storageKey` aponta para ficheiros no disco.
