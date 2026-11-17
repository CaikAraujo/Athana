# Configuração comercial ATHANA

Tudo o que o proprietário controla do ponto de vista comercial, os valores com que a plataforma arranca e onde se alteram.

**Princípio:** preços, impostos, prazos e limites estão na base de dados e alteram-se no painel de administração, sem programador. Os ficheiros `prisma/seed-data/*.ts` servem apenas para a primeira instalação: o *seed* nunca substitui um valor que já exista, por isso voltar a executá-lo não repõe os valores abaixo.

**Legenda da origem dos valores**

| Marca | Significado |
|---|---|
| **B** | Valor indicado no caderno de encargos do proprietário. |
| **E** | Extrapolação feita durante o desenvolvimento. **Tem de ser validada ou corrigida pelo proprietário antes do lançamento.** |

Os rótulos de menu são dados em francês (língua de origem da interface), com a tradução pt-PT entre parênteses.

## Índice

1. [Preços dos modelos de sites](#1-preços-dos-modelos-de-sites)
2. [Prazos, páginas e ciclos de revisão por pack](#2-prazos-páginas-e-ciclos-de-revisão-por-pack)
3. [Opções (add-ons)](#3-opções-add-ons)
4. [Planos de software](#4-planos-de-software)
5. [Limites dos planos e funcionalidades](#5-limites-dos-planos-e-funcionalidades)
6. [Impostos](#6-impostos)
7. [Moedas e meios de pagamento por mercado](#7-moedas-e-meios-de-pagamento-por-mercado)
8. [Cupões](#8-cupões)
9. [Dados da empresa e faturação](#9-dados-da-empresa-e-faturação)
10. [Modelos de e-mail](#10-modelos-de-e-mail)
11. [Páginas legais](#11-páginas-legais)
12. [Automatização da oferta de manutenção](#12-automatização-da-oferta-de-manutenção)
13. [Outros parâmetros com impacto comercial](#13-outros-parâmetros-com-impacto-comercial)
14. [Decisões pendentes do proprietário](#14-decisões-pendentes-do-proprietário)

---

## 1. Preços dos modelos de sites

**Onde alterar:** Admin → **Catalogue → Produits** (Catálogo → Produtos) → produto → secção **Packs et prix** (Packs e preços). O preço «a partir de» do catálogo altera-se na ficha do produto, campo **Prix « à partir de » affiché dans le catalogue**, e deve coincidir com o pack mais barato (não é atualizado automaticamente).

Os dez modelos semeados usam três tabelas de preços («famílias»).

### Como foram obtidos os valores em EUR e BRL

- **EUR = mesmo número que CHF** (390 CHF → 390 €). Não é uma conversão cambial: é um espelho. **E**
- **BRL = CHF × 6, arredondado à centena, menos 10** (390 CHF → 2 290 R$). É uma conversão comercial aproximada, sem relação com o câmbio do dia nem com o poder de compra local. **E**

### Família «Landing page»

Modelo: **Atelier**.

| Pack | CHF | EUR | BRL | Origem do valor CHF |
|---|---:|---:|---:|---|
| Basic | 390 | 390 | 2 290 | **B** — «landing 390» |
| Business | 790 | 790 | 4 690 | **E** — o caderno de encargos só dá um preço para landing page |
| Premium | 1 490 | 1 490 | 8 890 | **E** |

### Família «Site»

Modelos: **Maison Lumière** (restaurante), **Clinique Alba** (saúde), **Helvetia Immo** (imobiliário), **Studio Éclat** (beleza), **BatiPro** (construção), **Alpina Voyages** (turismo), **Cabinet Méridien** (corporativo), **Lena Moreau** (portfólio).

| Pack | CHF | EUR | BRL | Origem do valor CHF |
|---|---:|---:|---:|---|
| Basic | 790 | 790 | 4 690 | **B** — «vitrine 790» |
| Business | 1 490 | 1 490 | 8 890 | **B** — «business 1 490» |
| Premium | 2 490 | 2 490 | 14 890 | **B** — «premium 2 490» |

### Família «Loja online»

Modelo: **Boutique Nord**.

| Pack | CHF | EUR | BRL | Origem do valor CHF |
|---|---:|---:|---:|---|
| Basic | 1 990 | 1 990 | 11 890 | **B** — «e-commerce 1 990» |
| Business | 2 990 | 2 990 | 17 890 | **E** — nível superior não indicado no caderno de encargos |
| Premium | 4 490 | 4 490 | 26 890 | **E** |

Resumo: os cinco valores do proprietário (390, 790, 1 490, 2 490 e 1 990 CHF) estão aplicados tal como foram dados. São extrapolações: os packs Business e Premium da landing page (que reutilizam os números 790 e 1 490), os packs Business e Premium da loja online, **todos** os valores em EUR e **todos** os valores em BRL.

Notas:

- Deixar vazio o preço de uma moeda num pack retira esse pack da venda no mercado correspondente. Sem nenhum pack com preço numa moeda, o modelo não pode ser comprado nesse mercado.
- O pack pré-selecionado no configurador é o segundo (Business).
- Uma alteração de preço só afeta novas encomendas.

## 2. Prazos, páginas e ciclos de revisão por pack

**Onde alterar:** mesmo ecrã — campos **Délai (jours ouvrés)**, **Pages incluses** e **Cycles de révision** de cada pack; o prazo de base mostrado na ficha é o campo **Délai de livraison de base (jours ouvrés)** do produto.

Nenhum destes valores vem do caderno de encargos: são todos **E**.

| Família | Pack | Prazo (dias úteis) | Páginas incluídas | Ciclos de revisão |
|---|---|---:|---:|---:|
| Landing page | Basic | 5 | 1 | 1 |
| | Business | 8 | 3 | 2 |
| | Premium | 12 | 5 | 3 |
| Site | Basic | 8 | 5 | 1 |
| | Business | 14 | 10 | 2 |
| | Premium | 21 | 20 | 3 |
| Loja online | Basic | 15 | 8 | 1 |
| | Business | 21 | 12 | 2 |
| | Premium | 30 | 20 | 3 |

O que a plataforma faz com estes valores:

- **Prazo:** é mostrado ao cliente como estimativa («env. N jours ouvrés»). A data de entrega do projeto é calculada na confirmação do briefing (dias úteis do pack) e pode ser ajustada pelo gestor de projeto.
- **Páginas incluídas:** informativo, para o cliente e para a equipa.
- **Ciclos de revisão:** a plataforma **recusa** um novo pedido de revisão quando os ciclos incluídos no pack estão esgotados (os pedidos recusados pela equipa não contam) e remete o cliente para as mensagens do projeto. Falta decidir a regra comercial para os pedidos adicionais (faturar à parte ou tolerar).

Os textos dos três packs (descrição e lista do que incluem) também foram redigidos durante o desenvolvimento e são iguais para todos os modelos. **E**

## 3. Opções (add-ons)

**Onde alterar:** Admin → **Catalogue → Options** (Catálogo → Opções).

O caderno de encargos não dá preços para opções: **todos os valores abaixo são E**, nas três moedas (mesmas regras EUR e BRL da secção 1).

| Opção | CHF | EUR | BRL |
|---|---:|---:|---:|
| Página adicional | 120 | 120 | 690 |
| Idioma adicional | 290 | 290 | 1 690 |
| Pack SEO de lançamento | 350 | 350 | 2 090 |
| Redação dos textos | 390 | 390 | 2 290 |
| Criação de logótipo | 450 | 450 | 2 690 |
| Módulo de reservas | 490 | 490 | 2 890 |
| Módulo de blog | 290 | 290 | 1 690 |
| Entrega expresso | 300 | 300 | 1 790 |
| Manutenção 12 meses | 480 | 480 | 2 890 |

Notas:

- As nove opções são globais: são propostas em todos os modelos, incluindo combinações pouco naturais (por exemplo «Módulo de reservas» na landing page). Para restringir, desmarque **Proposée sur tous les produits** e associe a opção aos produtos certos em **Options spécifiques**.
- Cada opção é vendida uma vez por modelo, sem quantidade (não é possível encomendar três páginas adicionais de uma vez).
- «Entrega expresso» não altera automaticamente prazos nem prioridades: é uma promessa que a equipa tem de cumprir manualmente. Convém definir o que garante exatamente.
- «Manutenção 12 meses» é um pagamento único; não cria subscrição nem lembrete de renovação.
- O conteúdo exato de cada opção (quantas palavras, quantos conceitos de logótipo, que módulo de reservas) não está definido em lado nenhum além da descrição curta.

## 4. Planos de software

**Onde alterar:** Admin → **Finance → Logiciels & plans** (Finanças → Software e planos): **Prix mensuel**, **Places incluses**, **Prix par place supplémentaire**, **Jours d’essai**.

Regras de derivação usadas: **CHF = mesmo número que EUR** (**E**); BRL fixado à mão, cerca de 5 × o valor em euros, terminado em 9 (**E**).

### ATHANA CRM

| Plano | EUR / mês | CHF / mês | BRL / mês | Teste |
|---|---:|---:|---:|---:|
| Starter | 19 — **B** | 19 — **E** | 99 — **E** | 14 dias — **E** |
| Business | 49 — **B** | 49 — **E** | 249 — **E** | 14 dias — **E** |
| Pro | 99 — **B** | 99 — **E** | 499 — **E** | 14 dias — **E** |

O CRM não tem faturação por utilizador: o preço é fixo por plano e o número de utilizadores é um limite (secção 5).

### ATHANA Pointage

| Plano | EUR / mês | CHF / mês | BRL / mês | Funcionários incluídos | Funcionário adicional (EUR / CHF / BRL) | Teste |
|---|---:|---:|---:|---:|---|---:|
| Starter | 29 — **B** | 29 — **E** | 149 — **E** | 10 — **E** | 3,00 / 3,00 / 15,00 — **E** | 14 dias — **E** |
| Business | 59 — **B** | 59 — **E** | 299 — **E** | 30 — **E** | 2,50 / 2,50 / 12,00 — **E** | 14 dias — **E** |
| Pro | 119 — **B** | 119 — **E** | 599 — **E** | 75 — **E** | 2,00 / 2,00 / 10,00 — **E** | 14 dias — **E** |

Montante mensal do Pointage = preço do plano + (funcionários ativos − funcionários incluídos, se positivo) × preço por funcionário adicional.

O período de teste de 14 dias não está escrito no *seed*: é o valor por omissão da base de dados para qualquer plano. Altera-se por plano, entre 0 e 90 dias.

### ATHANA POS, Stock, Booking e Projects

Aparecem no site como «em preparação», sem planos nem preços. Não podem ser subscritos.

### A saber sobre a faturação das subscrições

- A faturação é **mensal** apenas; não existe plano anual.
- O teste não pede cartão. Sem ativação antes do fim do teste, a subscrição é encerrada pela tarefa diária.
- Alterar o preço de um plano aplica-se às novas subscrições. Uma subscrição Stripe já ativa continua a ser cobrada pelo montante fixado na ativação; da mesma forma, o número de funcionários do Pointage é contado no momento da ativação e uma variação posterior não é repercutida automaticamente no Stripe. **Antes de vender o Pointage com lugares adicionais, é preciso decidir como e quando se regulariza esta diferença.**
- A mudança de plano de uma subscrição paga está bloqueada para o cliente (passa pelo suporte), porque as regras de proporcionalidade (*proration*) não foram definidas.
- Os pagamentos de subscrições não geram fatura na plataforma.
- Os cupões não se aplicam às subscrições.

## 5. Limites dos planos e funcionalidades

**Onde alterar:** mesmo ecrã — **Limites (JSON)** e **Fonctionnalités activées (clés séparées par des virgules)**.

Nenhum limite nem repartição de funcionalidades vem do caderno de encargos: tudo **E**.

### ATHANA CRM

| Plano | `users` | `contacts` | `companies` | `storageMb` | Funcionalidades |
|---|---:|---:|---:|---:|---|
| Starter | 2 | 500 | 200 | 500 | `pipeline`, `tasks` |
| Business | 10 | 5 000 | 2 000 | 5 000 | + `multiPipelines`, `proposals`, `export` |
| Pro | ilimitado | ilimitado | ilimitado | 20 000 | + `reports` |

### ATHANA Pointage

| Plano | `employees` (máximo) | Incluídos no preço | Funcionalidades |
|---|---:|---:|---|
| Starter | 15 | 10 | `clock`, `absences` |
| Business | 60 | 30 | + `departments`, `export`, `reports` |
| Pro | ilimitado | 75 | + `audit` |

Leitura: no Starter, a empresa pode ter até 15 funcionários ativos; os 10 primeiros estão incluídos e os 5 seguintes são faturados à unidade. Acima de 15 tem de mudar de plano.

### Significado das chaves

| Chave | Efeito |
|---|---|
| `users`, `contacts`, `companies`, `storageMb`, `employees` | Limite numérico; uma chave ausente no JSON significa ilimitado. Ao atingir o limite, a criação é recusada com uma mensagem que propõe ver os planos. |
| `multiPipelines` | Criar mais do que um pipeline no CRM. |
| `proposals` | Propostas comerciais. |
| `export` | Exportações CSV (CRM) e CSV / PDF (Pointage). |
| `reports` | Relatórios avançados (CRM) e relatórios de equipa (Pointage). |
| `departments` | Departamentos e responsáveis. |
| `audit` | Consulta do registo de auditoria completo do Pointage. |
| `pipeline`, `tasks`, `clock`, `absences` | Funcionalidades de base, presentes em todos os planos. |

**Atenção:** a página pública de preços mostra uma lista de destaques por plano («2 utilisateurs», «500 contacts», «10 employés inclus», «Support prioritaire»…). Esses textos vêm do *seed* e **não são editáveis no painel**. Se alterar um limite, o destaque fica errado até ser corrigido na base de dados por um programador. O mesmo se aplica à promessa «Support prioritaire» do CRM Pro: é um texto comercial, sem nenhum mecanismo na plataforma.

## 6. Impostos

**Todos os mercados foram semeados com imposto a 0 %.** É um valor de arranque, não uma recomendação: o proprietário tem de definir o IVA (ou equivalente) de cada mercado depois de obter aconselhamento fiscal.

**Onde alterar:** Admin → **Paramètres** (Definições) → botão **Marchés, devises et taxes** (Mercados, moedas e impostos) → cartão do mercado.

| Mercado | Taxa semeada | Rótulo semeado | Preços incluem imposto? |
|---|---:|---|---|
| `/fr-ch` (Suíça) | 0 % | TVA | Não |
| `/fr-fr` (França) | 0 % | TVA | Não |
| `/pt-pt` (Portugal) | 0 % | IVA | Não |
| `/pt-br` (Brasil) | 0 % | Impostos | Não |

Campos por mercado: **Taux de taxe (%)** (0 a 40), **Libellé de la taxe** e **Les prix du catalogue incluent la taxe** (marcado: o imposto é extraído do preço; desmarcado: é somado no checkout).

Como a plataforma aplica o imposto:

- Há **uma taxa única por mercado**, aplicada ao total da encomenda depois do desconto. A taxa depende do endereço do site em que o cliente compra (`/fr-ch`, `/pt-pt`…), **não** do país de faturação que ele indica.
- O número de IVA do cliente é guardado e impresso na fatura, mas **não é validado nem altera o imposto** (não há autoliquidação / *reverse charge* automática para clientes empresariais de outro país).
- A taxa em vigor fica gravada em cada encomenda e em cada fatura; mudá-la depois não altera documentos anteriores.
- Nas **subscrições de software**, a taxa do mercado **não é aplicada**: o montante cobrado é o preço do plano, e a página de preços diz «Prix hors taxes éventuelles, affichées avant le paiement». O tratamento fiscal das subscrições tem de ser decidido e implementado (por exemplo com as funções fiscais do Stripe) antes de as vender a sério.
- Enquanto algum mercado estiver a 0 %, o ecrã dos mercados mostra um aviso.

Perguntas a levar ao consultor fiscal: sujeição a IVA na Suíça e limiar aplicável; regime de venda de serviços digitais a consumidores e a empresas na UE (França, Portugal); obrigações no Brasil; menções obrigatórias nas faturas de cada país.

## 7. Moedas e meios de pagamento por mercado

**Onde alterar:** o mesmo ecrã dos mercados.

| Mercado | Língua | Moeda semeada | Fuso horário | Aberto à venda | Meios de pagamento mostrados |
|---|---|---|---|---|---|
| `/fr-ch` | francês (Suíça) | CHF | Europe/Zurich | Sim | *(lista vazia)* |
| `/fr-fr` | francês (França) | EUR | Europe/Paris | Sim | *(lista vazia)* |
| `/pt-pt` | português (Portugal) | EUR | Europe/Lisbon | Sim | *(lista vazia)* |
| `/pt-br` | português (Brasil) | BRL | America/Sao_Paulo | Sim | *(lista vazia)* |

- **Devise** (moeda): pode ser alterada, mas todos os packs, opções e planos precisam de preço na nova moeda, senão deixam de poder ser vendidos nesse mercado.
- **Marché ouvert à la vente**: desmarcado, o checkout desse mercado recusa encomendas. Útil para lançar um país de cada vez — por exemplo, manter o Brasil fechado até os preços em BRL e a fiscalidade estarem validados. (Não bloqueia os testes gratuitos de software.)
- **Moyens de paiement affichés**: lista **informativa** mostrada no checkout, separada por vírgulas (por exemplo «Carte, TWINT»). Está vazia à partida. A ativação real de cada meio faz-se no painel do prestador de pagamentos (Stripe), consoante a elegibilidade da conta; a plataforma mostra na página de pagamento os meios que o Stripe disponibilizar.
- O único prestador implementado é o **Stripe**. Enquanto as chaves não estiverem configuradas, a plataforma funciona em «modo de teste», com uma página de pagamento simulada e nenhum movimento de dinheiro. **PayPal não está implementado.**
- Não é possível criar um quinto mercado pelo painel; o inglês está preparado no código mas não ativado.
- Não há conversão de moeda: os indicadores financeiros são apresentados por moeda.

## 8. Cupões

**Onde alterar:** Admin → **Finance → Coupons** (Finanças → Cupões). Detalhe dos campos em `ADMIN_GUIDE.md`, secção 11.

- Nenhum cupão é criado na instalação normal. Com `SEED_DEMO=true` é criado `TEST10` (10 %), só para testes: não deve existir em produção.
- Tipos: percentagem (1–100) ou montante fixo numa moeda. Um montante fixo só vale nessa moeda: para uma campanha em três moedas são precisos três códigos.
- Condições possíveis: datas de início e fim, número máximo de utilizações (total, não por cliente), subtotal mínimo.
- O desconto incide sobre modelos e opções, antes do imposto. Não se aplica a subscrições.
- O campo **Campagne** serve para ligar o código a uma ação de marketing; a coluna **Utilisations** conta apenas encomendas pagas.
- Um mesmo cliente pode reutilizar um código, e os códigos não se restringem a um produto ou mercado (exceto pela moeda, nos de montante fixo). Tenha isso em conta ao definir a percentagem.

## 9. Dados da empresa e faturação

**Onde alterar:** Admin → **Paramètres** (Definições) → cartões **Entreprise** e **Facturation**.

| Campo | Valor semeado | Estado |
|---|---|---|
| Denominação social | ATHANA | A confirmar (forma jurídica exata) |
| Morada | Route de Challex 6, 1283 La Plaine, CH | Retirada das menções legais do site antigo |
| E-mail | contact@athana.ch | — |
| Telefone | +41 78 339 98 95 | — |
| LinkedIn / WhatsApp | linkedin.com/company/athana-geneve / 41783399895 | — |
| Número de IVA | *(vazio)* | **A preencher** |
| Número de empresa (IDE) | *(vazio)* | **A preencher** |
| IBAN | *(vazio)* | **A preencher**, se for mostrado nas faturas |
| Prefixo das faturas | `ATH` (faturas `ATH-F-AAAA-NNNNN`) | A confirmar com o contabilista |
| Menção em rodapé de fatura | *(vazio)* | A definir |

Estes dados aparecem nas faturas, nas páginas legais e nos contactos do site. Cada fatura guarda uma cópia dos dados no momento da emissão: preencha-os **antes** da primeira venda real.

Numeração: encomendas `ATH-AAAA-NNNNN`, projetos `PRJ-AAAA-NNNNN`, faturas `<prefixo>-F-AAAA-NNNNN`. As sequências são contínuas e não recomeçam no início do ano. A conformidade da fatura com as regras de cada país deve ser validada por um contabilista.

O endereço que recebe os avisos internos (novas encomendas, briefings, leads) é a variável de ambiente `CONTACT_EMAIL`, e o remetente dos e-mails é `EMAIL_FROM`: não se alteram no painel.

## 10. Modelos de e-mail

**Onde alterar:** Admin → **Paramètres** → **Modèles d’e-mails** (Modelos de e-mail). Um modelo por acontecimento e por língua (`fr`, `pt-PT`, `pt-BR`); edita-se o assunto e o corpo, em texto simples com variáveis `{{…}}`.

| Chave | Enviado quando | Destinatário |
|---|---|---|
| `welcome` | Criação de conta | Cliente |
| `password_reset` | Pedido de nova palavra-passe | Cliente |
| `invitation` | Convite para uma empresa (CRM, Pointage) ou para a equipa ATHANA | Convidado |
| `added_to_organization` | Conta existente adicionada a uma empresa | Convidado |
| `order_confirmation` | Encomenda paga | Cliente |
| `payment_failed` | Pagamento de encomenda falhado | Cliente |
| `refund` | Reembolso | Cliente |
| `briefing_received` | Briefing enviado | Cliente |
| `project_status` | Mudança de estado do projeto | Cliente |
| `new_message` | Mensagem da equipa no projeto | Cliente |
| `subscription_activated` | Subscrição paga ativada | Proprietários da empresa |
| `subscription_renewal_notice` | 7 dias antes da renovação | Proprietários da empresa |
| `subscription_payment_failed` | Pagamento de subscrição falhado | Proprietários da empresa |
| `subscription_cancel_scheduled` | Cancelamento agendado | Proprietários da empresa |
| `subscription_canceled` | Subscrição encerrada | Proprietários da empresa |
| `lead_ack` | Formulário de contacto, orçamento ou campanha | Visitante |
| `admin_new_order`, `admin_briefing_submitted`, `admin_new_lead` | Avisos internos (sempre em francês) | `CONTACT_EMAIL` |

Os textos foram redigidos durante o desenvolvimento: releia-os nas três línguas, sobretudo os que fazem promessas (prazos, passos seguintes). Enquanto `EMAIL_PROVIDER` não for `resend`, **nenhum e-mail é realmente enviado** — ficam apenas registados e visíveis em «Derniers envois».

## 11. Páginas legais

**Onde alterar:** Admin → **Contenu → Pages légales** (Conteúdo → Páginas legais).

| Chave | Título (fr / pt-PT) | Endereço |
|---|---|---|
| `mentions-legales` | Mentions légales / Informações legais | `/<locale>/legal/mentions-legales` |
| `confidentialite` | Politique de confidentialité / Política de privacidade | `/<locale>/legal/confidentialite` |
| `cgv` | Conditions générales de vente / Condições gerais de venda | `/<locale>/legal/cgv` |
| `cookies` | Politique relative aux cookies / Política de cookies | `/<locale>/legal/cookies` |

Cada página existe em francês, pt-PT e pt-BR; a versão francesa serve os dois mercados francófonos, e a mesma versão portuguesa de Portugal não é reutilizada no Brasil (há um texto pt-BR próprio).

Os textos são **modelos** e abrem com um aviso «Modelo a validar». Antes do lançamento:

1. um jurista revê e adapta cada página a cada país (direito de retratação, reembolsos, lei aplicável, proteção de dados — nLPD na Suíça, RGPD na UE, LGPD no Brasil);
2. as regras comerciais descritas neste documento (revisões, prazos, cancelamento de subscrições, reembolsos) são alinhadas com o texto das condições de venda;
3. o aviso «Modelo a validar» é removido de cada página;
4. se a política de privacidade mudar de forma relevante, altere **Version de la politique** em Paramètres → **Confidentialité et rétention**, para voltar a pedir o consentimento de cookies aos visitantes.

O cliente aceita as condições gerais de venda em cada encomenda e as condições e a política de privacidade no registo.

## 12. Automatização da oferta de manutenção

**Onde alterar:** Admin → **Paramètres** → cartão **Automatisations** (Automatizações) → caixa «Créer une tâche “proposer la maintenance” quand un projet est approuvé». Ligada por omissão.

Quando um projeto é aprovado (pelo cliente ou pela equipa), a plataforma cria na lista de tarefas a entrada «Proposer un contrat de maintenance pour PRJ-…», com prazo de 7 dias.

Limites desta automatização:

- cria **apenas uma tarefa interna**: nenhum e-mail ou proposta é enviado ao cliente;
- é criada mesmo que o cliente já tenha comprado a opção «Manutenção 12 meses»;
- não existe um produto «contrato de manutenção» recorrente: a oferta, o preço e a cobrança têm de ser definidos pelo proprietário e tratados por fora (ou com a opção de pagamento único).

## 13. Outros parâmetros com impacto comercial

| Parâmetro | Valor de arranque | Onde alterar |
|---|---|---|
| Tamanho máximo dos ficheiros dos clientes | 15 MB | Paramètres → **Fichiers** |
| Formatos aceites | PNG, JPEG, WebP, SVG, PDF, TXT, DOCX, XLSX, ZIP | Paramètres → **Fichiers** (só estes nove são aceites pelo servidor) |
| Conservação dos leads | 24 meses | Paramètres → **Confidentialité et rétention** |
| Duração da sessão | 30 dias | Paramètres → **Sécurité** |
| Palavra-passe mínima | 10 caracteres | Paramètres → **Sécurité** |
| Banner promocional no topo do site | Nenhum | Contenu → **Bannières** |
| Perguntas frequentes da página inicial | 5 perguntas semeadas | Contenu → **FAQ** |
| Testemunhos | Nenhum (a secção fica escondida) | Contenu → **Témoignages** — apenas reais |
| Modelos em destaque na página inicial | Atelier, Maison Lumière, Helvetia Immo, Boutique Nord | Ficha do produto → **Mettre en avant sur la page d’accueil** |
| Páginas de campanha (`/offres/…`, `/ofertas/…`) | 4 páginas | No código (`src/modules/content/campaigns.ts`) — não editáveis no painel |
| Textos das páginas institucionais e dos planos | — | No código; correções pontuais em Contenu → **Traductions** |

As perguntas frequentes semeadas fazem afirmações comerciais que devem corresponder à realidade: o prazo como estimativa em dias úteis a partir de um briefing completo; domínio e alojamento **não incluídos** no preço; meios de pagamento dependentes do país; teste gratuito e cancelamento na área de cliente.

## 14. Decisões pendentes do proprietário

| # | Decisão | Situação atual | Onde aplicar |
|---|---|---|---|
| 1 | Taxa de IVA / imposto de cada mercado e se os preços a incluem | 0 % nos quatro mercados | Paramètres → Marchés |
| 2 | Tratamento fiscal das subscrições de software | Nenhum imposto aplicado | Decisão + desenvolvimento |
| 3 | Tratamento de clientes empresariais com IVA de outro país | Não implementado | Decisão + desenvolvimento |
| 4 | Preços em EUR dos modelos | Espelho dos valores em CHF | Catalogue → Produits → packs |
| 5 | Preços em BRL de modelos e opções | CHF × 6, arredondado | Idem, e Catalogue → Options |
| 6 | Packs Business e Premium da landing page | 790 / 1 490 CHF | Produto «Atelier» |
| 7 | Packs Business e Premium da loja online | 2 990 / 4 490 CHF | Produto «Boutique Nord» |
| 8 | Preço e conteúdo exato de cada uma das nove opções | Valores extrapolados | Catalogue → Options |
| 9 | Que opções propor em que modelos | Todas em todos | Catalogue → Options e ficha do produto |
| 10 | Prazos, páginas e ciclos de revisão de cada pack | Valores extrapolados | Packs |
| 11 | Regra para revisões acima dos ciclos incluídos | Sem bloqueio | Condições de venda + prática da equipa |
| 12 | O que garante a «Entrega expresso» | Não definido | Descrição da opção + condições |
| 13 | Preços em CHF dos planos CRM e Pointage | Espelho dos valores em EUR | Logiciels & plans |
| 14 | Preços em BRL dos planos | 99/249/499 e 149/299/599 | Logiciels & plans |
| 15 | Funcionários incluídos e preço por funcionário adicional (Pointage) | 10/30/75; 3,00/2,50/2,00 € | Logiciels & plans |
| 16 | Como regularizar a variação do número de funcionários numa subscrição ativa | Não automatizado | Decisão + desenvolvimento |
| 17 | Limites e funcionalidades de cada plano | Valores extrapolados | Logiciels & plans (os destaques da página de preços exigem um programador) |
| 18 | Duração do teste gratuito | 14 dias | Logiciels & plans |
| 19 | Regras de mudança de plano e de proporcionalidade | Bloqueado para subscrições pagas | Decisão + desenvolvimento |
| 20 | Faturas para as subscrições | Não geradas | Decisão + desenvolvimento, ou faturas do Stripe |
| 21 | Mercados a abrir no lançamento | Os quatro abertos | Paramètres → Marchés |
| 22 | Meios de pagamento por país | Lista vazia; nada ativado no Stripe | Stripe + Paramètres → Marchés |
| 23 | PayPal | Não implementado | Ver `ROADMAP.md` |
| 24 | Número de IVA, número de empresa, IBAN, forma jurídica | Vazios | Paramètres → Entreprise |
| 25 | Prefixo e menções das faturas | `ATH`, sem menção | Paramètres → Facturation |
| 26 | Validação jurídica das quatro páginas legais, por país | Modelos com aviso | Contenu → Pages légales |
| 27 | Política de reembolso e de retratação | Reembolso manual, sem regra escrita | Condições de venda |
| 28 | Revisão dos 19 modelos de e-mail nas três línguas | Textos de desenvolvimento | Paramètres → Modèles d’e-mails |
| 29 | Oferta de manutenção: conteúdo, preço, recorrência | Tarefa interna + opção de 480 CHF | Decisão; Paramètres → Automatisations |
| 30 | Domínio e alojamento dos sites dos clientes: quem fornece e a que preço | «Não incluídos» | Decisão + FAQ |
| 31 | Significado concreto de «suporte prioritário» (pack Premium, CRM Pro) | Apenas texto | Decisão |
| 32 | Parâmetros indicativos do Pointage por país | Valores de partida, não validados | Validação por especialista em direito do trabalho |
| 33 | Conservação dos leads | 24 meses | Paramètres → Confidentialité |
| 34 | Primeiros cupões e campanhas | Nenhum | Finance → Coupons |
| 35 | Testemunhos de clientes reais, com acordo escrito | Nenhum | Contenu → Témoignages |
| 36 | Revisão dos textos em português por falantes nativos (PT e BR) | Por fazer | Contenu → Traductions e catálogo |
