# ATHANA — plataforma internacional de soluções digitais

Plataforma de venda online da [ATHANA](https://athana.ch): modelos de websites com demonstração e compra direta, software em subscrição (ATHANA CRM, ATHANA Pointage), serviços de automação e desenvolvimento à medida, em quatro mercados (Suíça, França, Portugal, Brasil).

> **Estado:** pronta para a etapa final de configuração (credenciais, validação comercial e jurídica, revisão humana). Não foi publicada. Ver [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) e [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md).

## O que inclui

- **Site institucional** e catálogo de 10 modelos com demonstrações navegáveis (`/demo/<slug>`).
- **Compra online**: packs, opções, cupões, impostos por mercado, checkout alojado (Stripe) com modo de teste, webhooks verificados e idempotentes, faturas, reembolsos.
- **Briefing** após a compra, área de cliente, acompanhamento de projetos, mensagens, revisões e aprovação.
- **Painel administrativo** com permissões por função verificadas no servidor.
- **ATHANA CRM** e **ATHANA Pointage**, multi-empresa, com planos, limites e subscrições.
- **Internacionalização**: `/fr-ch`, `/fr-fr`, `/pt-pt`, `/pt-br`, com endereços, moedas e formatos localizados.
- **SEO**, camada de eventos de marketing sujeita a consentimento, automações e e-mails em três línguas.

## Tecnologia

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL 16 · Prisma 6 · Vitest · Playwright.
Monólito modular: a lógica de negócio está em `src/modules/*`, as páginas em `src/app/[locale]/*`.

## Instalação local

Requisitos: Node.js 22 e PostgreSQL 16.

```bash
cp .env.example .env            # preencher DATABASE_URL e SESSION_SECRET
npm ci
npx prisma migrate deploy
SEED_ADMIN_EMAIL=admin@exemplo.test SEED_ADMIN_PASSWORD='uma-palavra-passe-longa' SEED_DEMO=true npm run db:seed
npm run dev                     # http://localhost:3000
```

Sem credenciais, os pagamentos funcionam em modo de teste (nenhum dinheiro é movimentado) e os e-mails são apenas registados na base de dados.

## Comandos

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Compilação e arranque de produção |
| `npm run typecheck` | Verificação de tipos |
| `npm run i18n:check` | Verifica que todos os textos têm tradução (`-- --write` atualiza os ficheiros gerados) |
| `npm test` | Testes unitários e de integração (base de dados de teste) |
| `npm run test:e2e` | Testes de ponta a ponta (Playwright) |
| `npm run test:all` | Tudo o que precede |
| `npm run db:migrate` / `npm run db:seed` | Migrações e dados de referência |
| `node scripts/capture-catalog.mjs` | Regenera as imagens do catálogo a partir das demonstrações |

## Documentação

| Documento | Conteúdo |
|---|---|
| [PROJECT_AUDIT](docs/PROJECT_AUDIT.md) | Auditoria do repositório original |
| [ARCHITECTURE](docs/ARCHITECTURE.md) · [DATABASE](docs/DATABASE.md) · [CONVENTIONS](docs/CONVENTIONS.md) | Arquitetura, modelo de dados, regras de desenvolvimento |
| [ENVIRONMENT](docs/ENVIRONMENT.md) · [DEPLOYMENT](docs/DEPLOYMENT.md) | Variáveis de ambiente, instalação, publicação, *rollback* |
| [SECURITY](docs/SECURITY.md) · [TESTING](docs/TESTING.md) | Segurança e testes |
| [INTEGRATIONS](docs/INTEGRATIONS.md) | Stripe, e-mail, analítica, o que falta configurar |
| [ADMIN_GUIDE](docs/ADMIN_GUIDE.md) · [CLIENT_GUIDE](docs/CLIENT_GUIDE.md) | Guias de utilização |
| [BUSINESS_CONFIGURATION](docs/BUSINESS_CONFIGURATION.md) | Preços, impostos e decisões comerciais |
| [ROADMAP](docs/ROADMAP.md) · [MARKETING_PLAN_90_DAYS](docs/MARKETING_PLAN_90_DAYS.md) | Próximos passos e plano de campanhas |
| [IMPLEMENTATION_STATUS](docs/IMPLEMENTATION_STATUS.md) · [PRODUCTION_CHECKLIST](docs/PRODUCTION_CHECKLIST.md) | Estado atual e lista de verificação |

## Site anterior

O site original (Vite + React) está preservado, sem alterações, em [`legacy/`](legacy/).
