# Instalação, deploy e operação

> **Estado real.** Nada foi publicado. Nenhum DNS foi alterado. A imagem Docker **não pôde ser construída** no ambiente onde o código foi escrito (não havia daemon Docker): `Dockerfile` e `docker-compose.yml` têm de ser validados na primeira utilização. O workflow de CI ainda não correu no GitHub. Os passos de domínio, DNS, Stripe e Resend são ações manuais do proprietário.

Ver também [ENVIRONMENT.md](ENVIRONMENT.md) para as variáveis e [INTEGRATIONS.md](INTEGRATIONS.md) para os serviços externos.

## 1. Instalação local

Pré-requisitos: Node.js 22 ou superior (`engines` em `package.json`), PostgreSQL 16, npm.

```bash
# 1. Base de dados
createuser athana --pwprompt
createdb athana --owner athana
createdb athana_test --owner athana      # para os testes Vitest

# 2. Dependências
npm ci

# 3. Configuração
cp .env.example .env
#   editar DATABASE_URL e TEST_DATABASE_URL
#   para os testes E2E: SEED_ADMIN_EMAIL=admin@athana.test, SEED_ADMIN_PASSWORD=Admin-Local-2026!, SEED_DEMO=true

# 4. Esquema e dados de referência
npx prisma migrate deploy
npm run db:seed

# 5. Arranque
npm run dev                               # http://localhost:3000
```

`npm run setup` executa os passos 2 e 4 de seguida (`npm ci && prisma generate && prisma migrate deploy && npm run db:seed`).

Sem `SEED_ADMIN_*`, o seed cria `admin@athana.local` e mostra a palavra-passe uma única vez na consola.

Em desenvolvimento, os pagamentos usam a página de teste e os e-mails ficam na tabela `EmailLog` (consultável com `npx prisma studio`).

## 2. Scripts de `package.json`

| Script | Comando | Uso |
|---|---|---|
| `dev` | `next dev` | Servidor de desenvolvimento. |
| `build` | `prisma generate && next build` | Compilação de produção (`output: 'standalone'`). |
| `start` | `next start` | Servidor de produção a partir de `.next`. |
| `typecheck` | `tsc --noEmit` | Verificação de tipos. |
| `db:generate` | `prisma generate` | Regenera o cliente Prisma. |
| `db:migrate` | `prisma migrate deploy` | Aplica migrações (staging/produção). |
| `db:migrate:dev` | `prisma migrate dev` | Cria e aplica migrações em desenvolvimento. |
| `db:seed` | `tsx prisma/seed.ts` | Dados de referência (idempotente). |
| `setup` | ver acima | Primeira instalação local. |
| `i18n:check` | `tsx scripts/i18n-check.ts` | Verifica traduções; `-- --write` regenera `src/i18n/generated/`. |
| `test` | `vitest run` | Testes de integração. |
| `test:e2e` | `playwright test --trace off` | Testes E2E. |
| `test:all` | typecheck + i18n + test + e2e | Verificação completa. |

Scripts sem entrada em `package.json`: `node scripts/capture-catalog.mjs` (secção 12) e `node scripts/check-public-assets.mjs` (verifica que as 40 imagens do catálogo existem em `public/`).

## 3. Produção com Docker

### Ficheiros

| Ficheiro | Função |
|---|---|
| `Dockerfile` | Compilação em várias fases sobre `node:22-slim`. A fase final corre como utilizador `athana` (uid 1001), expõe a porta 3000, define `STORAGE_DIR=/data/storage`, declara o volume `/data/storage` e um `HEALTHCHECK` sobre `/api/health`. Inclui `prisma/`, `node_modules` e os dois ficheiros de que o seed precisa, para poder correr migrações e seed a partir da mesma imagem. |
| `docker-compose.yml` | Três serviços: `db` (PostgreSQL 16, volume `pgdata`), `migrate` (tarefa única: `prisma migrate deploy` + seed) e `app` (porta `127.0.0.1:3000`, volume `uploads` em `/data/storage`). `app` só arranca depois de `migrate` terminar com sucesso. |
| `deploy/Caddyfile` | Proxy inverso com HTTPS automático (Let's Encrypt), redirecionamento de `www` e limite de 20 MB por pedido. O Caddy corre no anfitrião; **não é um serviço do compose**. |
| `deploy/backup.sh`, `deploy/restore.sh` | Cópias de segurança e restauro (secção 9). |

### Volumes persistentes

| Volume | Conteúdo | Perda significa |
|---|---|---|
| `pgdata` | Base de dados PostgreSQL. | Perda de todos os dados. |
| `uploads` | Ficheiros privados (briefings, anexos do CRM). | Ficheiros ilegíveis, embora os metadados continuem na base de dados. |

### Primeiro deploy

```bash
# No servidor (Linux com Docker Engine e plugin compose)
git clone <repositório> /opt/athana && cd /opt/athana
git checkout <ramo ou tag a publicar>

cp .env.example .env.production
# Editar .env.production (ver ENVIRONMENT.md):
#   - descomentar e preencher POSTGRES_PASSWORD=<forte>
#   - APP_URL, SESSION_SECRET, PAYMENTS_MODE, chaves Stripe, Resend, CRON_SECRET, ALLOW_INDEXING
#   - NEXT_PUBLIC_* se houver etiquetas de marketing (são lidas na construção da imagem)
#   - SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD para a primeira execução
chmod 600 .env.production

docker compose --env-file .env.production up -d --build
docker compose logs -f migrate      # migrações + seed
docker compose ps                   # app deve ficar "healthy"
curl -s http://127.0.0.1:3000/api/health
```

Notas sobre `.env.production`:

- `DATABASE_URL` é substituída pelo compose (aponta para o serviço `db`); o valor no ficheiro é ignorado nos contentores.
- A opção `--env-file` serve para a interpolação do compose (`POSTGRES_PASSWORD` e os *build args* `NEXT_PUBLIC_*`); `env_file:` dentro do compose entrega as variáveis aos contentores. É o mesmo ficheiro.
- `STORAGE_DIR`: o compose força `/data/storage` no serviço `app`; o valor do ficheiro é ignorado.

### Etiquetas de marketing na imagem

As variáveis `NEXT_PUBLIC_*` são incorporadas em `next build`. O `Dockerfile` aceita-as como `ARG` e o `docker-compose.yml` passa-as como `build.args` do serviço `app`, com os valores do ficheiro dado em `--env-file`. Para as ativar ou alterar: definir em `.env.production` e reconstruir.

```bash
docker compose --env-file .env.production up -d --build
```

Alterar estas variáveis sem reconstruir a imagem não tem efeito. Ao construir a imagem fora do compose, passar `--build-arg NEXT_PUBLIC_GA4_ID=… ` etc.

### HTTPS com Caddy

```bash
sudo apt install caddy
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile    # ajustar o domínio se não for athana.ch
sudo systemctl reload caddy
```

O Caddy obtém o certificado quando o DNS já aponta para o servidor e as portas 80 e 443 estão abertas. A aplicação só escuta em `127.0.0.1:3000`, pelo que não fica exposta diretamente.

O limitador de pedidos e a auditoria leem o IP do cliente do cabeçalho `X-Forwarded-For`. O Caddy define-o. Se a aplicação for exposta sem proxy de confiança à frente, esse cabeçalho pode ser forjado pelo cliente.

### Pontos a validar na primeira construção

Como a imagem nunca foi construída, confirmar:

1. `docker compose build` termina sem erros (em particular `npx prisma generate && npx next build`).
2. O serviço `migrate` consegue executar `npx tsx prisma/seed.ts` dentro da imagem final (depende de `tsx` e do cliente Prisma gerado estarem no `node_modules` copiado da fase `deps`).
3. `app` fica `healthy` e `/api/health` responde `{"status":"ok"}`.
4. Um upload num briefing cria um ficheiro em `/data/storage/projects/` dentro do contentor e sobrevive a `docker compose up -d --force-recreate app`.
5. Os cabeçalhos de segurança chegam ao browser (`curl -I https://<domínio>/fr-ch`).

## 4. Staging e produção

Dois ambientes separados, cada um com o seu ficheiro de ambiente, a sua base de dados e o seu volume de uploads.

| | Staging | Produção |
|---|---|---|
| Domínio | por exemplo `staging.athana.ch` | `athana.ch` |
| Base de dados | própria | própria |
| `PAYMENTS_MODE` | `test` + `ALLOW_TEST_PAYMENTS=true`, ou `stripe` com chaves de teste | `stripe` com chaves reais |
| `ALLOW_TEST_PAYMENTS` | `true` | **nunca** |
| `ALLOW_INDEXING` | `false` | `true` |
| `EMAIL_PROVIDER` | `log` ou remetente de testes | `resend` |
| `SEED_DEMO` | opcional | não |
| Segredos | diferentes dos de produção | próprios |

No mesmo servidor, usar pastas e nomes de projeto distintos para não partilhar volumes:

```bash
cd /opt/athana-staging
docker compose -p athana-staging --env-file .env.staging up -d --build   # com ENV_FILE=.env.staging
```

e alterar a porta publicada (por exemplo `127.0.0.1:3001:3000`) e o bloco do Caddy. O `docker-compose.yml` atual tem a porta 3000 fixa: para staging no mesmo anfitrião é preciso um ficheiro de substituição (`docker-compose.override.yml`).

Nunca copiar a base de dados de produção para staging sem anonimizar: contém dados pessoais de clientes.

## 5. Alternativa: Vercel + PostgreSQL gerido

Possível, **não testada**. O que seria necessário:

| Ponto | Situação |
|---|---|
| Aplicação | Next.js corre nativamente na Vercel (`output: 'standalone'` é ignorado). O comando de compilação `npm run build` já inclui `prisma generate`. |
| Base de dados | PostgreSQL gerido (Neon, Supabase, RDS…). Usar a ligação com *pooling* em `DATABASE_URL`. As migrações (`prisma migrate deploy`) têm de ser executadas à parte, com ligação direta. |
| **Uploads** | **Bloqueio.** O adaptador de armazenamento escreve em disco local (`src/modules/storage/service.ts`). Na Vercel o sistema de ficheiros é efémero: os ficheiros perdem-se. É preciso escrever um adaptador S3 (a interface `StorageAdapter` tem três métodos: `put`, `get`, `remove`) ou alojar a aplicação onde exista volume persistente. Esse adaptador **não existe**. |
| Tarefa diária | Vercel Cron: criar um `vercel.json` na raiz (não existe; o de `legacy/` pertence ao site antigo) com `{"crons":[{"path":"/api/cron/daily","schedule":"15 3 * * *"}]}` e definir `CRON_SECRET`. |
| Webhook Stripe | Igual: `https://<domínio>/api/webhooks/stripe`. |
| Limites | Corpo máximo dos pedidos das funções da Vercel inferior aos 16 MB configurados para as Server Actions: os uploads grandes falhariam. |

## 6. Domínio e DNS de athana.ch (ação manual do proprietário — não executada)

1. Escolher o servidor e anotar o IPv4 (e IPv6, se houver).
2. Reduzir o TTL dos registos atuais (por exemplo para 300 s) um dia antes da mudança.
3. Instalar e validar a plataforma no servidor com um subdomínio temporário (por exemplo `new.athana.ch`), incluindo um pagamento de teste.
4. No gestor de DNS do domínio:
   - `A` de `athana.ch` → IP do servidor (e `AAAA` se aplicável);
   - `A` ou `CNAME` de `www` → o mesmo destino (o Caddy redireciona `www` para o domínio principal).
5. Manter intactos os registos de correio (`MX`) e acrescentar os registos pedidos pelo Resend para `EMAIL_FROM` (SPF, DKIM e, recomendado, DMARC).
6. Confirmar que o Caddy emitiu o certificado e que `APP_URL=https://athana.ch`.
7. Só então pôr `ALLOW_INDEXING=true`, registar o webhook de produção no Stripe e submeter `https://athana.ch/sitemap.xml` na Google Search Console.
8. O site antigo está hoje alojado noutro serviço: mantê-lo ativo até a propagação do DNS terminar e só depois desativá-lo.

Os redirecionamentos dos URL antigos estão em `next.config.ts`; verificar alguns URL do site atual depois da mudança.

## 7. Registo do webhook Stripe

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<domínio>/api/webhooks/stripe`.
3. Eventos a subscrever (os que `mapStripeEvent` trata):
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `charge.refunded`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar o *Signing secret* para `STRIPE_WEBHOOK_SECRET` e reiniciar a aplicação.
5. Enviar um evento de teste a partir do Dashboard e confirmar a resposta 200.

Respostas do endpoint: 400 assinatura inválida; 503 Stripe não configurado; 500 erro de processamento (o Stripe repete; o livro de idempotência torna a repetição segura). Staging e produção precisam de endpoints e segredos separados.

Em desenvolvimento local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) fornece um `whsec_` temporário.

## 8. Tarefa diária

`GET /api/cron/daily` com `Authorization: Bearer <CRON_SECRET>`. Faz: avisos de renovação 7 dias antes do fim do período; fecho de períodos de teste expirados e de subscrições com cancelamento agendado; limpeza de sessões expiradas, tokens de recuperação antigos e janelas do limitador; retenção do Pointage por organização; eliminação de leads antigos (`NEW` ou `CLOSED`) para lá de `privacy.retentionMonthsLeads`.

Sem esta tarefa, os períodos de teste continuam a ser recusados depois de expirarem (a verificação é feita em cada acesso), mas ninguém recebe avisos e as limpezas não acontecem.

Cron do sistema, no anfitrião:

```cron
15 3 * * * curl -fsS -H "Authorization: Bearer $(grep '^CRON_SECRET=' /opt/athana/.env.production | cut -d= -f2- | tr -d '"')" http://127.0.0.1:3000/api/cron/daily >> /var/log/athana-cron.log 2>&1
```

Temporizador systemd ou serviço externo (cron-job.org, GitHub Actions agendado, Vercel Cron): chamar `https://<domínio>/api/cron/daily` com o mesmo cabeçalho, uma vez por dia.

Resposta esperada: `{"ok":true,"billing":{…},"pointage":{…},"purgedLeads":0}`. Um 401 significa segredo errado ou `CRON_SECRET` não definido. Convém alertar quando a chamada falha.

## 9. Cópias de segurança

### `deploy/backup.sh`

O script muda para a pasta do projeto, usa `docker compose --env-file $ENV_FILE` (por omissão `.env.production`) e gera em `BACKUP_DIR` (por omissão `/var/backups/athana`):

- `db-<data>.dump` — `pg_dump --format=custom` do serviço `db`;
- `uploads-<data>.tar.gz` — conteúdo de `/data/storage`, lido dentro do contentor `app` (`exec -T app tar`);

e apaga ficheiros com mais de `KEEP_DAYS` dias (30).

```cron
15 2 * * * /opt/athana/deploy/backup.sh >> /var/log/athana-backup.log 2>&1
```

Cuidados:

- os serviços `db` e `app` têm de estar a correr; com `app` parado, o arquivo de uploads fica vazio ou o script falha;
- para staging, indicar o ficheiro e o destino: `ENV_FILE=.env.staging BACKUP_DIR=/var/backups/athana-staging ./deploy/backup.sh` (e o mesmo nome de projeto compose usado no arranque, se for diferente do da pasta);
- verificar de vez em quando o tamanho dos ficheiros gerados: um `pg_dump` falhado pode deixar um ficheiro vazio.

### Cópia externa

Uma cópia no mesmo servidor não protege contra a perda do servidor. Copiar os ficheiros para armazenamento de objetos noutra região (por exemplo com `rclone` ou `restic`), cifrados, e aplicar retenção própria. **Não está configurado.**

### Restauro

```bash
cd /opt/athana
./deploy/restore.sh /var/backups/athana/db-<data>.dump /var/backups/athana/uploads-<data>.tar.gz
# pede para escrever "restore"
```

O script para a aplicação, executa `pg_restore --clean --if-exists --no-owner`, volta a arrancá-la e, se for dado o segundo argumento, extrai o arquivo de uploads para `/data/storage` dentro do contentor `app`. Sem o segundo argumento, só a base de dados é restaurada.

A extração **não apaga** os ficheiros já existentes: ficheiros criados depois da cópia ficam no volume sem linha correspondente na base de dados (órfãos, sem efeito funcional). Restaurar a base de dados e os uploads da **mesma data**.

### Ensaios de restauro

Uma cópia só vale depois de restaurada com sucesso. Pelo menos de três em três meses, restaurar a cópia mais recente no ambiente de staging, abrir uma encomenda, uma fatura e um ficheiro de briefing, e anotar a duração. Os scripts **nunca foram executados** (dependem de Docker).

## 10. Monitorização e registos

O que existe:

| Fonte | Conteúdo |
|---|---|
| `GET /api/health` | `200 {"status":"ok","time":…}` se a base de dados responde; `503 {"status":"degraded"}` caso contrário. Não expõe configuração. É usado pelo `HEALTHCHECK` do contentor. |
| Registos do contentor | `docker compose logs -f app`. O código escreve erros com prefixos: `[action]`, `[automation]`, `[email]`, `[webhook:stripe]`, `[webhook:test]`, `[crm export]`, `[pointage.export]`, `[pointage.retention]`. |
| Tabela `EmailLog` | Todos os e-mails, com estado `sent`, `logged` ou `failed` e a mensagem de erro. |
| Tabela `AuditLog` | Ações sensíveis; consultável em Admin → Auditoria e, por organização, no Pointage. |
| Tabela `WebhookEvent` | Eventos de pagamento processados. |
| Stripe Dashboard | Entregas de webhook e respetivas respostas. |

O que **não está instalado** e se recomenda:

- monitorização externa de disponibilidade sobre `/api/health` (UptimeRobot, Better Stack, Healthchecks.io), com alerta;
- recolha de erros (Sentry ou equivalente) — o código só usa `console.error`;
- rotação dos registos do Docker (`max-size`, `max-file` no `daemon.json`);
- alertas de espaço em disco (volumes `pgdata`, `uploads`, pasta de cópias);
- alerta quando a tarefa diária ou a cópia de segurança falham;
- consulta periódica de `EmailLog` com `status = 'failed'`.

## 11. Publicação de novas versões e reversão

### Publicar

```bash
cd /opt/athana
./deploy/backup.sh                                   # antes de qualquer migração
git fetch && git checkout <tag>
docker compose --env-file .env.production build      # constrói sem parar o serviço
docker tag athana-app:latest athana-app:<tag>        # guardar a imagem com tag (nome real: ver "docker images")
docker compose --env-file .env.production up -d      # corre migrate, depois recria app
curl -fsS http://127.0.0.1:3000/api/health
```

**Sem interrupção?** Com um único contentor `app`, `up -d` para o antigo e arranca o novo: há alguns segundos de indisponibilidade. Publicação sem qualquer interrupção exige duas instâncias atrás do proxy (azul/verde) e, para isso, armazenamento de uploads partilhado. **Não está montado.** O que o desenho atual já garante é a compatibilidade necessária: migrações aditivas permitem que a versão antiga continue a funcionar enquanto a nova arranca.

Recomenda-se construir a imagem numa pipeline, publicá-la num registo com tag por versão e usar `image: <registo>/athana:<tag>` no compose, em vez de `build: .` no servidor. Fica por fazer.

### Política de migrações

- **Só para a frente.** Não há migrações de reversão; o Prisma não as gera.
- **Aditivas.** Acrescentar tabelas e colunas opcionais ou com valor por omissão. Não renomear nem remover no mesmo lançamento em que o código deixa de as usar.
- **Alterações destrutivas em duas fases.** Versão N: o código deixa de usar a coluna. Versão N+1: a migração remove-a.
- **Cópia de segurança antes de cada migração.**

### Guia de reversão

| Situação | Ação |
|---|---|
| A nova versão tem um defeito e as migrações foram aditivas | **Voltar à imagem anterior.** `git checkout <tag anterior>` e `docker compose --env-file .env.production up -d --build app`, ou, com imagens em registo, repor a tag anterior no compose e `up -d app`. A base de dados fica como está: a versão antiga ignora colunas e tabelas novas. Não voltar a correr `migrate` com o código antigo não é problema (`migrate deploy` só aplica migrações que existam na pasta). |
| Uma migração falhou a meio | O serviço `migrate` termina com erro e `app` não é recriada: a versão antiga continua a servir. Ver `docker compose logs migrate`, corrigir, e se necessário marcar o estado com `npx prisma migrate resolve --rolled-back <nome>` ou `--applied <nome>`. |
| A migração aplicada é incompatível com a versão antiga, ou houve corrupção de dados | **Último recurso: restaurar a cópia de segurança** feita antes do deploy (`deploy/restore.sh` com os dois ficheiros) e repor a imagem anterior. Perdem-se os dados criados desde a cópia; os pagamentos entretanto recebidos têm de ser reconciliados à mão a partir do Stripe Dashboard. |
| Erro de configuração | Corrigir `.env.production` e `docker compose --env-file .env.production up -d app`. |

Depois de qualquer reversão: `/api/health`, login, uma página do catálogo, um pagamento de teste em staging, e o estado das entregas de webhook no Stripe (reenviar as que falharam).

## 12. Regenerar as imagens do catálogo

As imagens dos modelos (`public/images/catalog/<slug>/cover.jpg` e `page-1..3.jpg`) e a imagem Open Graph por omissão (`public/images/og-default.png`) são capturas das demonstrações reais.

```bash
npm run dev                                               # ou um servidor já a correr
BASE_URL=http://localhost:3000 node scripts/capture-catalog.mjs
node scripts/check-public-assets.mjs                      # confirma que as 40 imagens existem
```

Requer o Chromium do Playwright (`npx playwright install chromium`). O script importa o pacote `playwright`, que está instalado como dependência de `@playwright/test`. Depois de alterar uma demonstração, voltar a correr o script e incluir as imagens no commit. Um modelo novo tem de ser acrescentado à lista `DEMOS` do script e à lista `slugs` de `check-public-assets.mjs`.

## 13. Integração contínua

`.github/workflows/ci.yml` corre em cada push para `main` e em cada pull request: `npm ci`, `prisma generate`, verificação de tipos, verificação de traduções, testes Vitest, migrações + seed, compilação, verificação das imagens e testes E2E. **Ainda não foi executado no GitHub.** Não existe workflow de deploy. Detalhes em [TESTING.md](TESTING.md).

---

## Anexo A — Publicação na Vercel (projeto atual de athana.ch)

O repositório está ligado a um projeto Vercel cujo ramo de produção é `main`. Cada *push* para `main` desencadeia uma publicação de produção; os outros ramos geram pré-visualizações.

### O que o repositório já faz

- `vercel.json` declara o *framework* Next.js, instala com `npm ci` e compila com `node scripts/vercel-build.mjs`.
- `scripts/vercel-build.mjs`:
  - **em produção, recusa compilar se faltar configuração obrigatória** (ver tabela). A compilação falha de propósito e a Vercel mantém no ar a versão anterior — um projeto meio configurado nunca substitui o site em funcionamento;
  - quando existe base de dados, aplica as migrações (`prisma migrate deploy`) e o *seed* idempotente, usando a ligação direta (`DATABASE_URL_UNPOOLED` ou `POSTGRES_URL_NON_POOLING`) se o fornecedor a disponibilizar;
  - compila a aplicação.
- Tarefa diária declarada em `vercel.json` (`/api/cron/daily`, 03:00 UTC). A Vercel envia `Authorization: Bearer <CRON_SECRET>` quando a variável `CRON_SECRET` existe.
- Ficheiros dos clientes: com `BLOB_READ_WRITE_TOKEN` definido, o armazenamento passa automaticamente para um *store* **privado** do Vercel Blob (`src/modules/storage/service.ts`). Este adaptador não foi testado contra o serviço real.

### O que tem de ser feito no painel da Vercel (proprietário)

| Passo | Onde | Notas |
|---|---|---|
| Framework Preset = Next.js; Output Directory sem *override* | Settings → Build & Deployment | O projeto estava configurado para o site antigo (Vite, pasta `dist`) |
| Criar base de dados PostgreSQL | Storage → Create → Neon (ou outro fornecedor) | Define `DATABASE_URL` (e a variante sem *pooling*) automaticamente |
| Criar um *Blob store* privado | Storage → Create → Blob | Define `BLOB_READ_WRITE_TOKEN` |
| `SESSION_SECRET` | Settings → Environment Variables | Aleatório, 32+ caracteres |
| `APP_URL=https://athana.ch` | idem (Production) | Sem esta variável é usado o endereço do projeto na Vercel |
| Pagamentos | idem | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `PAYMENTS_MODE=stripe`; **ou**, para abrir sem cobrança real, `PAYMENTS_MODE=test` + `ALLOW_TEST_PAYMENTS=true` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | idem | Cria o super administrador na primeira publicação; remover depois |
| `CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_PROVIDER=resend`, `ALLOW_INDEXING=true` | idem (Production) | Sem Resend, os e-mails ficam apenas registados |
| `ADMIN_HOST=admin.athana.ch` e adicionar o domínio `admin.athana.ch` ao projeto | Environment Variables + Settings → Domains | Ver Anexo B |

Limites a conhecer na Vercel: o corpo de um pedido não pode exceder cerca de 4,5 MB, pelo que o limite de envio de ficheiros deve ser reduzido para 4 MB em Admin → Paramètres → Fichiers.

## Anexo B — Painel administrativo em `admin.athana.ch`

Com a variável `ADMIN_HOST` definida:

- o site público responde **404** em `/admin` e em `/api/admin/*` (não revela que existe um painel);
- o *host* de administração só serve o painel e as páginas de início de sessão e de recuperação de palavra-passe; qualquer outro endereço é reencaminhado para o site público; a raiz abre o painel;
- os *cookies* de sessão são próprios de cada *host*: a equipa inicia sessão separadamente em `admin.athana.ch`, e uma sessão do site público não dá acesso ao painel (e vice-versa);
- as ligações para o painel nos e-mails internos e no convite de novos membros apontam para o *host* de administração;
- as respostas do *host* de administração levam `X-Robots-Tag: noindex, nofollow`.

É o mesmo código e a mesma publicação: basta adicionar o domínio ao projeto e definir a variável. O acesso pode ainda ser restringido por IP ou VPN ao nível do alojamento (na Vercel: Firewall). Sem `ADMIN_HOST`, o painel continua em `/admin` no domínio principal (comportamento em desenvolvimento). A regra está em `src/lib/admin-host.ts` e é aplicada em `src/proxy.ts`; testes em `tests/platform.test.ts` e `e2e/purchase.spec.ts`.
