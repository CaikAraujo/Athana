# Roadmap ATHANA

O que foi entregue nesta fase e o que falta fazer, por ordem de prioridade. O estado detalhado, com os resultados dos testes, está em `IMPLEMENTATION_STATUS.md`; a lista de verificação antes da abertura está em `PRODUCTION_CHECKLIST.md`.

## Índice

1. [Nota prévia: o CRM e o Pointage](#1-nota-prévia-o-crm-e-o-pointage)
2. [Entregue nesta fase](#2-entregue-nesta-fase)
3. [Limites conhecidos do que foi entregue](#3-limites-conhecidos-do-que-foi-entregue)
4. [Antes do lançamento](#4-antes-do-lançamento)
5. [Primeiros 90 dias](#5-primeiros-90-dias)
6. [Mais tarde](#6-mais-tarde)

---

## 1. Nota prévia: o CRM e o Pointage

O caderno de encargos pressupunha que já existiam um CRM e um sistema de Pointage a auditar e a melhorar. **Não existiam neste repositório**: continha apenas o site institucional antigo (uma aplicação de página única, sem base de dados, sem contas e sem área privada).

Consequências:

- o **ATHANA CRM** e o **ATHANA Pointage** foram **construídos de raiz**, como módulos da nova plataforma (`src/modules/crm`, `src/modules/pointage`, ecrãs em `/app/crm` e `/app/pointage`);
- nenhum dado foi migrado. Se existirem um CRM ou um Pointage noutro local (outro repositório, outro fornecedor), não foram analisados, e a eventual migração de dados é um trabalho por orçamentar;
- por serem novos, ainda não foram usados por clientes reais: os primeiros utilizadores vão encontrar necessidades que não foram previstas;
- o site antigo foi guardado sem alterações na pasta `legacy/`.

## 2. Entregue nesta fase

| # | Fase | O que existe |
|---|---|---|
| 1 | Auditoria e arquitetura | Auditoria do repositório (`PROJECT_AUDIT.md`), arquitetura Next.js / TypeScript / PostgreSQL com módulos de negócio separados (`src/modules/*`), convenções de desenvolvimento. |
| 2 | *Design system* e site institucional | Componentes de interface reutilizáveis; página inicial, páginas de serviços (sites, lojas online, software, automatização, desenvolvimento à medida), realizações, contacto, pedido de orçamento, blog e páginas legais. |
| 3 | Marketplace de modelos | Catálogo com 15 categorias, pesquisa e filtros; ficha de modelo com demonstração, galeria, três packs (Basic, Business, Premium), 9 opções, modelos associados e perguntas frequentes. |
| 4 | Demonstrações | 10 modelos navegáveis em `/demo/<slug>`: Atelier, Maison Lumière, Clinique Alba, Helvetia Immo, Studio Éclat, BatiPro, Alpina Voyages, Boutique Nord, Cabinet Méridien e Lena Moreau. As imagens do catálogo são capturas das próprias demonstrações. |
| 5 | Checkout e pagamentos | Carrinho, cupões, imposto configurável por mercado, checkout com dados de faturação, encomendas, faturas, cancelamento e reembolsos. Adaptador Stripe (página de pagamento alojada) e modo de teste sem movimento de dinheiro. Tratamento seguro das notificações do prestador (assinatura, repetição, verificação do montante). |
| 6 | Briefing e encomendas | Um projeto por modelo comprado; briefing com rascunho, envio, edição e confirmação final; envio de ficheiros verificados; consentimento para tratamento por IA; exportação do brief em JSON para a produção. |
| 7 | Área de cliente | Painel, projetos (etapas, mensagens, revisões, aprovação), encomendas, pagamentos, faturas, subscrições, empresas, notificações, suporte, histórico, exportação e pedido de eliminação de dados. |
| 8 | Administração | Painel com 7 funções e permissões verificadas no servidor: indicadores, tarefas, encomendas, projetos, clientes, leads, suporte, catálogo, cupões, planos, subscrições, finanças e exportações CSV, conteúdo, traduções, definições, pedidos RGPD e registo de auditoria. |
| 9 | ATHANA CRM | Novo. Contactos, empresas, leads, pipelines configuráveis, negócios, atividades, tarefas, calendário, propostas imprimíveis, anexos, pesquisa, relatórios, exportação CSV, equipa com papéis e limites por plano. Dados separados por empresa. |
| 10 | ATHANA Pointage | Novo. Três papéis (funcionário, responsável, administrador), registo de ponto com hora do servidor, pausas, horas extraordinárias, horários, departamentos, ausências e férias, calendário, relatórios, exportação CSV e PDF, correções rastreadas, auditoria, conservação de dados. |
| 11 | Subscrições SaaS | Teste gratuito, ativação paga, renovação, falha de pagamento, cancelamento no fim do período, retoma, aviso de renovação, preço por funcionário no Pointage, tarefa diária de manutenção. |
| 12 | Internacionalização | Quatro mercados — `/fr-ch` (CHF), `/fr-fr` (EUR), `/pt-pt` (EUR), `/pt-br` (BRL) — com endereços traduzidos, deteção da língua com prioridade à escolha manual, formatos de moeda e data, e traduções pt-PT e pt-BR de toda a interface. |
| 13 | SEO e marketing | Metadados, `hreflang`, sitemap, dados estruturados, redirecionamento dos endereços antigos; camada de eventos de medição sujeita a consentimento (GA4 / Tag Manager, Google Ads, Meta Pixel); 4 páginas de campanha; captura de UTM nos leads. |
| 14 | Automatizações | Tarefas, notificações e e-mails automáticos na compra, no briefing, nas mudanças de estado, na aprovação e nas subscrições; 19 modelos de e-mail em três línguas, editáveis no painel. |
| 15 | Segurança e testes | Palavras-passe com *hash*, sessões, limitação de tentativas, isolamento dos dados por empresa, validação de ficheiros, registo de auditoria, exportação e anonimização de dados pessoais; testes automáticos de serviços e de percursos completos (resultados em `IMPLEMENTATION_STATUS.md`). |
| 16 | Implantação e documentação | Dockerfile, docker-compose, configuração Caddy, scripts de cópia de segurança e restauro, `.env.example`, e a documentação desta pasta. |

## 3. Limites conhecidos do que foi entregue

Para evitar surpresas, eis o que **não** está feito ou não foi verificado em condições reais.

**Não verificado com serviços reais**

- O adaptador Stripe foi testado com eventos simulados, nunca contra a API do Stripe.
- A imagem Docker não foi construída nem arrancada (não havia Docker no ambiente de desenvolvimento).
- As etiquetas de medição (GA4, Google Ads, Meta) não foram verificadas com identificadores reais.
- O envio de e-mails por Resend não foi testado com uma conta real; sem configuração, os e-mails ficam apenas registados.

**Regras de negócio por decidir** (detalhe em `BUSINESS_CONFIGURATION.md`)

- Impostos a 0 % em todos os mercados; nenhum imposto nas subscrições.
- Preços em EUR, BRL, opções, lugares e limites dos planos são extrapolações.
- Os ciclos de revisão incluídos num pack são mostrados mas não impostos.

**Funcionalidades em falta**

- PayPal: não implementado. Os meios locais (TWINT, Multibanco, MB WAY, Pix) dependem do que a conta Stripe permitir.
- Faturas para os pagamentos de subscrições.
- Mudança de plano de uma subscrição paga; atualização no Stripe do número de funcionários do Pointage.
- Verificação do e-mail no registo e autenticação de dois fatores.
- Campos do briefing, páginas de campanha, planos, mercados e destaques da página de preços não são editáveis no painel.
- Pedido RGPD de eliminação: não cancela subscrições nem trata os dados de CRM / Pointage da empresa do cliente.
- Pointage: sem calendário de feriados, sem geolocalização nem biometria (estas duas por decisão).
- CRM: sem ligação a caixas de correio nem envio de e-mails.
- Armazenamento de ficheiros apenas em disco local.

**Qualidade linguística**

- As traduções portuguesas estão completas mas não foram revistas por falantes nativos.
- As mensagens internas para a equipa (tarefas, avisos) existem só em francês.

## 4. Antes do lançamento

Nenhum destes pontos pode ser fechado sem o proprietário. Ordem sugerida:

### 4.1 Credenciais e contas

| Ação | Quem | Resultado esperado |
|---|---|---|
| Escolher o alojamento (servidor com PostgreSQL e volume persistente para ficheiros) | Proprietário | Acessos entregues ao programador |
| Definir `DATABASE_URL`, `APP_URL`, `SESSION_SECRET`, `CRON_SECRET` | Programador | Aplicação arranca em *staging* |
| Criar e verificar a conta Stripe da entidade ATHANA; chaves e segredo do webhook | Proprietário | `PAYMENTS_MODE=stripe` |
| Criar a conta Resend e verificar o domínio de envio | Proprietário + programador | `EMAIL_PROVIDER=resend` |
| Definir `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, executar o *seed*, mudar a palavra-passe | Programador + proprietário | Primeiro super administrador |
| Programar a chamada diária a `/api/cron/daily` | Programador | Avisos de renovação, fim de testes e limpezas a funcionar |

### 4.2 Validação jurídica e fiscal

- Revisão das quatro páginas legais por um jurista, por país; remoção do aviso «modelo a validar».
- Definição das taxas de imposto por mercado e do tratamento fiscal das subscrições, com um consultor fiscal.
- Validação do formato das faturas por um contabilista.
- Regras escritas de retratação, cancelamento e reembolso.
- Validação dos parâmetros indicativos do Pointage por um especialista em direito do trabalho, pelo menos para os países onde vai ser vendido.

### 4.3 Validação Docker

Construir a imagem, arrancar com `docker-compose` num ambiente de *staging*, aplicar as migrações, executar o *seed*, testar a cópia de segurança **e o restauro**. Este passo nunca foi executado.

### 4.4 Percurso real em modo de teste do Stripe

Com chaves `sk_test_…` e o webhook configurado em *staging*, percorrer pelo menos:

1. compra de um modelo com cartão de teste → encomenda paga, fatura, e-mail, projeto em «briefing por preencher»;
2. pagamento recusado e pagamento abandonado → encomenda recuperável;
3. reembolso parcial e total a partir do painel;
4. teste gratuito → ativação de subscrição → renovação simulada → falha de pagamento → cancelamento no fim do período → retoma;
5. os mesmos percursos em CHF, EUR e BRL, e os meios de pagamento locais que a conta permitir.

Corrigir o que este percurso revelar antes de passar a chaves reais.

### 4.5 Configuração comercial

Fechar as «Decisões pendentes do proprietário» de `BUSINESS_CONFIGURATION.md`: preços por moeda, opções, prazos, planos, dados da empresa, mercados a abrir. Considerar abrir primeiro só os mercados cujos preços e fiscalidade estão validados.

### 4.6 Revisão dos conteúdos em português

Um falante nativo de português europeu e outro de português do Brasil devem reler: a interface (correções em Contenu → Traductions), as fichas dos 10 modelos, os packs e opções, as páginas dos programas, os e-mails, as páginas legais e o artigo de blog. Um exemplo já detetado: a etapa «Réalisation» do projeto está traduzida por «Trabalho realizado».

### 4.7 Testemunhos e provas sociais

O site antigo mostrava testemunhos inventados; não foram migrados e o painel exige a confirmação de autenticidade para publicar. Recolher 3 a 5 testemunhos reais, com acordo escrito, ou lançar sem a secção (fica escondida enquanto não houver nenhum). A página de realizações também só deve mostrar trabalhos reais.

### 4.8 Medição

Criar as propriedades GA4, Search Console e, se houver campanhas, as contas Google Ads e Meta; definir os identificadores; verificar que os eventos chegam (ver `MARKETING_PLAN_90_DAYS.md`). Ativar `ALLOW_INDEXING=true` apenas no domínio de produção.

## 5. Primeiros 90 dias

Depois da abertura, por ordem de valor para o negócio.

**Operação**

- Acompanhar as primeiras encomendas de ponta a ponta e ajustar prazos, textos dos e-mails e perguntas do briefing ao que os clientes realmente perguntam.
- Definir a rotina da equipa: quem trata as tarefas, os leads e os tickets, e em que prazo (as tarefas não têm responsável na plataforma).
- Notificar a equipa também quando um cliente responde num ticket (hoje só a criação notifica) e enviar e-mail ao cliente quando o suporte responde.

**Faturação das subscrições**

- Faturas (ou ligação às faturas do Stripe) para os pagamentos de subscrições.
- Imposto nas subscrições, conforme a decisão fiscal.
- Atualização da quantidade no Stripe quando o número de funcionários do Pointage muda.

**Segurança e conformidade**

- Verificação do e-mail no registo.
- Pedido de eliminação: cancelar automaticamente as subscrições e tratar os dados das empresas do cliente; campo de motivo na recusa.
- Atualização do Prisma para a versão que resolve os avisos de `npm audit`.

**Produto**

- Aplicar (ou faturar) os ciclos de revisão acima do incluído, conforme a regra decidida.
- Calcular a data de entrega a partir do prazo do pack e da confirmação do briefing, e tratar a opção «entrega expresso».
- Tornar editáveis no painel os destaques dos planos e as páginas de campanha.
- Traduzir os slugs das páginas de campanha em português (hoje `/pt-pt/ofertas/logiciel-crm`).
- Novos modelos nas categorias ainda vazias (educação, serviços, blog, reservas, negócios), em função da procura.
- Primeiras melhorias do CRM e do Pointage pedidas pelos primeiros clientes.

**Marketing**

- Execução do plano de 90 dias, se e quando o proprietário decidir investir.
- Um artigo de blog por língua e por tema prioritário.

## 6. Mais tarde

| Tema | O que é | Ponto de partida no código |
|---|---|---|
| Adaptador PayPal | Segundo prestador de pagamentos | A interface de prestador existe (`src/modules/payments/types.ts`); falta o adaptador e os testes. O painel mostra «Non implémenté». |
| Adaptador de armazenamento S3 | Ficheiros num serviço compatível com S3 em vez do disco do servidor | `StorageAdapter` em `src/modules/storage/service.ts` (três funções a implementar). Necessário para ter mais de um servidor. |
| Autenticação de dois fatores | Segundo fator, pelo menos para as contas internas | Por fazer. |
| Verificação de e-mail | Confirmar o endereço no registo | Por fazer (se não for feita nos primeiros 90 dias). |
| Versão em inglês | Quinto idioma | Preparado em `src/i18n/config.ts` (`PREPARED_LOCALES = ['en']`): falta acrescentar o mercado a `LOCALES`, fornecer `en.json` e definir moeda e preços. Blog e testemunhos já aceitam a língua `en`. |
| Mudança de plano com proporcionalidade | Subir ou descer de plano numa subscrição Stripe ativa | Bloqueado de propósito em `changePlan` (`src/modules/billing/service.ts`) até as regras serem decididas. |
| Plano anual | Faturação anual com desconto | Por fazer; hoje só mensal. |
| Sincronização de e-mail no CRM | Ligar caixas de correio e registar as trocas automaticamente | Por fazer; hoje as atividades são introduzidas à mão. |
| Calendário de feriados no Pointage | Feriados por país / região no cálculo do tempo previsto | Por fazer; hoje um feriado conta como dia de trabalho, salvo ausência registada. |
| Geolocalização / biometria no Pointage | Opções de registo de ponto | Excluídas por decisão; dependem da legislação local e de consentimento. |
| ATHANA POS, Stock, Booking, Projects | Futuros programas | Já existem como produtos «em preparação» no catálogo de software, sem planos nem funcionalidades. Cada um é um projeto próprio. |
| API pública | Acesso programático para clientes e integrações | Por fazer; hoje só existem rotas internas e exportações CSV / JSON. |
| Editor de campos do briefing | Briefing diferente por tipo de modelo, gerido no painel | A lista de campos é declarativa no código. |
| Criação de mercados pelo painel | Novo país sem programador | Os mercados vêm de `LOCALES`; moeda e imposto já são editáveis. |
| Migração de dados de um CRM / Pointage anterior | Importar dados existentes, se houver | A decidir (ver secção 1). |

Estas linhas não têm datas nem orçamentos: dependem das prioridades do proprietário e do que os primeiros clientes pedirem.
