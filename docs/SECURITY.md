# Segurança e proteção de dados

A primeira parte descreve o que está implementado, com referência ao ficheiro. A segunda (secção 19) lista as limitações conhecidas. Cada afirmação foi verificada no código; nenhuma auditoria externa foi feita.

## 1. Palavras-passe

Ficheiro: `src/lib/crypto.ts`.

| Aspeto | Implementação |
|---|---|
| Algoritmo | scrypt (`node:crypto`), N = 131072 (2^17), r = 8, p = 1, sal aleatório de 16 bytes, chave de 64 bytes. |
| Formato guardado | `scrypt$N$r$p$<sal base64>$<hash base64>` — os parâmetros ficam com o hash, o que permite aumentá-los no futuro sem invalidar as contas existentes. |
| Normalização | Unicode NFKC antes do hash. |
| Comparação | `timingSafeEqual`. |
| Comprimento mínimo | 10 caracteres no código (piso), aplicado no registo, na recuperação e na alteração por `assertPasswordPolicy` (`src/modules/auth/service.ts`). A definição `security.passwordMinLength` do backoffice pode aumentar este mínimo, nunca baixá-lo. 12 para o administrador criado pelo seed. Máximo de 200 no registo. |
| Contas criadas por convite | Recebem uma palavra-passe aleatória inutilizável e uma ligação para definirem a sua (`src/modules/tenancy/members.ts`, `saveStaffAction`). |

Não há regras de complexidade nem verificação contra listas de palavras-passe comprometidas.

## 2. Sessões

Ficheiro: `src/modules/auth/session.ts`.

| Aspeto | Implementação |
|---|---|
| Token | 32 bytes aleatórios (`randomToken`), em base64url. |
| Armazenamento | A base de dados guarda apenas o SHA-256 do token (`Session.tokenHash`). Uma fuga da base de dados não dá tokens utilizáveis. |
| Cookie `athana_session` | `httpOnly`, `sameSite: 'lax'`, `path: '/'`, `secure` quando `NODE_ENV=production`, validade igual à da sessão. |
| Duração | `security.sessionDays` (30 por omissão). Não é renovada com a utilização. |
| Validação | Em cada pedido: sessão existente, não expirada, utilizador não desativado nem eliminado. |
| Logout | Apaga a linha da sessão e o cookie. |
| Revogação | Recuperação de palavra-passe apaga **todas** as sessões do utilizador (`resetPassword`). Alterar a palavra-passe na área de cliente termina todas as outras sessões e mantém a atual (`changePassword`). Desativar um cliente ou um membro da equipa apaga as suas sessões. Remover um membro de uma organização limpa a organização ativa das suas sessões. |
| Limpeza | Sessões expiradas são apagadas pela tarefa diária. |

Outros cookies: `athana_cart` (httpOnly; só identificadores), `athana_aid` (httpOnly; identificador anónimo do consentimento), `athana_locale`, `athana_consent` e `athana_utm` (legíveis por JavaScript, sem dados sensíveis).

`SESSION_SECRET` não assina sessões; ver [ENVIRONMENT.md](ENVIRONMENT.md).

## 3. Anti-enumeração de contas

| Fluxo | Comportamento | Ficheiro |
|---|---|---|
| Login | A mesma mensagem ("E-mail ou mot de passe incorrect.") para conta inexistente, palavra-passe errada, conta desativada ou eliminada. Quando a conta não existe é verificado um hash fictício, para o tempo de resposta ser semelhante. | `authenticate` em `src/modules/auth/service.ts` |
| Recuperação de palavra-passe | Devolve sempre sucesso, exista ou não a conta. O token é de uso único, guardado em hash, válido 1 hora (7 dias nos convites). | `forgotPasswordAction`, `createPasswordReset` |
| Ficheiros e projetos | Identificador desconhecido e acesso proibido respondem ambos 404. | `src/app/api/files/[id]/route.ts`, `getProjectFor` |

Exceção: o **registo** responde "Un compte existe déjà avec cette adresse e-mail." quando o e-mail já está registado. Ver secção 19.

## 4. Limitação de pedidos

Ficheiro: `src/lib/rate-limit.ts`. Janela fixa guardada na tabela `RateLimit` do PostgreSQL, com uma única instrução `INSERT … ON CONFLICT DO UPDATE` atómica; os limites valem para todas as instâncias. Ao exceder, é lançado `AppError('rate_limited')` ou devolvido HTTP 429.

| Chave | Limite | Onde |
|---|---|---|
| `login:ip:<ip>` | 20 / 15 min | `loginAction` |
| `login:acct:<email>` | `security.loginMaxAttempts` (8) / 15 min | `loginAction` |
| `register:<ip>` | 10 / hora | `registerAction` |
| `forgot:<ip>` | 6 / hora | `forgotPasswordAction` |
| `reset:<ip>` | 10 / hora | `resetPasswordAction` |
| `pwd:<utilizador>` | 8 / hora | `changePasswordAction` |
| `coupon:<ip>` | 20 / hora | `applyCouponAction` |
| `order:<utilizador>` | 15 / hora | `placeOrderAction` |
| `upload:<utilizador>` | 60 / hora | `uploadProjectFileAction` |
| `msg:<utilizador>` | 60 / hora | `postMessageAction` |
| `ticket:<utilizador>` | 10 / hora | `createTicketAction` |
| `lead:<ip>` | 8 / hora | `createLeadAction` (mais um campo-armadilha `website`) |
| `export:<utilizador>` | 5 / hora | `GET /api/account/export` |
| `consent:<ip>` | 30 / hora | `POST /api/consent` |

O IP vem do primeiro valor de `X-Forwarded-For` (ou `X-Real-IP`). As ações do CRM e do Pointage não têm limitação de pedidos própria; o Pointage rejeita marcações idênticas repetidas em 60 segundos e serializa marcações concorrentes com bloqueios consultivos.

## 5. Papéis e permissões da equipa ATHANA (RBAC)

Ficheiro: `src/modules/auth/rbac.ts`. O papel está em `User.platformRole`. As permissões são verificadas no servidor por `requireStaff(locale, permissão)` em cada página do backoffice, por `assertPermission(permissão)` em cada Server Action de `src/modules/admin/actions.ts` e por `can()` nas rotas de API. O menu só mostra o que o papel permite, mas esconder um botão nunca é a única barreira.

| Permissão | SUPER_ADMIN | ADMIN | PROJECT_MANAGER | DEVELOPER | SUPPORT | FINANCE | MARKETING |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `dashboard.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `catalog.manage` | ✓ | ✓ | | | | | ✓ |
| `orders.view` | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| `orders.manage` | ✓ | ✓ | | | | | |
| `projects.view` | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| `projects.work` | ✓ | ✓ | ✓ | ✓ | | | |
| `projects.manage` | ✓ | ✓ | ✓ | | | | |
| `customers.view` | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| `customers.manage` | ✓ | ✓ | | | | | |
| `finance.view` | ✓ | ✓ | | | | ✓ | |
| `finance.manage` | ✓ | ✓ | | | | ✓ | |
| `marketing.manage` | ✓ | ✓ | | | | | ✓ |
| `content.manage` | ✓ | ✓ | | | | | ✓ |
| `leads.view` | ✓ | ✓ | ✓ | | ✓ | | ✓ |
| `support.manage` | ✓ | ✓ | ✓ | | ✓ | | |
| `saas.manage` | ✓ | ✓ | | | | ✓ | |
| `settings.manage` | ✓ | ✓ | | | | | |
| `users.manage` | ✓ | | | | | | |
| `audit.view` | ✓ | ✓ | | | | | |

Regras adicionais no código:

- um `DEVELOPER` (sem `projects.manage`) só altera o estado de projetos que lhe estão atribuídos (`setProjectStatus`);
- os estados de pagamento de um projeto não podem ser definidos à mão;
- um super administrador não pode retirar o seu próprio papel, e tem de existir sempre pelo menos um (`saveStaffAction`);
- as contas internas não podem ser eliminadas pelo fluxo de pedidos RGPD nem geridas pelo ecrã de clientes.

### Papéis dentro de uma empresa cliente

`OrgRole` (`src/modules/tenancy/context.ts`): `MEMBER` < `MANAGER` < `ADMIN` < `OWNER`.

| Contexto | Regra |
|---|---|
| CRM (`src/modules/crm/shared.ts`) | `MEMBER` cria e edita; `MANAGER` ou superior elimina e exporta; `ADMIN` ou superior configura (funis, equipa). |
| Pointage (`src/modules/pointage/actor.ts`) | `ADMIN` (OWNER/ADMIN da organização ou funcionário com papel ADMIN); `MANAGER` limitado aos departamentos que gere; `EMPLOYEE` só vê e altera o que é seu. |
| Subscrições (`src/modules/billing/service.ts`) | Iniciar teste, ativar, mudar de plano, cancelar e retomar exigem `ADMIN` ou superior na organização. |
| Membros (`src/modules/tenancy/members.ts`) | Convidar, alterar papel e remover exigem `ADMIN`. O papel `OWNER` não pode ser atribuído, alterado nem removido por estas funções. |

## 6. Isolamento entre empresas clientes

Descrito em [ARCHITECTURE.md](ARCHITECTURE.md), secção 5. Em resumo:

- a organização ativa vem sempre da sessão no servidor (`tenantFromSession`, `requireTenant`), nunca do pedido;
- a adesão é confirmada na base de dados em cada pedido (`loadTenantCtx`);
- todas as consultas do CRM e do Pointage filtram por `organizationId`;
- identificadores de outra organização resultam em "não encontrado" (404 nas páginas, via `orNotFound`);
- os ficheiros de uma organização só são servidos a membros dessa organização.

Os testes `tests/crm.test.ts` ("tenant isolation", incluindo "every mutation rejects a foreign-tenant id") e `tests/pointage.test.ts` ("two independent companies") tentam ler, alterar, aprovar e exportar dados de outra empresa e verificam a recusa.

O isolamento é aplicativo: não há Row Level Security no PostgreSQL.

## 7. CSRF

| Superfície | Proteção |
|---|---|
| Server Actions (todas as escritas da interface) | O Next.js só aceita Server Actions por `POST` e compara o cabeçalho `Origin` com o anfitrião do pedido. Não foi configurado nenhum `allowedOrigins` adicional. Trata-se de um mecanismo do framework, não de código da ATHANA. |
| Cookie de sessão | `SameSite=Lax`: não é enviado em `POST` de outros sítios. |
| `/api/webhooks/stripe`, `/api/webhooks/test` | Sem cookies; autenticados pela assinatura do corpo. |
| `/api/cron/daily` | Sem cookies; `Authorization: Bearer`, comparado em tempo constante (`safeEqual`). |
| Rotas `GET` de exportação e de ficheiros | Só leitura; exigem sessão. |
| `POST /api/consent` | Regista apenas a escolha de cookies; validado com zod e limitado por IP. Não usa token CSRF. |

Não há tokens CSRF próprios. O cabeçalho `Content-Security-Policy` inclui `form-action 'self' https://checkout.stripe.com`.

## 8. XSS e cabeçalhos HTTP

| Medida | Onde |
|---|---|
| Escape automático do React em todo o conteúdo renderizado. | Toda a interface. |
| Markdown seguro: o renderizador constrói nós React (títulos, listas, citações, negrito, itálico, ligações) e nunca HTML bruto. As ligações só aceitam `http(s)://`, `mailto:` e caminhos internos `/…`; as externas recebem `rel="noopener noreferrer"`. | `src/lib/markdown.tsx` (blog e páginas legais) |
| Único `dangerouslySetInnerHTML` do projeto: JSON-LD, serializado com `<` substituído por `<`. | `JsonLd` em `src/lib/seo.tsx` |
| E-mails: o corpo é texto simples, escapado antes de ser convertido em HTML. | `layout()` em `src/modules/email/service.ts` |
| Identificadores de etiquetas injetados em scripts em linha com `JSON.stringify`. | `src/components/site/Consent.tsx` |
| URL de pré-visualização e de produção dos projetos têm de começar por `https://`. | `projectAssignAction` |

Cabeçalhos definidos em `next.config.ts` para todas as respostas:

| Cabeçalho | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`; `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://connect.facebook.net`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data: blob: https:`; `font-src 'self' data:`; `connect-src 'self'` + domínios Google Analytics/Tag Manager, `*.doubleclick.net`, `www.googleadservices.com`, `www.google.com` e `www.facebook.com`; `frame-src 'self'`; `frame-ancestors 'self'`; `base-uri 'self'`; `form-action 'self' https://checkout.stripe.com`; `object-src 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `X-Frame-Options` | `DENY` em todo o lado; `SAMEORIGIN` em `/demo/*` (as demonstrações são incorporadas nas páginas de produto) |

`poweredByHeader` está desligado. As fontes são servidas localmente (`@fontsource-variable`), sem pedidos a terceiros.

## 9. Injeção de SQL

Todo o acesso passa pelo Prisma, que parametriza as consultas. As instruções SQL escritas à mão são estas:

| Local | Instrução | Parametrização |
|---|---|---|
| `src/lib/rate-limit.ts` | `INSERT … ON CONFLICT` do limitador | `$queryRaw` com *template* etiquetado: valores passados como parâmetros. |
| `src/modules/orders/service.ts` (`nextRef`) | `SELECT nextval('<sequência>')` | `$queryRawUnsafe` com interpolação do nome da sequência. O nome é restringido pelo tipo TypeScript a três literais (`order_number_seq`, `invoice_number_seq`, `project_ref_seq`) e todas as chamadas passam constantes; nenhum valor do utilizador chega aqui. É a única utilização de uma variante `Unsafe`. |
| `src/app/api/health/route.ts` | `SELECT 1` | Sem parâmetros. |
| `src/modules/crm/onboarding.ts`, `src/modules/crm/proposals.ts` | `pg_advisory_xact_lock(hashtext(…))` e leitura do último número de proposta | *Template* etiquetado. |
| `src/modules/pointage/service.ts` | `pg_advisory_xact_lock(hashtext(…))` por funcionário e por organização | *Template* etiquetado. |
| `src/modules/pointage/settings.ts` | `SELECT … FOR UPDATE` da organização | *Template* etiquetado. |

As ordenações das listas do CRM usam nomes de coluna validados por enumerações zod (por exemplo `companyListSchema` em `src/modules/crm/contacts.ts`), não texto livre.

## 10. Uploads e ficheiros privados

Ficheiros: `src/modules/storage/service.ts`, `src/app/api/files/[id]/route.ts`.

Validação (`validateUpload`):

1. ficheiro não vazio;
2. tamanho máximo `uploads.maxSizeMb` (15 MB por omissão);
3. tipo MIME na lista `uploads.allowedMime` **e** com extensão conhecida: PNG, JPEG, WebP, SVG, PDF, TXT, DOCX, XLSX, ZIP;
4. verificação do conteúdo ("números mágicos"): o início do ficheiro tem de corresponder ao tipo declarado; um SVG com `<script`, atributos `on…=` ou `javascript:` é recusado; um ficheiro de texto com bytes nulos é recusado;
5. o nome original é reduzido a caracteres seguros e a 120 caracteres.

Armazenamento: chave aleatória `<namespace>/<32 hex>.<ext>` fora da raiz web, permissões `0600`. A chave é validada por expressão regular antes de qualquer acesso ao disco, o que impede travessia de diretórios.

Limites adicionais: 60 ficheiros por projeto; no CRM, quota `storageMb` do plano.

Entrega (`GET /api/files/[id]`): exige sessão. Acesso permitido ao autor do upload, ao cliente dono do projeto, à equipa com `projects.view` (só ficheiros de projetos) ou a um membro da organização dona do ficheiro. A resposta força sempre a transferência (`Content-Disposition: attachment`) e inclui `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox` e `Cache-Control: private, no-store`. Um ficheiro enviado nunca é interpretado como página na origem da plataforma.

## 11. Pagamentos e webhooks

| Medida | Onde |
|---|---|
| Nenhum dado de cartão é recebido nem guardado: checkout alojado. A base de dados guarda apenas referências do fornecedor, montantes e estados. | `src/modules/payments/stripe-provider.ts`, modelo `Payment` |
| Preços sempre calculados no servidor a partir da base de dados; o carrinho só contém identificadores. | `priceCart` em `src/modules/orders/cart.ts` |
| Assinatura do Stripe verificada com `stripe.webhooks.constructEvent` sobre o corpo bruto. | `parseWebhook` |
| Fornecedor de teste: HMAC-SHA256 com carimbo temporal, tolerância de 5 minutos, comparação em tempo constante. | `src/modules/payments/test-provider.ts` |
| Idempotência: `WebhookEvent` único por (`provider`, `eventId`), inserido na mesma transação dos efeitos. | `processWebhook` |
| Verificação de montante e moeda contra a encomenda antes de a marcar como paga. | `apply` → `checkout.completed` |
| Uma encomenda paga não é reprocessada; métodos de pagamento diferido só cumprem a encomenda em `async_payment_succeeded`. | `apply`, `mapStripeEvent` |
| Chave de idempotência nos reembolsos enviados ao Stripe. A criação do checkout não usa chave fixa: cada nova tentativa de pagamento recebe uma sessão nova. | `stripeProvider` |
| Reembolsos: permissão `finance.manage`, nunca acima do montante pago menos o já reembolsado, registados em `Refund` e no `AuditLog`. Pagamentos de subscrições Stripe são recusados com mensagem explícita (reembolsar no painel do Stripe). | `refundPayment` |
| O endpoint e a página de teste respondem 404 quando `PAYMENTS_MODE` não é `test`; o modo de teste é recusado em produção sem `ALLOW_TEST_PAYMENTS`. | `src/app/api/webhooks/test/route.ts`, `src/lib/env.ts` |
| A simulação de pagamento exige que o utilizador seja dono da encomenda ou administrador da organização. | `sandboxPayAction` |

## 12. Segredos

- Nenhum segredo no repositório: `.env*` está em `.gitignore` e `.dockerignore` (exceto `.env.example`, que só tem marcadores).
- Sem valores secretos por omissão em produção (`src/lib/env.ts`).
- A imagem Docker é construída sem segredos; são fornecidos em tempo de execução.
- `/api/health` não expõe configuração.
- Os erros internos não chegam ao utilizador (`run()` em `src/lib/action.ts`).
- O ecrã Admin → Definições mostra se cada integração está configurada, não os valores.

## 13. Registo de auditoria

`audit()` em `src/lib/audit.ts` escreve em `AuditLog` (ator, organização, ação, entidade, metadados). Ações registadas:

| Área | Ações |
|---|---|
| Contas | registo, recuperação e alteração de palavra-passe, exportação de dados, pedido RGPD criado/concluído/recusado |
| Equipa e clientes | criação/alteração de membros da equipa, ativação/desativação de clientes |
| Empresas | convite, alteração de papel e remoção de membros |
| Catálogo e conteúdo | categorias, opções, produtos, pacotes, cupões, planos, páginas, blog, testemunhos, modelos de e-mail |
| Definições | definições e mercados |
| Vendas | cancelamento administrativo, reembolso, exportação financeira |
| Projetos | mudança de estado, atribuição, revisão, exportação do brief (com o estado do consentimento de IA) |
| Subscrições | início de teste, mudança de plano, cancelamento agendado/efetivo, retoma |
| CRM | eliminações (contactos, empresas, negócios, atividades, tarefas, propostas, anexos), configuração de funis e etapas, exportações |
| Pointage | funcionários, correções e anulações de marcações, decisões de ausência, definições, exportações, purga de retenção |

Consulta: Admin → Auditoria (`audit.view`), "Atividade" na área de cliente (as ações do próprio) e o registo do Pointage (funcionalidade `audit` do plano PRO).

## 14. Redirecionamento aberto

`safeNext()` em `src/modules/auth/actions.ts`: o destino pós-login (`next`) só é aceite se for um caminho interno que corresponda a `^/[a-z0-9\-/_?=&%.]*$` e não comece por `//`. Qualquer outro valor é substituído por `/account` ou `/admin`.

## 15. Injeção de fórmulas em CSV

`toCsv` em `src/lib/csv.ts` (exportações financeiras) e `csvCell` em `src/modules/crm/export.ts` e `src/modules/pointage/reports.ts`: as células de texto que começam por `=`, `+`, `-`, `@`, tabulação ou retorno recebem um apóstrofo inicial, para não serem interpretadas como fórmula pela folha de cálculo. Aspas, separadores e quebras de linha são escapados. Coberto por testes nos três módulos.

## 16. Proteção de dados (RGPD, nLPD suíça, LGPD brasileira)

O que existe no código:

| Funcionalidade | Implementação |
|---|---|
| Banner de cookies | `ConsentManager` em `src/components/site/Consent.tsx`: aceitar tudo, recusar tudo ou personalizar (necessários, medição de audiência, marketing). Recusar é tão fácil como aceitar. Reabre-se pelo botão "Gérer les cookies" do rodapé. |
| Nada antes da escolha | `track()` não regista nada sem escolha; as etiquetas de terceiros só são injetadas depois do consentimento da categoria e se o identificador estiver configurado. A captura de UTM exige consentimento de medição. |
| Prova de consentimento | `POST /api/consent` grava em `Consent`: identificador anónimo, utilizador (se autenticado), categorias, versão da política, hash do IP com sal (o IP não é guardado) e user-agent. |
| Exportação pelo próprio | `GET /api/account/export`: ficheiro JSON com conta, organizações, encomendas, pagamentos, faturas, projetos, briefings, mensagens, tickets, consentimentos, notificações e pedidos. Limitado a 5 por hora e auditado. |
| Pedidos do titular | Em "Os meus dados" o utilizador pede exportação ou eliminação (`requestDataAction`). É criada uma `DataRequest` e uma tarefa interna com prazo de 25 dias. |
| Tratamento do pedido de eliminação | `processDataRequestAction` (permissão `customers.manage`): apaga sessões, ficheiros (base de dados e disco), notificações, consentimentos e leads com o mesmo e-mail; esvazia os briefings; substitui o texto das mensagens por `[supprimé]`; anonimiza a conta (e-mail `deleted-<id>@deleted.invalid`, nome "Compte supprimé", telefone e país removidos, palavra-passe aleatória, conta desativada). |
| O que é conservado | Encomendas, pagamentos e faturas, pelo dever legal de conservação contabilística. Os dados de faturação copiados nesses documentos mantêm-se. |
| Retenção automática | Tarefa diária: leads `NEW` ou `CLOSED` com mais de `privacy.retentionMonthsLeads` meses (24); marcações e ausências decididas do Pointage para lá de `retentionMonths` de cada organização (6 a 240 meses), com entrada de auditoria; sessões expiradas, tokens antigos e contadores do limitador. |
| Consentimento de IA | `Briefing.aiConsent`, desligado por omissão, definido pelo cliente no formulário. Sem ele, a exportação do brief oculta nome, e-mail e telefone do contacto, a morada e os três campos de conteúdo livre (textos, informações adicionais, "pelas suas palavras"). Nenhum dado é enviado automaticamente a serviços de IA. |
| Minimização | O Pointage não tem geolocalização nem biometria: os tipos fixam ambos em `false` e as definições não os aceitam (`src/modules/pointage/settings.ts`). A hora das marcações é sempre a do servidor. |
| Consentimento nos formulários | O formulário de contacto exige a caixa de acordo; o registo e o checkout exigem a aceitação das condições. |
| Páginas legais | `ContentPage` com as chaves `mentions-legales`, `confidentialite`, `cgv`, `cookies`, em francês, pt-PT e pt-BR, editáveis no backoffice. **São modelos de trabalho, não textos validados por um jurista.** |

## 17. Outras medidas

- Contas: e-mail normalizado em minúsculas; contas desativadas ou eliminadas não iniciam sessão nem recebem ligações de recuperação.
- Convites: o papel `OWNER` não pode ser atribuído por convite; contas desativadas não podem ser convidadas.
- Organizações: máximo de 10 por utilizador como `OWNER`; fuso horário validado contra a lista do sistema.
- Indexação: áreas privadas, demonstrações, checkout e landing pages de campanha com `noindex`; `robots.txt` fecha tudo fora de produção.
- Contentor: processo sem privilégios de root (uid 1001); a aplicação só escuta em `127.0.0.1` atrás do proxy.
- Testes de integração nunca correm sobre uma base de dados cujo nome não contenha `test`.

## 18. Checklist antes de abrir ao público

1. `SESSION_SECRET`, `CRON_SECRET` e `POSTGRES_PASSWORD` aleatórios e próprios de produção.
2. `PAYMENTS_MODE=stripe`, sem `ALLOW_TEST_PAYMENTS`.
3. HTTPS ativo e `APP_URL` em `https://`.
4. Alterar a palavra-passe do administrador criada pelo seed e remover `SEED_ADMIN_PASSWORD` do ambiente.
5. Taxas de imposto dos mercados e dados legais da empresa preenchidos e validados.
6. Textos legais revistos por um jurista.
7. Cópias de segurança externas e um restauro ensaiado.
8. Monitorização de `/api/health` e dos erros.
9. Ler a secção seguinte e decidir o que tratar antes do lançamento.

## 19. Limitações conhecidas e recomendações

### Autenticação e contas

| Limitação | Recomendação |
|---|---|
| **Sem autenticação de dois fatores (2FA)**, nem para a equipa ATHANA. | Acrescentar TOTP, com prioridade para as contas com `platformRole`. Até lá, palavras-passe longas e únicas e poucas contas `SUPER_ADMIN`. |
| **Sem verificação de e-mail no registo.** A coluna `User.emailVerifiedAt` existe mas não é usada. Qualquer pessoa pode criar uma conta com um e-mail que não lhe pertence. | Enviar ligação de confirmação e exigi-la antes do primeiro pagamento ou do início de um teste. |
| **O registo revela se um e-mail já tem conta** (mensagem explícita), ao contrário do login e da recuperação. Limitado a 10 tentativas por hora e por IP. | Responder de forma neutra e avisar o titular por e-mail. |
| Um utilizador já registado que é convidado para uma organização é **adicionado de imediato**, sem aceitar. | Introduzir convites pendentes com aceitação. |
| Sem regras de complexidade nem verificação contra palavras-passe comprometidas. | Verificar contra a API k-anonymity do Have I Been Pwned. |
| As sessões não são renovadas nem listadas ao utilizador; não há "terminar sessão em todos os dispositivos". | Acrescentar gestão de sessões no perfil. |
| Os inícios de sessão (com ou sem sucesso) **não são registados** no `AuditLog`, e a coluna `AuditLog.ip` nunca é preenchida. | Registar logins e IP. |

### Aplicação web

| Limitação | Recomendação |
|---|---|
| **A CSP permite `'unsafe-inline'`** em `script-src` e `style-src`. Reduz muito a proteção contra XSS dada pela CSP; a defesa real é o escape do React. | Migrar para CSP com *nonce* por pedido (o proxy pode gerá-lo). |
| `img-src` aceita qualquer origem `https:`. | Restringir quando as origens de imagens estiverem estabilizadas. |
| A CSP inclui os domínios habituais do Google Ads (`googleadservices.com`, `*.doubleclick.net`, `google.com`), mas **não foi testada com identificadores reais**; etiquetas adicionais (por exemplo dentro de um contentor GTM) podem usar outros domínios e ser bloqueadas. | Testar em staging com a consola do browser aberta e ajustar a CSP. |
| O cabeçalho HSTS inclui `preload` e `includeSubDomains`: todos os subdomínios de athana.ch passam a exigir HTTPS. | Confirmar que nenhum subdomínio depende de HTTP antes de submeter à lista de *preload*. |
| O IP do cliente é lido de `X-Forwarded-For` sem lista de proxies de confiança. Exposta diretamente, a aplicação aceitaria um valor forjado e os limites por IP seriam contornáveis. | Manter a aplicação sempre atrás do Caddy (o compose só publica em `127.0.0.1`). |
| **O limitador é de janela fixa**: permite até o dobro do limite em torno da mudança de janela, e cada verificação escreve na base de dados. | Suficiente para o arranque; passar a janela deslizante ou Redis com mais tráfego. |
| Sem CAPTCHA nos formulários públicos; apenas campo-armadilha e limite por IP. | Acrescentar Turnstile/hCaptcha se houver abuso. |
| CRM e Pointage sem limitação de pedidos própria. | Acrescentar limites às exportações e às criações em massa. |
| Sem WAF nem proteção contra DDoS. | Colocar um CDN/WAF à frente em produção. |

### Dados e ficheiros

| Limitação | Recomendação |
|---|---|
| **Sem análise antivírus dos uploads.** A validação é de tipo e conteúdo inicial; um PDF, DOCX ou ZIP malicioso passa. Os ficheiros são sempre descarregados, nunca executados no servidor, mas a equipa abre-os. | Integrar ClamAV (ou serviço equivalente) antes de disponibilizar o ficheiro. |
| O filtro de SVG é por lista negra (`<script`, `on…=`, `javascript:`). Não substitui um sanitizador. O risco é contido porque os SVG são entregues como anexo com CSP `sandbox`. | Retirar `image/svg+xml` dos tipos permitidos se não for necessário. |
| Ficheiros em disco **sem cifra** aplicativa; base de dados sem cifra ao nível da coluna. | Cifrar o disco do servidor e as cópias de segurança. |
| `EmailLog` guarda o corpo completo de todos os e-mails, **incluindo as ligações de recuperação de palavra-passe e de convite**, e não tem retenção. Quem ler a base de dados durante a validade do token (1 hora; 7 dias nos convites) pode usá-lo. O backoffice só mostra os assuntos. | Mascarar os tokens ao registar e limpar `EmailLog` periodicamente. |
| `AuditLog`, `EmailLog`, `Consent`, `Notification` e `WebhookEvent` **não têm retenção automática**. | Definir prazos e acrescentar à tarefa diária. |
| A eliminação de conta **não trata os dados de organizações**: a organização, as suas subscrições e os dados do CRM/Pointage mantêm-se, bem como o assunto dos tickets e os dados de faturação das encomendas. Não cancela subscrições ativas. | Definir o procedimento para o último `OWNER` e completar a ação. |
| Na exportação do brief sem consentimento de IA são ocultados os contactos, a morada e os campos `texts`, `extra` e `ownWords`. **O nome da empresa e os requisitos do projeto (objetivo, público, páginas, funcionalidades, referências, redes sociais, produtos) são sempre exportados**; são campos de texto e podem conter dados pessoais. | Rever o ficheiro antes de o usar fora da plataforma quando `aiProcessingConsent` é `false`. |
| Isolamento entre empresas apenas aplicativo. | Considerar Row Level Security como segunda barreira. |

### Pagamentos

| Limitação | Recomendação |
|---|---|
| **A integração Stripe nunca foi exercida contra a API do Stripe.** O mapeamento de eventos é testado com eventos sintéticos assinados; a criação de sessões, os reembolsos e as subscrições reais não. | Ensaio completo em staging com chaves de teste antes de produção. Ver [INTEGRATIONS.md](INTEGRATIONS.md). |
| Taxas de imposto a 0 por omissão; sem Stripe Tax; sem validação de números de IVA; numeração de faturas com possíveis lacunas. | Validação fiscal por mercado antes de vender. |
| Sem deteção de fraude própria. | Ativar o Stripe Radar. |

### Processo

| Limitação | Recomendação |
|---|---|
| **Sem teste de intrusão nem auditoria externa.** | Contratar um teste antes de tratar dados de clientes em volume. |
| **Textos legais não validados** por um jurista; sem registo de atividades de tratamento, sem contratos de subcontratação (Stripe, Resend, alojamento) documentados, sem análise de transferências internacionais. | Revisão jurídica para Suíça, UE e Brasil. |
| Sem análise automática de dependências. | Ativar Dependabot/`npm audit` no CI. |
| Sem recolha centralizada de erros nem alertas de segurança. | Sentry ou equivalente; alertas sobre picos de `rate_limited` e de logins falhados. |
| Sem testes de carga. | Ver [TESTING.md](TESTING.md). |
| As predefinições de jurisdição do Pointage (CH, FR, PT, BR) são indicativas e **não constituem aconselhamento jurídico**. | Validar com um especialista em direito do trabalho de cada país. |
