# Checklist de produção

Marcar cada ponto antes de abrir o site ao público. Nada desta lista foi executado em produção: não houve publicação, alteração de DNS nem contratação de serviços.

## A. Credenciais e contas (proprietário)

- [ ] Servidor ou alojamento escolhido, com PostgreSQL 16 e volume persistente para ficheiros
- [ ] `DATABASE_URL`, `APP_URL=https://athana.ch`, `SESSION_SECRET` (aleatório, ≥ 32 caracteres) definidos
- [ ] Conta Stripe verificada para a entidade ATHANA; `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` definidos; `PAYMENTS_MODE=stripe`
- [ ] Endpoint de webhook criado no Stripe: `https://athana.ch/api/webhooks/stripe` com os eventos listados em `docs/INTEGRATIONS.md`
- [ ] Métodos de pagamento ativados no painel Stripe (cartões; TWINT, Multibanco, MB WAY, Pix conforme elegibilidade da conta)
- [ ] Conta Resend com o domínio athana.ch verificado (SPF, DKIM); `RESEND_API_KEY`, `EMAIL_PROVIDER=resend`
- [ ] `CRON_SECRET` definido e tarefa diária a chamar `/api/cron/daily`
- [ ] Conta de super administrador criada pelo *seed* e palavra-passe alterada após o primeiro acesso
- [ ] Identificadores de marketing (GA4 / GTM / Google Ads / Meta) definidos, se forem usados

## B. Configuração comercial (proprietário, no painel)

- [ ] Dados da empresa completos (denominação, número de empresa, IVA, IBAN) — Paramètres
- [ ] **Taxas de imposto por mercado** definidas após parecer fiscal — Paramètres → Marchés (todas começam a 0 %)
- [ ] Preços de todos os packs, opções e planos revistos em CHF, EUR e BRL (ver `docs/BUSINESS_CONFIGURATION.md`)
- [ ] Prazos de entrega, páginas e ciclos de revisão por pack revistos
- [ ] Modelos de e-mail relidos nas três línguas
- [ ] Textos em português revistos por um falante nativo (PT e BR)
- [ ] Cupão de demonstração `TEST10` inexistente em produção (não usar `SEED_DEMO=true`)

## C. Validação externa

- [ ] Menções legais, política de privacidade, condições de venda e política de cookies validadas por um jurista (os textos fornecidos são modelos)
- [ ] Regras de retratação, cancelamento e reembolso definidas por mercado (CH, UE, BR)
- [ ] Regime de IVA/impostos por país de venda validado (incluindo serviços digitais na UE e no Brasil)
- [ ] Conformidade da faturação (numeração, menções obrigatórias) validada por contabilista
- [ ] Contratos de subcontratação de dados (alojamento, pagamentos, e-mail) e lista de subcontratantes completada
- [ ] Parâmetros do Pointage por país validados com um especialista em direito do trabalho

## D. Técnica

- [ ] Imagem Docker construída e arrancada num ambiente de *staging* (não foi possível construí-la no ambiente de desenvolvimento)
- [ ] Migrações aplicadas (`npx prisma migrate deploy`) e *seed* executado
- [ ] HTTPS ativo com redirecionamento de `www` (ver `deploy/Caddyfile`)
- [ ] Compra de teste completa em *staging* com o **modo de teste do Stripe** (cartão de teste, webhook real, reembolso)
- [ ] Subscrição de teste em *staging*: ativação, renovação simulada, falha de pagamento, cancelamento
- [ ] Envio real de e-mails verificado (confirmação de encomenda, recuperação de palavra-passe)
- [ ] `npm run test:all` verde no CI
- [ ] Cópias de segurança automáticas ativas, com cópia externa, e um restauro testado
- [ ] Monitorização de disponibilidade em `/api/health` e alertas configurados
- [ ] `ALLOW_INDEXING=true` apenas em produção; *staging* não indexável
- [ ] Search Console configurada e sitemap `https://athana.ch/sitemap.xml` submetido
- [ ] Redirecionamentos dos endereços antigos verificados (`/fr/projets`, `/fr/services/...`)
- [ ] DNS de athana.ch apontado para o novo servidor (ação manual, com autorização do proprietário)

## E. Depois da abertura

- [ ] Primeira encomenda real acompanhada de ponta a ponta
- [ ] Registo de e-mails e de auditoria verificados na primeira semana
- [ ] Testemunhos reais recolhidos e publicados
