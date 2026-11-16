# Estado da implementação

Última atualização: 17 de novembro de 2026 · Ramo `claude/athana-platform`.

Legenda: ✅ implementado e testado · 🟡 implementado, verificação parcial ou dependente de credenciais · ⬜ não implementado.

## 1. Funcionalidades concluídas

| Fase | Funcionalidade | Estado | Como foi verificado |
|---|---|---|---|
| 1 | Auditoria, arquitetura, documentação inicial | ✅ | `docs/PROJECT_AUDIT.md`, `docs/ARCHITECTURE.md` |
| 2 | *Design system* (tokens, botões, formulários, cartões, tabelas, modais, estados de carregamento/erro/vazio) | ✅ | `src/app/globals.css`, `src/components/ui`; capturas de ecrã em computador e telemóvel |
| 2 | Site institucional: início com as 4 entradas, serviços, software, realizações, contacto, orçamento, blogue, páginas legais | ✅ | E2E (páginas públicas, navegação), revisão visual |
| 3 | Catálogo: 15 categorias, pesquisa, filtros, página de produto, packs Basic/Business/Premium, opções, produtos relacionados, FAQ | ✅ | E2E do cenário de compra; testes de preços |
| 4 | 10 demonstrações navegáveis de modelos (4–5 páginas cada, com interações) e imagens do catálogo capturadas das próprias demonstrações | ✅ | E2E (10 demos sem transbordo em computador e telemóvel) |
| 5 | Carrinho, cupões, impostos configuráveis, moedas por mercado, checkout, encomendas, pagamentos, faturas, cancelamento, reembolsos | ✅ | `tests/platform.test.ts`, E2E |
| 5 | Pipeline de webhooks: verificação de assinatura, idempotência, verificação do montante | ✅ | Testes de webhooks forjados, expirados, alterados e repetidos |
| 5 | Modo de teste de pagamentos (sem movimento de dinheiro) | ✅ | E2E; recusado em produção salvo `ALLOW_TEST_PAYMENTS` |
| 5 | Adaptador Stripe (Checkout alojado, pagamento único e subscrição, reembolso, mapeamento de eventos) | 🟡 | Testes unitários com eventos assinados sintéticos; **não testado contra a API do Stripe** |
| 6 | Briefing: rascunho, envio, edição, confirmação final, ficheiros, consentimento de IA, exportação JSON | ✅ | Testes de serviço + E2E |
| 7 | Área de cliente: painel, dados, empresas, encomendas, pagamentos, faturas, projetos, mensagens, revisões, aprovação, notificações, suporte, subscrições, histórico, exportação e pedido de eliminação de dados | ✅ | E2E + percurso de todas as páginas |
| 8 | Painel administrativo com RBAC no servidor (7 funções): painel, tarefas, encomendas, projetos, clientes, leads, suporte, produtos, categorias, opções, cupões, planos, subscrições, finanças e exportações CSV, conteúdo, traduções, definições, mercados, modelos de e-mail, equipa, pedidos RGPD, auditoria | ✅ | Testes de permissões; E2E (administrador gere a encomenda; cliente não entra no painel); percurso de páginas |
| 9 | ATHANA CRM (multi-empresa): contactos, empresas, leads, pipelines configuráveis, negócios, atividades, tarefas, calendário, propostas, anexos, pesquisa, relatórios, exportação, equipa, limites por plano, *onboarding* | ✅ | `tests/crm.test.ts` (22 testes, isolamento entre duas empresas); páginas percorridas no navegador |
| 10 | ATHANA Pointage (multi-empresa): 3 perfis, registo de ponto com hora do servidor, controlo de duplicados, pausas, horas extraordinárias, ausências, férias, calendário, relatórios, CSV e PDF, auditoria, fusos horários, retenção | ✅ | `tests/pointage.test.ts` (31 testes); páginas percorridas no navegador |
| 11 | Subscrições SaaS: período de teste, ativação, renovação, falha de pagamento, cancelamento no fim do período, reativação, avisos de renovação, preço por lugar | ✅ | Testes de serviço + E2E (teste gratuito → ativação → cancelamento) |
| 12 | 4 mercados (`/fr-ch`, `/fr-fr`, `/pt-pt`, `/pt-br`), 1 806 textos traduzidos para pt-PT e pt-BR, endereços localizados, deteção com escolha manual prioritária, moedas, datas, fusos | ✅ | `npm run i18n:check`; E2E de línguas |
| 13 | SEO: metadados, canónicas, `hreflang`, sitemap, robots, Open Graph, dados estruturados (Organization, Product, Service, SoftwareApplication, FAQ, Breadcrumb, BlogPosting), blogue, redirecionamentos dos endereços antigos | ✅ | E2E de SEO |
| 13 | Marketing: camada de eventos independente do fornecedor, GA4 / GTM / Google Ads / Meta Pixel sujeitos a consentimento, páginas de campanha, captura UTM, leads | 🟡 | Banner de consentimento e eventos testados; **etiquetas não verificadas com identificadores reais** |
| 14 | Automações: compra, briefing, mudança de estado, aprovação, renovação; modelos de e-mail em 3 línguas | ✅ | Testes (tarefas, notificações e e-mails registados) |
| 15 | Segurança: *hash* scrypt, sessões, RBAC, isolamento multi-empresa, limitação de pedidos, validação de ficheiros, CSP, auditoria, RGPD | ✅ | Testes + `docs/SECURITY.md` |
| 16 | Docker, docker-compose, Caddy, cópias de segurança, CI, `.env.example`, documentação | 🟡 | **Imagem Docker e CI não executados** (sem Docker no ambiente; CI ainda não correu no GitHub) |

## 2. Em desenvolvimento

Nada em curso.

## 3. Pendente ou parcial

| Tema | Situação |
|---|---|
| PayPal | ⬜ Não implementado (existe a interface de fornecedor de pagamentos) |
| TWINT, Multibanco, MB WAY, Pix | 🟡 Passam pelo Stripe Checkout sem código próprio; dependem da elegibilidade da conta Stripe — por verificar |
| Faturas de subscrições | ⬜ As renovações criam pagamentos, mas não documentos de fatura (as faturas existem para encomendas) |
| Mudança de plano com subscrição Stripe ativa | ⬜ Bloqueada de propósito (regras de proporcionalidade a validar); funciona em período de teste |
| Sincronização de lugares do Pointage com o Stripe | ⬜ O número de lugares é atualizado na plataforma; a quantidade no Stripe não é alterada automaticamente |
| Campos do briefing | 🟡 Definidos numa lista declarativa no código; não editáveis no painel |
| Novos mercados ou línguas | 🟡 Moeda e impostos editáveis no painel; criar um mercado novo exige alteração de configuração no código. Inglês preparado, sem traduções |
| Armazenamento de ficheiros | 🟡 Disco local com interface de adaptador; adaptador S3 por escrever |
| Geolocalização e biometria no Pointage | ⬜ Não implementadas, por decisão (dependem da legislação local) |
| Verificação de e-mail no registo, autenticação de dois fatores | ⬜ |
| Notificações internas do Pointage e mensagens para a equipa ATHANA | 🟡 Guardadas em francês |
| Traduções portuguesas | 🟡 Completas, mas sem revisão por falante nativo |
| CRM e Pointage "existentes" | ⬜ Não existiam no repositório; nenhum dado foi migrado |

## 4. Testes executados

| Conjunto | Resultado |
|---|---|
| `npm run typecheck` | Sem erros |
| `npm run i18n:check` | 1 806 / 1 806 textos em pt-PT e pt-BR, sem divergências de variáveis |
| `npm test` (Vitest, base de dados real) | 77 testes em 3 ficheiros, todos a passar |
| `npm run test:e2e` (Playwright, *build* de produção) | 13 testes + 1 de preparação, todos a passar (computador e telemóvel) |
| `npm run build` | Compila; 343 páginas estáticas geradas |

Detalhes em `docs/TESTING.md`.

## 5. Problemas encontrados

- O repositório não continha CRM nem Pointage (ver `docs/PROJECT_AUDIT.md`).
- O site antigo mostrava testemunhos inventados: não foram migrados.
- O contentor de desenvolvimento reiniciou a meio do trabalho; nada se perdeu.
- A versão do Playwright foi fixada em 1.63.0 para corresponder ao navegador pré-instalado no ambiente de desenvolvimento; no CI é instalada a versão correspondente.
- `npm audit` assinala 3 avisos de gravidade alta numa dependência (`deepmerge-ts`) da ferramenta de linha de comandos do Prisma 6, usada apenas em migrações e compilação, não no tratamento de pedidos. A correção exige a passagem para o Prisma 7 (alteração com impacto), deixada para depois do lançamento.
- Um teste E2E falhou uma vez logo após o arranque a frio do servidor e passou em cinco repetições seguidas; foi configurada uma nova tentativa automática.

## 6. Credenciais necessárias

`DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` e, se usados, os identificadores GA4 / GTM / Google Ads / Meta. Ver `docs/ENVIRONMENT.md`.

## 7. Configurações manuais necessárias

Ver `docs/PRODUCTION_CHECKLIST.md` e `docs/BUSINESS_CONFIGURATION.md`. As mais importantes: taxas de imposto por mercado (todas a 0 %), revisão dos preços, validação jurídica dos textos legais, DNS e alojamento.
