# Variáveis de ambiente

Fontes: `.env.example`, `src/lib/env.ts`, `prisma/seed.ts`, `src/app/robots.ts`, `docker-compose.yml`, `playwright.config.ts`, `tests/setup.ts`.

Em desenvolvimento, copiar `.env.example` para `.env`. Em staging e produção, definir as variáveis no alojamento ou em `.env.production` (ficheiro nunca versionado: `.gitignore` e `.dockerignore` excluem `.env*`, exceto `.env.example`).

`src/lib/env.ts` centraliza o acesso. Nenhum segredo tem valor por omissão em produção: a falta de um segredo obrigatório faz o pedido falhar com erro explícito. As validações de produção são ignoradas durante `next build` (`NEXT_PHASE=phase-production-build`), para que a imagem possa ser construída sem segredos.

## 1. Referência completa

### Núcleo

| Variável | Obrigatória | Finalidade | Onde obter | Se faltar |
|---|---|---|---|---|
| `DATABASE_URL` | Sim | Ligação PostgreSQL usada pelo Prisma. | Servidor PostgreSQL próprio ou gerido. No `docker-compose.yml` é definida automaticamente a partir de `POSTGRES_PASSWORD`. | O Prisma falha no primeiro acesso; `/api/health` responde 503. |
| `APP_URL` | Sim em staging/produção | Origem pública sem barra final (`https://athana.ch`). Usada em ligações de e-mail, URL de retorno do pagamento, canonical, hreflang, sitemap e Open Graph. | O domínio do ambiente. | Usa `http://localhost:3000`: os e-mails e o retorno do pagamento apontariam para localhost. |
| `SESSION_SECRET` | Sim em produção | Segredo do servidor. Uso atual: assinatura dos eventos do fornecedor de pagamento de teste e sal do hash de IP no registo de consentimento. Os tokens de sessão **não** dependem dele (são aleatórios e guardados em hash). | `openssl rand -base64 48` | Fora de produção usa um valor fixo de desenvolvimento. Em produção, se faltar, tiver menos de 32 caracteres ou começar por `dev-only`, o código que o lê lança erro. |
| `NODE_ENV` | Definida pela plataforma | `production` ativa cookies `Secure` e as validações acima. | `next start` e o `Dockerfile` definem-na. | — |

A validação de `SESSION_SECRET` e de `PAYMENTS_MODE` acontece quando o valor é lido pela primeira vez (são *getters*), não no arranque do processo. Um erro de configuração pode por isso só aparecer no primeiro checkout ou no primeiro registo de consentimento. Depois de cada deploy, testar um pagamento de teste em staging e verificar os registos.

### Pagamentos

| Variável | Obrigatória | Finalidade | Onde obter | Se faltar |
|---|---|---|---|---|
| `PAYMENTS_MODE` | Não | `test` ou `stripe`. | — | Se não estiver definida: `stripe` quando existe `STRIPE_SECRET_KEY`, caso contrário `test`. |
| `ALLOW_TEST_PAYMENTS` | Não | `true` autoriza `PAYMENTS_MODE=test` com `NODE_ENV=production`. **Só em staging.** | — | Com `NODE_ENV=production` e modo `test`, o checkout lança `PAYMENTS_MODE=test is not allowed in production`. |
| `STRIPE_SECRET_KEY` | Com `PAYMENTS_MODE=stripe` | Chave secreta da API Stripe (`sk_test_…` ou `sk_live_…`). | Stripe Dashboard → Developers → API keys. | Checkout, reembolsos e webhook falham com `Stripe is not configured`; o webhook responde 503. |
| `STRIPE_WEBHOOK_SECRET` | Com `PAYMENTS_MODE=stripe` | Segredo de assinatura (`whsec_…`) do endpoint `https://<domínio>/api/webhooks/stripe`. | Stripe Dashboard → Developers → Webhooks → endpoint → Signing secret. | `/api/webhooks/stripe` responde 503 e nenhuma encomenda passa a paga. |

O modo `test` nunca movimenta dinheiro: o checkout leva a `/<locale>/sandbox-payment`, uma página claramente identificada como teste, e o evento resultante percorre o mesmo pipeline assinado dos eventos reais.

Não existe variável para a chave publicável do Stripe: o checkout é alojado e redireciona para `checkout.stripe.com`, sem Stripe.js no browser.

### E-mail

| Variável | Obrigatória | Finalidade | Onde obter | Se faltar |
|---|---|---|---|---|
| `EMAIL_PROVIDER` | Não | `log` ou `resend`. | — | Se não estiver definida: `resend` quando existe `RESEND_API_KEY`, caso contrário `log`. |
| `RESEND_API_KEY` | Com `EMAIL_PROVIDER=resend` | Chave da API Resend. | resend.com → API Keys. | Com `resend` mas sem chave, nada é enviado: a mensagem fica em `EmailLog` com estado `logged`. |
| `EMAIL_FROM` | Não | Remetente. O domínio tem de estar verificado no Resend. | — | `Athana <contact@athana.ch>` |
| `CONTACT_EMAIL` | Não | Destinatário das notificações internas (nova encomenda, briefing recebido, novo lead). | — | `contact@athana.ch` |

Com `EMAIL_PROVIDER=log`, nenhum e-mail sai do servidor. As mensagens (incluindo as ligações de recuperação de palavra-passe e de convite) ficam na tabela `EmailLog`. É o modo certo para desenvolvimento e testes; em produção significaria que os clientes não recebem nada.

### Ficheiros, agendador e SEO

| Variável | Obrigatória | Finalidade | Onde obter | Se faltar |
|---|---|---|---|---|
| `STORAGE_DIR` | Não | Pasta dos uploads privados. Em produção tem de estar num volume persistente. | — | `./storage`. O `Dockerfile` define `/data/storage` e o `docker-compose.yml` força esse valor no serviço `app`. |
| `CRON_SECRET` | Para a tarefa diária | Protege `GET /api/cron/daily` (`Authorization: Bearer <CRON_SECRET>`). | `openssl rand -hex 32` | O endpoint responde sempre 401 e a manutenção diária não corre (avisos de renovação, fecho de períodos de teste, limpezas, retenção). |
| `ALLOW_INDEXING` | Não | `true` faz `robots.txt` permitir a indexação e publicar o sitemap. | — | Qualquer outro valor: `robots.txt` responde `Disallow: /`. |

`STORAGE_DIR` em Docker: o `docker-compose.yml` define `STORAGE_DIR: /data/storage` no bloco `environment` do serviço `app`, que tem prioridade sobre `env_file`. O valor `./storage` de `.env.example` serve só para desenvolvimento e é ignorado no contentor. Fora do compose (outro orquestrador, `docker run`), garantir que a variável aponta para o volume.

`ALLOW_INDEXING` só controla o `robots.txt`. As áreas privadas, as demonstrações e as landing pages de campanha têm sempre `noindex` nos metadados, independentemente desta variável. As páginas públicas de staging não têm meta `noindex`: ficam protegidas apenas pelo `robots.txt`. Para staging, recomenda-se ainda autenticação básica no proxy.

### Etiquetas de marketing (`NEXT_PUBLIC_*`)

Só são carregadas depois do consentimento do visitante e apenas se o identificador estiver preenchido. Deixar vazio para desativar.

| Variável | Finalidade | Onde obter |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 (`G-XXXXXXXXXX`). | Google Analytics → Admin → Fluxos de dados. |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager (`GTM-XXXXXXX`). Se estiver definido, tem prioridade: as etiquetas GA4 e Google Ads diretas não são carregadas. | Google Tag Manager. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads (`AW-XXXXXXXXX`). | Google Ads → Ferramentas → Conversões. |
| `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` | Etiqueta da conversão de compra do Google Ads. Com esta variável e `NEXT_PUBLIC_GOOGLE_ADS_ID` definidas, e com consentimento de marketing, o evento `purchase` envia também `conversion` com `send_to: <ID>/<etiqueta>` (`src/modules/analytics/track.ts`). | Google Ads → Conversões → detalhes da etiqueta. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel. | Meta Events Manager. |

**São incorporadas na compilação.** O Next.js substitui `process.env.NEXT_PUBLIC_*` pelo valor no momento de `next build`. Alterá-las depois exige nova compilação. Com Docker, têm de ser passadas como *build args*: o `Dockerfile` declara os cinco `ARG` e o `docker-compose.yml` passa-os ao construir o serviço `app`, lendo-os do ficheiro indicado em `--env-file`. Basta por isso defini-las em `.env.production` e reconstruir (`up -d --build`). Ver [DEPLOYMENT.md](DEPLOYMENT.md).

### Seed (primeira instalação)

| Variável | Finalidade | Se faltar |
|---|---|---|
| `SEED_ADMIN_EMAIL` | E-mail do super administrador. | Ver abaixo. |
| `SEED_ADMIN_PASSWORD` | Palavra-passe inicial, mínimo 12 caracteres. Alterar após o primeiro login. | Ver abaixo. |
| `SEED_DEMO` | `true` cria o cupão `TEST10` (10 %). | Não é criado. |

Sem as duas variáveis de administrador: fora de produção, o seed cria `admin@athana.local` com palavra-passe aleatória mostrada uma vez na consola; em produção, não cria administrador e avisa. Depois da primeira instalação, retirar `SEED_ADMIN_PASSWORD` do ambiente.

### Testes e ferramentas

| Variável | Finalidade | Valor por omissão |
|---|---|---|
| `TEST_DATABASE_URL` | Base de dados dos testes Vitest. O nome tem de conter `test`, senão os testes recusam arrancar. | `postgresql://athana:athana@localhost:5432/athana_test` |
| `E2E_PORT` | Porta do servidor usado pelo Playwright. | `3100` |
| `E2E_BASE` | Origem alternativa para o cookie de consentimento nos testes E2E. | `http://localhost:<E2E_PORT>` |
| `PW_CHROMIUM` | Caminho de um executável Chromium já instalado. | Chromium do Playwright. |
| `BASE_URL` | Origem usada por `scripts/capture-catalog.mjs`. | `http://localhost:3000` |

### Docker Compose

| Variável | Finalidade |
|---|---|
| `POSTGRES_PASSWORD` | Palavra-passe do PostgreSQL do compose. Obrigatória (o compose recusa arrancar sem ela). Está em `.env.example` como linha comentada: descomentar e preencher em `.env.production`. |
| `ENV_FILE` | Ficheiro carregado pelos serviços `app` e `migrate`, e usado por `deploy/backup.sh` e `deploy/restore.sh`. Por omissão `.env.production`. |
| `BACKUP_DIR`, `KEEP_DAYS` | Destino e retenção de `deploy/backup.sh` (`/var/backups/athana`, 30 dias). |

## 2. Valores recomendados por ambiente

### Desenvolvimento

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://athana:<pw>@localhost:5432/athana` |
| `APP_URL` | `http://localhost:3000` |
| `SESSION_SECRET` | vazio (usa o valor de desenvolvimento) |
| `PAYMENTS_MODE` | `test` |
| `EMAIL_PROVIDER` | `log` |
| `STORAGE_DIR` | `./storage` |
| `CRON_SECRET` | um valor qualquer, para poder chamar a tarefa à mão |
| `ALLOW_INDEXING` | `false` |
| `NEXT_PUBLIC_*` | vazias |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | `admin@athana.test` / `Admin-Local-2026!` (os valores que os testes E2E assumem) |
| `SEED_DEMO` | `true` |
| `TEST_DATABASE_URL` | `postgresql://athana:<pw>@localhost:5432/athana_test` |

### Staging

| Variável | Valor |
|---|---|
| `DATABASE_URL` | base de dados **própria de staging**, nunca a de produção |
| `APP_URL` | `https://staging.athana.ch` (ou equivalente) |
| `SESSION_SECRET` | aleatório, ≥ 32 caracteres, diferente do de produção |
| `PAYMENTS_MODE` | `test` com `ALLOW_TEST_PAYMENTS=true`; ou `stripe` com chaves `sk_test_…` para validar a integração real |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | chaves do **modo de teste** do Stripe, se `PAYMENTS_MODE=stripe` |
| `EMAIL_PROVIDER` | `log`, ou `resend` com um domínio/remetente de testes |
| `STORAGE_DIR` | não é preciso definir com o compose (forçado a `/data/storage`, volume próprio de staging) |
| `CRON_SECRET` | aleatório, próprio de staging |
| `ALLOW_INDEXING` | `false` |
| `NEXT_PUBLIC_*` | vazias, ou identificadores de propriedades de teste |
| `SEED_DEMO` | `true` se for útil para testes manuais |

### Produção

| Variável | Valor |
|---|---|
| `DATABASE_URL` | base de dados de produção |
| `APP_URL` | `https://athana.ch` |
| `SESSION_SECRET` | aleatório, ≥ 32 caracteres, guardado no gestor de segredos |
| `PAYMENTS_MODE` | `stripe` |
| `ALLOW_TEST_PAYMENTS` | **não definir** |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | `sk_live_…` / `whsec_…` do endpoint de produção |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL` | chave de produção; remetente num domínio verificado |
| `STORAGE_DIR` | não é preciso definir com o compose (forçado a `/data/storage`, volume persistente incluído nas cópias de segurança) |
| `CRON_SECRET` | aleatório |
| `ALLOW_INDEXING` | `true` |
| `NEXT_PUBLIC_*` | identificadores reais, passados na compilação |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | só na primeira instalação; remover a palavra-passe depois |
| `SEED_DEMO` | **não definir** |

## 3. Definições que não são variáveis de ambiente

Vários parâmetros estão na base de dados e editam-se no backoffice (Admin → Definições), não no ambiente:

| Definição (`Setting`) | Conteúdo | Valores por omissão |
|---|---|---|
| `company` | Dados legais do vendedor copiados para as faturas. | Seed |
| `invoicing` | Prefixo e nota de rodapé das faturas. | `ATH`, vazio |
| `security` | `sessionDays`, `passwordMinLength`, `loginMaxAttempts`. | 30, 10, 8 |
| `uploads` | Tamanho máximo e tipos MIME permitidos. | 15 MB, 9 tipos |
| `privacy` | Versão da política e retenção de leads em meses. | `2026-11`, 24 |
| `maintenance` | Criar tarefa de proposta de manutenção quando um projeto é aprovado. | ativo |

`security.passwordMinLength` é aplicado no registo, na recuperação e na alteração de palavra-passe (`assertPasswordPolicy` em `src/modules/auth/service.ts`). Pode **aumentar** o mínimo acima do piso de 10 caracteres fixado no código, nunca baixá-lo.

Moedas, taxas de imposto e meios de pagamento apresentados estão na tabela `Market` (Admin → Definições → Mercados).
