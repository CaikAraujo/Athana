# Testes

## 1. Como executar

| Comando | O que faz |
|---|---|
| `npm run typecheck` | `tsc --noEmit` em modo `strict`. |
| `npm run i18n:check` | Verifica que todas as frases têm tradução pt-PT e pt-BR, que os marcadores `{x}` coincidem e que `client-keys.json` está atualizado. |
| `npm test` | Vitest: testes de integração sobre uma base de dados PostgreSQL de teste. |
| `npm run test:e2e` | Playwright: testes de ponta a ponta sobre uma compilação de produção. |
| `npm run test:all` | Os quatro anteriores, por esta ordem. |

Executar um só ficheiro ou teste:

```bash
npx vitest run tests/crm.test.ts
npx vitest run -t "tenant isolation"
npx playwright test e2e/purchase.spec.ts --project=desktop
```

## 2. Pré-requisitos

### Vitest

- PostgreSQL em execução e uma base de dados **cujo nome contenha `test`** (`createdb athana_test`). `tests/global-setup.ts` recusa arrancar com outro nome, para nunca tocar na base de dados de desenvolvimento.
- `TEST_DATABASE_URL` definida (por omissão `postgresql://athana:athana@localhost:5432/athana_test`).
- As migrações são aplicadas automaticamente antes dos testes (`prisma migrate deploy`).
- Não é preciso seed: cada teste cria os seus próprios dados com nomes únicos e nunca trunca tabelas (os dados acumulam-se; recriar a base de dados de vez em quando).

Ambiente imposto por `tests/setup.ts`: `PAYMENTS_MODE=test`, `EMAIL_PROVIDER=log`, `STORAGE_DIR=./storage/test`, `SESSION_SECRET` fixo. `server-only` é substituído por um ficheiro vazio e `cache()` do React por uma função transparente. Os ficheiros correm em série (`fileParallelism: false`).

### Playwright

- A **base de dados de desenvolvimento com seed**, criada com:

  ```bash
  SEED_ADMIN_EMAIL=admin@athana.test SEED_ADMIN_PASSWORD='Admin-Local-2026!' SEED_DEMO=true npm run db:seed
  ```

  Os testes iniciam sessão com este administrador (valores por omissão de `e2e/helpers.ts`; outros valores exigem as mesmas variáveis no ambiente do Playwright) e usam o cupão `TEST10` criado por `SEED_DEMO`.
- Uma compilação de produção: `npm run build`. O Playwright arranca `npx next start -p 3100` (ou reutiliza um servidor já a correr nessa porta) com `PAYMENTS_MODE=test`, `ALLOW_TEST_PAYMENTS=true`, `EMAIL_PROVIDER=log` e `APP_URL=http://localhost:3100`. A porta muda com `E2E_PORT`.
- Chromium: `npx playwright install chromium`, ou `PW_CHROMIUM=/caminho/para/chromium` para usar um já instalado.
- **Versão do Playwright:** `package.json` declara `@playwright/test` `^1.63.0` e o `package-lock.json` fixa `1.63.0`, a versão que corresponde ao browser pré-instalado no ambiente onde o código foi escrito. Atualizar o pacote obriga a instalar o browser correspondente.

Os testes E2E escrevem na base de dados de desenvolvimento (contas `e2e-…@example.test`, encomendas, leads) e apagam a tabela `RateLimit` no início. Configuração: um só *worker*, 1 repetição por teste, 90 s de limite por teste.

## 3. O que cada suite cobre

### `tests/platform.test.ts` — 24 testes

| Grupo | Testes |
|---|---|
| helpers | dinheiro (mapas de preços, imposto, conversão de montantes); caminhos localizados e recurso de conteúdo; escape de CSV e injeção de fórmulas; limitador de pedidos |
| authentication | hash e verificação scrypt; registo, duplicados, palavra-passe fraca, login; recuperação de palavra-passe (token de uso único, expiração, sessões revogadas, sem enumeração) |
| RBAC | cada papel só tem as suas permissões |
| cart and coupons | preços vindos só da base de dados e remoção de artigos indisponíveis; cupões (datas, limites, mínimo, moeda) |
| checkout, webhooks and order lifecycle | carrinho vazio, faturação inválida, cupão desconhecido; evento verificado cumpre a encomenda exatamente uma vez; webhooks forjados, expirados, adulterados e com montante errado; pagamento falhado → nova tentativa → sucesso, e cancelamento só pelo dono; reembolsos parcial e total; adaptador Stripe (assinatura e mapeamento) |
| briefing and project workflow | cenário obrigatório completo ao nível dos serviços; exportação do brief com e sem consentimento de IA |
| uploads | ficheiros aceites e guardados com chave aleatória; tipos proibidos, conteúdo falsificado, scripts em SVG, ficheiros vazios e demasiado grandes |
| SaaS subscriptions | teste → ativação → renovação → pagamento falhado → cancelamento no fim do período → retoma; cancelamento imediato de um teste, fecho de testes expirados, aviso de renovação único; preço por lugar |
| tenancy | adesão obrigatória e convites que respeitam os papéis |

### `tests/crm.test.ts` — 22 testes

| Grupo | Testes |
|---|---|
| onboarding | funil predefinido criado uma única vez; lista de verificação inicial |
| tenant isolation | listagens só da própria empresa; leitura por id recusa ids alheios; pesquisa nunca cruza empresas; exportação só das próprias linhas; **todas as mutações recusam um id de outra empresa** |
| plan limits and feature gating | limites de contactos e empresas; limite de utilizadores antes de convidar; limite de armazenamento e anexos; propostas, exportação, vários funis e relatórios condicionados ao plano |
| roles | MEMBER cria e edita mas não elimina, exporta nem configura; MANAGER elimina e exporta; ADMIN configura |
| pipelines and stages | configuração de etapas, um único funil predefinido, proteção de etapas com negócios |
| deals | mover, ganhar, perder, reabrir, previsão ponderada; validação de entradas |
| contacts, leads, activities, tasks | filtros, ordenação, paginação, conversão de leads; histórico por contacto, empresa e negócio; tarefas (atribuição, atrasadas, concluídas, calendário) |
| proposals | numeração por empresa, totais, fluxo de estados |
| CSV export | escape e neutralização de fórmulas; exportação de dados reais |
| subscription state | recusa de empresas com subscrição expirada, cancelada fora do período, incompleta ou inexistente |

### `tests/pointage.test.ts` — 31 testes

| Grupo | Testes |
|---|---|
| time computation (puro) | máquina de estados; conversão de hora local para UTC (inverno/verão); calendário; pausas excluídas; várias sessões no dia; sessão aberta; anomalias; turno que atravessa a meia-noite; dias de mudança de hora em Europe/Zurich; totais semanais, horas extra e saldo |
| settings and export helpers (puro) | definições com valores por omissão, geolocalização e biometria nunca ativas; CSV; texto e geração do PDF |
| clocking | sequência válida, hora do servidor, recusa de transições inválidas; duplicado em 60 s; duas marcações concorrentes produzem uma só; exige funcionário ativo e ligado |
| roles | papel efetivo; funcionário só vê o que é seu; responsável limitado aos seus departamentos; administrador com acesso total; definições só para administradores |
| corrections | conversão de data e hora, anulação em vez de eliminação, auditoria; mudança de hora e hora local inexistente; correções desativáveis |
| two independent companies | a empresa A não lista, lê, corrige, aprova nem exporta nada da empresa B |
| absences | sobreposição, âmbito de aprovação, saldo de férias |
| plan limits and seats | limite de funcionários e sincronização de lugares; convite e ligação de conta; relatórios, exportações, departamentos e auditoria condicionados ao plano |
| retention | purga de marcações e ausências decididas para lá do prazo, com auditoria |

### `e2e/*.spec.ts` — 10 testes + 1 de preparação

| Ficheiro | Teste | Projetos |
|---|---|---|
| `global.setup.ts` | limpa a tabela `RateLimit` | setup |
| `purchase.spec.ts` | cenário obrigatório: conta → modelo → pacote → pagamento de teste → briefing → administrador → aprovação → concluído | desktop |
| `purchase.spec.ts` | pagamento de teste recusado deixa a encomenda por pagar e com nova tentativa possível | desktop |
| `purchase.spec.ts` | controlo de acesso: um cliente não chega ao backoffice; as API anónimas estão fechadas | desktop |
| `purchase.spec.ts` | o formulário de contacto cria um lead | desktop |
| `responsive.spec.ts` | 14 páginas públicas sem deslocamento horizontal | desktop + mobile |
| `responsive.spec.ts` | a navegação funciona (menu móvel incluído) | desktop + mobile |
| `responsive.spec.ts` | as 10 demonstrações renderizam sem deslocamento horizontal | desktop + mobile |
| `saas-i18n.spec.ts` | SaaS: criar empresa, iniciar testes do CRM e do Pointage, abrir ambos, ativar pagamento de teste, cancelar | desktop |
| `saas-i18n.spec.ts` | idiomas: deteção, troca manual, URL localizados, hreflang, canonical e moeda | desktop |
| `saas-i18n.spec.ts` | SEO: dados estruturados, sitemap, robots, demonstrações `noindex` | desktop |

O projeto `desktop` (Desktop Chrome) corre os três ficheiros (10 testes). O projeto `mobile` (Pixel 7) corre só `responsive.spec.ts` (3 testes). Total: 13 execuções de teste mais a preparação.

## 4. Correspondência com os cenários exigidos

| Cenário | Cobertura |
|---|---|
| **Compra em 10 passos** (1 criar conta · 2 escolher modelo · 3 escolher pacote e opção · 4 pagamento de teste · 5 confirmação · 6 briefing · 7 o administrador vê a encomenda · 8 o administrador muda o estado · 9 o cliente vê a atualização · 10 revisão, aprovação e conclusão) | E2E `purchase.spec.ts`, primeiro teste, com os passos numerados nos comentários. Verifica também o cupão, a fatura, o e-mail de confirmação em `EmailLog` e a notificação. O mesmo percurso ao nível dos serviços: `platform.test.ts` → "purchase → briefing → admin status changes → client review → approval → completion". |
| **CRM com duas empresas** | `crm.test.ts` → "CRM — tenant isolation" (5 testes com duas organizações). |
| **Pointage com duas empresas** | `pointage.test.ts` → "two independent companies". |
| **Tentativas de acesso entre empresas** | `crm.test.ts` → "get by id rejects foreign ids", "search never crosses tenants", "exports only the tenant's rows", "every mutation rejects a foreign-tenant id". `pointage.test.ts` → "tenant A cannot list, read, correct, approve or export anything of tenant B". `platform.test.ts` → "membership is required…" e os testes de encomendas (outro utilizador não paga nem cancela a encomenda). E2E → "access control". |
| **Cancelamento de subscrição** | `platform.test.ts` → "trial → activation → renewal → failed payment → cancellation at period end → resume" e "cancelling a trial is immediate…". E2E `saas-i18n.spec.ts` → ativação e cancelamento agendado. `crm.test.ts` → "subscription state". |
| **Pagamentos falhados** | `platform.test.ts` → "failed payment → retry → success…" e a parte de renovação falhada do teste de subscrições. E2E → "declined test payment leaves the order unpaid and retryable". |
| **Webhooks repetidos** | `platform.test.ts` → "a verified payment event fulfils the order exactly once" (o mesmo evento devolve `duplicate`; um segundo evento para a mesma encomenda não cria segundo pagamento nem segunda fatura) e "rejects forged, expired and tampered webhooks and amount mismatches" (um evento falhado é anulado e pode ser repetido). |
| **Recuperação de palavra-passe** | `platform.test.ts` → "password recovery: single-use token, expiry, sessions revoked, no account enumeration". Ao nível do serviço; **os ecrãs de recuperação não têm teste E2E**. |
| **Uploads** | `platform.test.ts` → grupo "uploads" (2 testes). `crm.test.ts` → "enforces the storage limit and manages attachments". Ao nível do serviço; **o upload pelo browser e a transferência por `/api/files/[id]` não têm teste E2E** (só a recusa de acesso anónimo). |
| **Responsividade** | E2E `responsive.spec.ts` em Desktop Chrome e Pixel 7: ausência de deslocamento horizontal em 14 páginas públicas e nas 10 demonstrações, e navegação. Não cobre as áreas autenticadas. |

## 5. Últimos resultados registados

Resultados registados pelo autor do código no ambiente de desenvolvimento; não foram reexecutados para escrever este documento. As contagens foram confirmadas pela leitura dos ficheiros de teste.

| Suite | Resultado |
|---|---|
| Vitest | **77 testes a passar em 3 ficheiros** (24 + 22 + 31) |
| Playwright | **13 testes + 1 de preparação a passar**, nos projetos `desktop` e `mobile` |
| `i18n:check` | 1804 frases de origem, 1804 traduzidas em pt-PT e em pt-BR, 0 em falta, 0 marcadores divergentes; 399 frases usadas por componentes de cliente (reexecutado ao escrever este documento) |

## 6. Integração contínua

`.github/workflows/ci.yml` — em cada push para `main` e em cada pull request, num executor `ubuntu-latest` com um serviço `postgres:16-alpine`:

1. `npm ci`
2. `npx prisma generate`
3. `npm run typecheck`
4. `npm run i18n:check`
5. criação da base de dados `athana_test`
6. `npm test`
7. `npx prisma migrate deploy && npm run db:seed` (com `SEED_ADMIN_*` e `SEED_DEMO=true`)
8. `npm run build`
9. `node scripts/check-public-assets.mjs`
10. `npx playwright install --with-deps chromium`
11. `npm run test:e2e`

**Este workflow ainda não foi executado no GitHub.** Na primeira execução pode precisar de ajustes (por exemplo, a disponibilidade de `psql` no executor ou os tempos de arranque). O ramo de trabalho é `claude/athana-platform`; o workflow só é acionado por pull requests ou por push para `main`.

## 7. Lacunas

| Lacuna | Detalhe |
|---|---|
| **Sem testes de carga** | Não foi medido o comportamento com muitos utilizadores em simultâneo, nem o custo do scrypt (N = 2^17) sob muitos logins, nem o do limitador em PostgreSQL. |
| **Sem auditoria automática de acessibilidade** | Não há axe/Lighthouse nos testes. O código usa etiquetas, `aria-*` e ligação "saltar para o conteúdo", mas a conformidade não foi medida. |
| **Ecrãs de CRUD do backoffice sem E2E completo** | O E2E só abre a lista de encomendas, uma encomenda e um projeto, e altera o estado do projeto. As ações de catálogo, cupões, planos, conteúdo, definições, equipa, reembolsos e pedidos RGPD (`src/modules/admin/actions.ts`) **não têm testes dedicados**, nem ao nível do serviço: a lógica de reembolso e de projetos é testada pelos serviços que elas chamam; a anonimização de contas (`processDataRequestAction`) não é testada. |
| **Interfaces do CRM e do Pointage sem E2E completo** | A lógica está coberta ao nível do serviço (53 testes). No browser, o E2E só confirma que o painel do CRM, a lista de contactos e o painel do Pointage abrem depois de iniciar o período de teste. Formulários, funil por arrastar, relatórios, marcação de ponto e exportações não são exercidos no browser. |
| **Sem percurso automático por todas as páginas** | O repositório não contém um teste que visite todas as páginas autenticadas para verificar que renderizam. Se essa verificação foi feita à mão durante o desenvolvimento, não ficou guardada como teste. |
| **API real do Stripe não testada** | Só o mapeamento de eventos, com eventos sintéticos assinados. Ver [INTEGRATIONS.md](INTEGRATIONS.md). |
| **Resend não testado** | Todos os testes usam `EMAIL_PROVIDER=log`. |
| **Etiquetas de medição não testadas** | Os testes recusam sempre os cookies; o carregamento com consentimento e os eventos `track()` não são verificados. |
| **Server Actions não testadas diretamente** | Os testes Vitest chamam os serviços. As ações (guardas, leitura de `FormData`, limitação de pedidos, redirecionamentos) só são exercidas pelos percursos E2E. |
| **Rotas de API pouco cobertas** | `/api/cron/daily`, `/api/account/export`, `/api/admin/reports`, `/api/pointage/export` e `/api/consent` só têm, no máximo, o teste de recusa de acesso anónimo. |
| **Docker e scripts de operação** | `Dockerfile`, `docker-compose.yml`, `backup.sh` e `restore.sh` nunca foram executados. |
| **Browsers** | Só Chromium (desktop e emulação de Pixel 7). Sem Firefox, Safari/WebKit nem dispositivos reais. |
| **Idiomas** | O E2E percorre sobretudo `fr-ch`; `pt-pt` e `pt-br` são verificados em poucas páginas. `fr-fr` não tem teste próprio. |
| **Cobertura de código** | Não é medida (sem relatório de cobertura configurado). |
| **Dados de teste** | Os testes não limpam o que criam; a base de dados de teste e a de desenvolvimento crescem a cada execução. |
