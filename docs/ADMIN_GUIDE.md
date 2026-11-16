# Guia de administração ATHANA

Guia para a equipa ATHANA que trabalha no painel `/<locale>/admin` (por exemplo `https://athana.ch/fr-ch/admin` ou `/pt-pt/admin`).

A interface foi escrita em francês e traduzida para português. Neste guia, cada menu ou botão aparece com o rótulo francês e, entre parênteses, a tradução pt-PT usada em `/pt-pt` e `/pt-br`. O conteúdo do painel é o mesmo em todos os mercados: muda apenas a língua da interface.

## Índice

1. [Primeiro acesso](#1-primeiro-acesso)
2. [Funções e permissões](#2-funções-e-permissões)
3. [Painel de controlo](#3-painel-de-controlo)
4. [Tarefas](#4-tarefas)
5. [Encomendas](#5-encomendas)
6. [Projetos](#6-projetos)
7. [Clientes](#7-clientes)
8. [Leads](#8-leads)
9. [Suporte](#9-suporte)
10. [Catálogo](#10-catálogo)
11. [Cupões](#11-cupões)
12. [Software, planos e subscrições](#12-software-planos-e-subscrições)
13. [Finanças e exportações](#13-finanças-e-exportações)
14. [Conteúdo](#14-conteúdo)
15. [Definições](#15-definições)
16. [Pedidos RGPD](#16-pedidos-rgpd)
17. [Registo de auditoria](#17-registo-de-auditoria)
18. [Procedimento: adicionar um novo modelo de site](#18-procedimento-adicionar-um-novo-modelo-de-site)
19. [Procedimento: transformar uma encomenda num projeto de desenvolvimento com apoio de IA](#19-procedimento-transformar-uma-encomenda-num-projeto-de-desenvolvimento-com-apoio-de-ia)

---

## 1. Primeiro acesso

A primeira conta de super administrador é criada pelo *seed* da base de dados (`npm run db:seed`), a partir de duas variáveis de ambiente:

| Variável | Regra |
|---|---|
| `SEED_ADMIN_EMAIL` | Endereço de e-mail da conta. |
| `SEED_ADMIN_PASSWORD` | Mínimo de 12 caracteres; com menos, o *seed* falha. |

Comportamento do *seed*:

- Com as duas variáveis definidas, cria a conta com a função `SUPER_ADMIN`. Se já existir uma conta com esse e-mail, promove-a a `SUPER_ADMIN` **sem alterar a palavra-passe**.
- Sem as variáveis e fora de produção, cria `admin@athana.local` com uma palavra-passe aleatória mostrada **uma única vez** na consola.
- Sem as variáveis e em produção, não cria nenhuma conta e avisa na consola.

Para entrar:

1. Abra `/<locale>/connexion` (em português: `/pt-pt/entrar`) e inicie sessão com **Se connecter** (Iniciar sessão). As contas internas são encaminhadas para `/admin`.
2. Altere a palavra-passe logo a seguir: o painel não tem página de perfil própria, por isso vá a `/<locale>/compte/profile` (em pt: `/pt-pt/conta/profile`), cartão **Mot de passe** (Palavra-passe), botão **Modifier le mot de passe** (Alterar a palavra-passe).
3. Retire `SEED_ADMIN_PASSWORD` do ambiente depois do primeiro acesso.

O sino de notificações no topo do painel abre a página de notificações da área de cliente (`/account/notifications`); é aí que chegam os avisos de novas encomendas, briefings, mensagens, leads e tickets.

Não existe autenticação de dois fatores nem verificação de e-mail nesta fase (ver `ROADMAP.md`).

## 2. Funções e permissões

Existem sete funções internas (`src/modules/auth/rbac.ts`). O menu só mostra o que a função permite, e cada página e cada ação voltam a verificar a permissão no servidor. Quem abre uma página sem permissão é reenviado para o painel com a mensagem «Vous n’avez pas la permission d’accéder à cette page.»

| Permissão | SUPER_ADMIN | ADMIN | PROJECT_MANAGER | DEVELOPER | SUPPORT | FINANCE | MARKETING |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `dashboard.view` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| `catalog.manage` | ✔ | ✔ | | | | | ✔ |
| `orders.view` | ✔ | ✔ | ✔ | | ✔ | ✔ | |
| `orders.manage` | ✔ | ✔ | | | | | |
| `projects.view` | ✔ | ✔ | ✔ | ✔ | ✔ | | |
| `projects.work` | ✔ | ✔ | ✔ | ✔ | | | |
| `projects.manage` | ✔ | ✔ | ✔ | | | | |
| `customers.view` | ✔ | ✔ | ✔ | | ✔ | ✔ | |
| `customers.manage` | ✔ | ✔ | | | | | |
| `finance.view` | ✔ | ✔ | | | | ✔ | |
| `finance.manage` | ✔ | ✔ | | | | ✔ | |
| `marketing.manage` | ✔ | ✔ | | | | | ✔ |
| `content.manage` | ✔ | ✔ | | | | | ✔ |
| `leads.view` | ✔ | ✔ | ✔ | | ✔ | | ✔ |
| `support.manage` | ✔ | ✔ | ✔ | | ✔ | | |
| `saas.manage` | ✔ | ✔ | | | | ✔ | |
| `settings.manage` | ✔ | ✔ | | | | | |
| `users.manage` | ✔ | | | | | | |
| `audit.view` | ✔ | ✔ | | | | | |

O que cada permissão abre:

| Permissão | Ecrãs e ações |
|---|---|
| `dashboard.view` | Painel de controlo, lista de tarefas, botão **Terminer** nas tarefas. |
| `catalog.manage` | Produtos, packs, categorias, opções. |
| `orders.view` / `orders.manage` | Ver encomendas / notas internas e cancelamento de encomendas não pagas. |
| `projects.view` | Ver projetos, briefing, ficheiros e exportar o brief JSON. |
| `projects.work` | Mudar o estado, escrever mensagens e notas internas, tratar revisões. |
| `projects.manage` | Atribuir responsável, prazo, URL de pré-visualização e URL final; trabalhar em qualquer projeto. |
| `customers.view` / `customers.manage` | Ver fichas de cliente / desativar contas e tratar pedidos RGPD. |
| `finance.view` / `finance.manage` | Página de finanças, faturas e exportações CSV / reembolsos. |
| `marketing.manage` | Cupões. |
| `content.manage` | Páginas legais, blog, FAQ, banners, testemunhos, traduções. |
| `leads.view` | Ver leads e mudar o estado. |
| `support.manage` | Tickets de suporte. |
| `saas.manage` | Planos e lista de subscrições. |
| `settings.manage` | Definições, mercados, modelos de e-mail. |
| `users.manage` | Equipa e funções (só `SUPER_ADMIN`). |
| `audit.view` | Registo de auditoria. |

Pontos a conhecer:

- **DEVELOPER** só vê na lista os projetos que lhe estão atribuídos e só pode mudar o estado e tratar revisões desses projetos.
- **SUPPORT** vê projetos mas não pode escrever mensagens nem mudar estados (não tem `projects.work`).
- **FINANCE** pode reembolsar mas não pode cancelar encomendas nem escrever notas internas (não tem `orders.manage`).
- **MARKETING** gere catálogo, cupões e conteúdo, mas não vê encomendas nem finanças.
- A mesma tabela aparece, em forma de lista, em **Paramètres → Équipe et rôles**, cartão «Permissions par rôle».

## 3. Painel de controlo

**Tableau de bord** (Painel de controlo) — `/admin`.

| Indicador | Como é calculado |
|---|---|
| **Commandes payées** | Número de encomendas com estado `PAID` (as reembolsadas não entram). |
| **Clients** | Contas sem função interna e não eliminadas. |
| **Projets actifs** | Projetos entre «Briefing envoyé» e «Mise en ligne en préparation». Por baixo: número de projetos em atraso (prazo ultrapassado) ou «Aucun retard». |
| **Abonnements actifs** | Subscrições com estado ativo, em teste ou com pagamento em atraso. |
| **Ventes du mois** | Pagamentos recebidos desde o dia 1 do mês, menos reembolsos, por moeda. Só com `finance.view`. |
| **Facturation totale** | O mesmo cálculo, sem limite de data. Só com `finance.view`. |
| **Revenu récurrent mensuel** | MRR: soma do preço mensal (base + lugares extra) das subscrições ativas ou com pagamento em atraso; os testes gratuitos não contam. Só com `finance.view`. |

Os valores são apresentados por moeda (CHF · EUR · BRL), sem conversão.

Por baixo: **Dernières commandes** (6 últimas), **Produits les plus vendus** (5 primeiros, por número de linhas de encomenda pagas) e **Projets en retard** (5 primeiros).

## 4. Tarefas

**Tâches** (Tarefas) — `/admin/tasks`. Mostra as tarefas abertas (até 200), ordenadas por prazo; o prazo ultrapassado aparece a vermelho. O título liga à encomenda, ao projeto ou à página de pedidos RGPD. **Terminer** (Terminar) fecha a tarefa.

Não é possível criar tarefas à mão: são todas geradas automaticamente.

| Acontecimento | Tarefa criada | Prazo |
|---|---|---|
| Encomenda paga | «Nouvelle commande ATH-… — vérifier et planifier» | +1 dia |
| Briefing enviado pela primeira vez | «Briefing reçu — planifier la production de PRJ-…» | +2 dias |
| Projeto aprovado pelo cliente (ou passado a «Approuvé» pela equipa) | «Projet PRJ-… approuvé — préparer la mise en ligne» | +2 dias |
| Projeto aprovado, com a automatização de manutenção ligada | «Proposer un contrat de maintenance pour PRJ-…» | +7 dias |
| Pedido RGPD (exportação ou eliminação) feito por um cliente | «Demande RGPD (EXPORT/DELETE) — e-mail» | +25 dias |

As tarefas não têm responsável: qualquer conta interna as vê e pode fechá-las. Os títulos são sempre em francês.

Outras automatizações ligadas aos mesmos acontecimentos (`src/modules/automation/events.ts`):

| Acontecimento | Cliente recebe | Equipa recebe |
|---|---|---|
| Registo de conta | E-mail `welcome` | — |
| Encomenda paga | E-mail `order_confirmation` + notificação com ligação para o briefing | Notificação a SUPER_ADMIN, ADMIN, PROJECT_MANAGER e FINANCE; e-mail `admin_new_order` para `CONTACT_EMAIL` |
| Pagamento falhado | E-mail `payment_failed` + notificação | — |
| Reembolso | E-mail `refund` | — |
| Briefing enviado | E-mail `briefing_received` | Notificação a SUPER_ADMIN, ADMIN, PROJECT_MANAGER; e-mail `admin_briefing_submitted` |
| Mudança de estado do projeto | E-mail `project_status` + notificação (ver exceções na secção 6) | — |
| Mensagem da equipa no projeto | E-mail `new_message` + notificação | — |
| Mensagem do cliente no projeto | — | Notificação ao responsável do projeto; sem responsável, a SUPER_ADMIN, ADMIN, PROJECT_MANAGER e SUPPORT |
| Novo lead | E-mail `lead_ack` | Notificação a SUPER_ADMIN, ADMIN, MARKETING, SUPPORT, PROJECT_MANAGER; e-mail `admin_new_lead` |
| Subscrição ativada / pagamento falhado / cancelamento agendado / cancelada / aviso de renovação | E-mail e notificação aos proprietários da empresa | — |
| Novo ticket de suporte | — | Notificação a SUPER_ADMIN, ADMIN e SUPPORT |

Se uma automatização falhar (por exemplo, o envio de um e-mail), a operação principal não é anulada: o erro fica apenas no registo do servidor.

## 5. Encomendas

**Ventes → Commandes** (Vendas → Encomendas) — `/admin/orders`.

### Pesquisa

- Campo «Numéro, client, e-mail…»: procura no número da encomenda (`ATH-AAAA-NNNNN`), no nome e no e-mail do cliente.
- Filtro de estado: **Tous les statuts** ou um estado concreto.
- Botão **Filtrer**. A lista mostra as 200 encomendas mais recentes que correspondem.

Estados de uma encomenda: `PENDING_PAYMENT`, `PAYMENT_FAILED`, `PAID`, `PARTIALLY_REFUNDED`, `REFUNDED`, `CANCELLED`.

### Detalhe

- **Articles et projets**: cada modelo comprado, o pack (`BASIC`, `BUSINESS`, `PREMIUM`), as opções e a ligação para o projeto criado.
- **Paiements**: data, prestador e método, montante, estado, referência do prestador, motivo de falha e reembolsos já feitos.
- **Récapitulatif**: subtotal, desconto, imposto e total.
- **Client**: conta, e-mail, dados de faturação, número de IVA e ligação para a fatura (**Facture ATH-F-…**).

Uma encomenda cria um projeto por modelo comprado. O projeto nasce em «Paiement en attente» e só avança quando chega a confirmação do prestador de pagamentos.

### Notas internas

Com `orders.manage`: cartão **Notes internes** (Notas internas), campo «Notes internes (invisibles pour le client)», botão **Enregistrer**. O cliente nunca vê estas notas.

### Cancelar uma encomenda não paga

Com `orders.manage`, o botão **Annuler la commande** (Cancelar a encomenda) aparece só quando a encomenda está «em espera de pagamento» ou «pagamento falhado». Indique o motivo e confirme com **Confirmer l’annulation**.

Uma encomenda paga não pode ser cancelada: faz-se um reembolso. O cliente também pode cancelar ele próprio uma encomenda não paga na sua área.

### Reembolsos

Com `finance.manage`, o botão **Rembourser** (Reembolsar) aparece junto de cada pagamento bem-sucedido ou parcialmente reembolsado.

1. Indique o montante (por omissão, o máximo ainda reembolsável) e o motivo.
2. Confirme com **Confirmer le remboursement**.

O dinheiro é devolvido através do prestador (Stripe); em modo de teste nada é movimentado. A encomenda passa a «parcialmente reembolsada» ou «reembolsada», o cliente recebe o e-mail `refund` e a operação fica no registo de auditoria (`payment.refund`).

O reembolso **não** altera o estado do projeto nem gera nota de crédito: se o trabalho deve parar, avise o cliente pela mensagem do projeto e trate a contabilidade fora da plataforma.

## 6. Projetos

**Ventes → Projets** (Vendas → Projetos) — `/admin/projects`.

A lista mostra referência (`PRJ-AAAA-NNNNN`), nome, cliente, responsável, prazo (a vermelho se ultrapassado) e estado. Filtros: estado (por omissão «Tous les projets payés», ou seja, tudo exceto «pagamento pendente») e caixa **Mes projets**.

### Os 13 estados

| # | Estado (FR) | pt-PT | Quem o define | Cliente avisado? |
|---|---|---|---|---|
| 1 | Paiement en attente | Pagamento pendente | Automático, ao criar a encomenda | Não |
| 2 | Payé | Pago | Automático, registado no histórico no momento do pagamento | Não (recebe a confirmação de encomenda) |
| 3 | Briefing à remplir | Briefing por preencher | Automático, logo após o pagamento | Não (a confirmação de encomenda traz a ligação para o briefing) |
| 4 | Briefing envoyé | Briefing enviado | Automático, quando o cliente envia o briefing | Não (recebe o e-mail `briefing_received`) |
| 5 | En file d’attente | Em fila de espera | Automático, quando o cliente confirma definitivamente o briefing; ou manual | Sim |
| 6 | En développement | Em desenvolvimento | Manual | Sim |
| 7 | Revue interne | Revisão interna | Manual | **Não** (estado interno) |
| 8 | À valider par vous | A validar por si | Manual | Sim — o cliente passa a ver os botões de aprovação e de revisão |
| 9 | Révision demandée | Revisão pedida | Automático, quando o cliente pede uma revisão; ou manual | Só se for a equipa a mudar o estado; quando é o cliente a pedir, é a equipa que é avisada |
| 10 | Approuvé | Aprovado | Automático, quando o cliente aprova; ou manual | Sim; cria as tarefas de publicação e de manutenção |
| 11 | Mise en ligne en préparation | Colocação online em preparação | Manual | Sim |
| 12 | Terminé | Concluído | Manual | Sim |
| 13 | Maintenance | Manutenção | Manual | Sim |

«Avisado» significa: notificação na área de cliente e e-mail `project_status` com o nome do estado, na língua do cliente.

Regras:

- Os estados 1 e 2 dependem do prestador de pagamentos e não podem ser escolhidos à mão. Um projeto por pagar não pode ser movido.
- Entre os restantes estados não há sequência obrigatória: a equipa pode escolher qualquer um, incluindo recuar. Convém respeitar a ordem, porque o cliente só pode aprovar ou pedir revisão em «À valider par vous».
- Quem tem `projects.manage` muda o estado de qualquer projeto; um DEVELOPER só o dos seus.

### Mudar o estado

Cartão **Statut** → **Statut du projet** → opcionalmente «Commentaire visible par le client (facultatif)» → **Mettre à jour le statut** (Atualizar o estado). O comentário fica no histórico que o cliente vê.

### Responsável, prazo e URLs

Com `projects.manage`, cartão **Organisation**:

| Campo | Efeito |
|---|---|
| **Responsable** | Qualquer conta interna ativa. As mensagens do cliente passam a notificar apenas esta pessoa. |
| **Échéance** | Data de entrega. O cliente vê-a como «Livraison estimée»; sem data, vê «Communiquée après le briefing». Alimenta os indicadores de atraso. |
| **URL d’aperçu (client)** | Tem de começar por `https://`. O cliente vê a ligação **Ouvrir l’aperçu** quando o projeto está em «À valider par vous». |
| **URL du site en ligne** | Tem de começar por `https://`. Assim que é preenchida, o cliente vê «Votre site est en ligne». |

O prazo **não é calculado automaticamente** a partir dos dias de entrega do pack: tem de ser introduzido à mão. A opção «Livraison express» também não altera nada sozinha — é o gestor que dá prioridade.

### Mensagens e notas internas

Cartão **Messages et notes internes**. Escreva em **Message** e escolha:

- Caixa «Note interne (invisible pour le client)» **desmarcada**: mensagem ao cliente. Recebe notificação e o e-mail `new_message`.
- Caixa **marcada**: nota interna. Só a equipa a vê; não gera aviso nem aparece na exportação de dados do cliente.

### Revisões

O cliente só pode pedir uma revisão quando o projeto está em «À valider par vous». O pedido cria uma entrada no cartão **Révisions** e move o projeto para «Révision demandée».

Em cada revisão: **Statut** (`Ouverte`, `En cours`, `Traitée`, `Refusée`) e **Réponse au client**, depois **OK**. A resposta fica visível para o cliente no cartão de revisões, mas não lhe é enviada nenhuma notificação — escreva também uma mensagem. Depois de tratar a revisão, volte a pôr o projeto em «À valider par vous».

O cartão **Détails** mostra «Révisions incluses» (ciclos do pack). A plataforma mostra a contagem ao cliente («N demande(s) sur M cycle(s) inclus»), mas **não bloqueia** pedidos acima do limite: a decisão de aceitar ou faturar uma revisão extra é da equipa.

### Ler o briefing

Cartão **Briefing**: dois indicadores — o estado do briefing (`DRAFT`, `SUBMITTED`, `CONFIRMED`) e **Consentement IA : oui / non** — e as respostas do cliente, só com os campos preenchidos: empresa, setor, responsável, e-mail, telefone, morada, país, língua(s) do site, domínio, cores, sites de referência, objetivo, público-alvo, páginas, funcionalidades, redes sociais, serviços ou produtos, textos, informações complementares e «Avec vos propres mots».

O briefing pode ser alterado pelo cliente enquanto estiver em `SUBMITTED`; em `CONFIRMED` fica bloqueado. Os ficheiros enviados (logótipo, imagens, documentos) estão no cartão **Fichiers**.

### Exportar o brief em JSON e a regra do consentimento de IA

Botão **Exporter (JSON)** no cartão do briefing. Descarrega `PRJ-…-brief.json` (esquema `athana.project-brief/v1`) com:

- `aiProcessingConsent`: `true` ou `false`;
- `project`: referência, estado, prazo;
- `product`: slug do modelo, nome, pack, caminho da demonstração (`/demo/<slug>`), tecnologias, opções, páginas e revisões incluídas;
- `briefing`: empresa, contacto, projeto, conteúdos e lista de ficheiros (nome, tipo, tamanho — os ficheiros em si não são incluídos).

**Regra do consentimento.** No briefing, o cliente pode marcar a caixa «J’autorise ATHANA à traiter ce briefing à l’aide d’outils d’intelligence artificielle…». É facultativa.

- Com consentimento: o JSON contém todos os dados.
- Sem consentimento: o nome do contacto, o e-mail, o telefone e a morada são substituídos por `[redacted — no AI consent]`.

Atenção: os campos de texto livre (textos do site, «com as suas próprias palavras», informações complementares) são exportados tal como estão, com ou sem consentimento. **Se `aiProcessingConsent` for `false`, leia esses campos e retire qualquer dado pessoal antes de passar o ficheiro a uma ferramenta de IA.** Cada exportação fica no registo de auditoria (`project.brief_export`) com o valor do consentimento.

## 7. Clientes

**Ventes → Clients** (Vendas → Clientes) — `/admin/customers`. Pesquisa por nome ou e-mail; a lista mostra mercado de registo, número de encomendas e de empresas, data de registo e a etiqueta **Désactivé**.

A ficha mostra: **Compte** (telefone, país, mercado, estado), **Entreprises et abonnements** (empresas a que pertence, papel, número de utilizadores, subscrições), **Commandes**, **Projets** e **Historique** (15 últimas ações sensíveis do cliente).

Com `customers.manage`: **Désactiver le compte** impede o início de sessão e fecha as sessões abertas; **Réactiver le compte** anula. Os dados do cliente não são alterados. As contas internas não aparecem aqui: gerem-se em **Paramètres → Équipe et rôles**.

Não é possível criar um cliente, alterar-lhe o e-mail ou iniciar sessão em nome dele a partir do painel.

## 8. Leads

**Ventes → Leads** — `/admin/leads`. Pedidos recebidos pelos formulários de contacto, de orçamento e das páginas de campanha (200 mais recentes).

Cada lead mostra nome, empresa, e-mail e telefone clicáveis, data, tipo (`contact`, `quote`, `campaign`), mercado, interesse, orçamento indicado, origem da campanha (`utm_source/utm_campaign`, quando o visitante aceitou os cookies de medição) e a mensagem.

O estado avança num só sentido com um botão: **Marquer contacté** → **Qualifier** → **Clore** (`NEW` → `CONTACTED` → `QUALIFIED` → `CLOSED`). Não há recuo, notas, atribuição nem conversão em cliente.

A tarefa diária elimina os leads com mais do que o prazo de conservação (24 meses por omissão) que estejam em `NEW` ou `CLOSED`; os leads em `CONTACTED` ou `QUALIFIED` não são eliminados automaticamente.

## 9. Suporte

**Ventes → Support** (Suporte) — `/admin/support`. Tickets abertos pelos clientes em `/account/support`, ordenados por estado: **À traiter** (`OPEN`), **Répondu** (`ANSWERED`), **Clos** (`CLOSED`).

No ticket, escreva em **Réponse** e escolha:

- sem caixas: a resposta é enviada, o ticket passa a «Répondu» e o cliente recebe uma notificação na área de cliente (não há e-mail);
- **Note interne**: nota só para a equipa, o estado não muda;
- **Clore le ticket**: fecha o ticket (com ou sem mensagem).

Se o cliente voltar a responder, o ticket regressa a «À traiter». Não há notificação à equipa nas respostas seguintes do cliente — só na criação do ticket —, por isso consulte a lista regularmente.

## 10. Catálogo

### Produtos

**Catalogue → Produits** (Catálogo → Produtos) — `/admin/products`. Cada produto é um modelo de site. A lista mostra nome, slug, categoria, número de vendas e estado: **Publié**, **Brouillon** ou **Supprimé**.

**Nouveau produit** cria o produto em rascunho com três packs vazios. Campos da ficha:

| Campo | Notas |
|---|---|
| **Nom**, **Slug (URL)** | O slug é gerado a partir do nome se ficar vazio e não pode ser alterado depois. |
| **Catégorie** | Obrigatória. |
| **Accroche**, **Description** | Em francês (obrigatório), pt-PT e pt-BR. Sem texto numa língua, o site mostra o francês. |
| **Fonctionnalités (une par ligne)** | Uma por linha; a mesma linha nas três línguas corresponde à mesma funcionalidade. |
| **Technologies**, **Langues disponibles** | Separadas por vírgulas (línguas em códigos: `fr`, `pt`, `en`…). |
| **Démo interne (slug dans /demo)** ou **URL de démonstration externe** | Pelo menos uma é necessária para publicar. A URL externa tem de começar por `https://`. |
| **Image principale**, **Galerie** | Caminho `/images/…` ou URL `https://`; galeria com uma imagem por linha (máx. 12). |
| **Prix « à partir de » affiché dans le catalogue** | Por moeda. É apenas o valor mostrado no catálogo; o preço cobrado vem dos packs. Mantenha-o igual ao pack mais barato. |
| **Délai de livraison de base (jours ouvrés)** | Mostrado na ficha («dès N jours ouvrés»). |
| **Mettre en avant sur la page d’accueil**, **Ordre** | Destaque e ordenação. |
| **Produits associés** | «Modèles similaires» na ficha pública. |
| **Options spécifiques** | Opções não globais propostas só neste produto. |
| **Titre SEO**, **Description SEO** | Por língua. |

### Os três packs e os preços por moeda

Na ficha do produto, secção **Packs et prix** (Packs e preços): três cartões fixos — `BASIC`, `BUSINESS`, `PREMIUM`. Não se podem criar nem apagar packs; podem ser desativados.

| Campo | Notas |
|---|---|
| **Nom du pack**, **Description**, **Contenu du pack (une ligne par élément)** | Por língua. |
| **Prix** | Um campo por moeda dos mercados (CHF, EUR, BRL). «Une devise vide rend le pack indisponible sur ce marché.» |
| **Délai (jours ouvrés)**, **Pages incluses**, **Cycles de révision** | Mostrados ao cliente no configurador. |
| **Pack actif (proposé à la vente)** | Desmarcado, o pack deixa de ser proposto. |

Os preços são sempre recalculados no servidor a partir destes valores: nada do que o navegador envia é aceite. Uma alteração de preço aplica-se às novas encomendas; as encomendas existentes guardam os montantes do momento da compra.

### Regras de publicação

**Publier** só funciona se:

1. existir pelo menos um pack ativo com um preço em pelo menos uma moeda — caso contrário: «Ajoutez au moins un pack actif avec un prix avant de publier.»;
2. o produto tiver uma demonstração interna ou externa — caso contrário: «Une démonstration est requise avant de publier un modèle.»

Além disso, num dado mercado, o modelo só pode ser comprado se algum pack ativo tiver preço na moeda desse mercado; sem preço, a ficha mostra «Ce modèle n’est pas encore disponible à la vente dans votre pays.»

**Dépublier** devolve o produto a rascunho (deixa de aparecer no site).

### Eliminação lógica

**Supprimer** não apaga nada: o produto fica arquivado, sai do catálogo e continua ligado às encomendas e projetos existentes. Na lista aparece esbatido com **Supprimé**; **Restaurer** devolve-o a rascunho.

### Categorias

**Catalogue → Catégories** — nome nas três línguas, slug, ordem e **Publiée**. Uma categoria só pode ser eliminada quando não tem produtos (o botão **Supprimer** só aparece nesse caso); a eliminação também é lógica.

### Opções (add-ons)

**Catalogue → Options** (Opções) — suplementos propostos no passo 2 do configurador.

| Campo | Notas |
|---|---|
| **Nom**, **Description** | Por língua. |
| **Prix** | Por moeda; sem preço numa moeda, a opção não é proposta nesse mercado. |
| **Proposée sur tous les produits** | Marcada: opção global. Desmarcada: só aparece nos produtos onde for escolhida em «Options spécifiques». |
| **Active**, **Ordre** | Estado e ordenação. |

As opções não podem ser eliminadas, apenas desativadas.

## 11. Cupões

**Finance → Coupons** (Cupões) — `/admin/coupons`, com `marketing.manage`. **Nouveau coupon**:

| Campo | Regra |
|---|---|
| **Code** | 3 a 30 letras, algarismos, hífenes ou sublinhados; guardado em maiúsculas; único; não pode ser alterado depois de criado. |
| **Type** | **Pourcentage** (1 a 100) ou **Montant fixe**. |
| **Valeur** | Percentagem ou montante. |
| **Devise (montant fixe)** | Obrigatória para montante fixo; o cupão só é aceite em encomendas nessa moeda. |
| **Campagne** | Texto livre para identificar a campanha (não é mostrado ao cliente). |
| **Utilisations maximales** | Limite total; vazio = sem limite. |
| **Sous-total minimum** | Valor mínimo do carrinho; a moeda não é verificada num cupão percentual. |
| **Début**, **Fin** | Período de validade. |
| **Actif** | Liga ou desliga o cupão. |

Funcionamento: o cliente introduz o código no carrinho; o desconto aplica-se ao subtotal (modelos + opções), antes do imposto, e nunca ultrapassa o subtotal. A coluna **Utilisations** só aumenta quando a encomenda é paga. Os cupões aplicam-se apenas às encomendas de modelos, não às subscrições de software. Não há limite por cliente nem restrição por produto.

Com `SEED_DEMO=true`, o *seed* cria o cupão de teste `TEST10` (10 %): não deve existir em produção.

## 12. Software, planos e subscrições

### Planos

**Finance → Logiciels & plans** (Software e planos) — `/admin/plans`, com `saas.manage`. Uma secção por produto: ATHANA CRM e ATHANA Pointage (**Disponible**), mais ATHANA POS, Stock, Booking e Projects (**Bientôt**, sem planos — aparecem no site como «em preparação»).

Cada plano (`STARTER`, `BUSINESS`, `PRO`) tem:

| Campo | Notas |
|---|---|
| **Nom** | Nome comercial. |
| **Prix mensuel** | Por moeda; sem preço, o plano não é proposto nesse mercado. |
| **Places incluses** e **Prix par place supplémentaire** | Faturação por utilizador ou funcionário acima dos lugares incluídos. Hoje só o Pointage usa lugares (funcionários ativos). |
| **Limites (JSON)** | Objeto JSON de números inteiros, por exemplo `{"users":10,"contacts":5000}`. Uma chave ausente significa «ilimitado». Chaves usadas: CRM — `users`, `contacts`, `companies`, `storageMb`; Pointage — `employees`. |
| **Fonctionnalités activées** | Chaves separadas por vírgulas. CRM: `pipeline`, `tasks`, `multiPipelines`, `proposals`, `export`, `reports`. Pointage: `clock`, `absences`, `departments`, `export`, `reports`, `audit`. |
| **Jours d’essai** | 0 a 90. |
| **Plan proposé à la vente** | Desmarcado, o plano deixa de ser proposto. |

O formulário **não** edita os destaques comerciais mostrados na página de preços («2 utilisateurs», «500 contacts»…): vêm do *seed*. Se alterar um limite, o texto do destaque fica desatualizado até ser corrigido na base de dados.

Não é possível criar planos novos nem novos produtos de software pelo painel.

Efeito das alterações: limites, funcionalidades e dias de teste aplicam-se de imediato a todas as subscrições desse plano (são lidos do plano em cada pedido). O preço aplica-se às novas subscrições; numa subscrição Stripe já ativa, o montante cobrado é o que foi fixado no momento da ativação e não muda sozinho.

### Subscrições

**Finance → Abonnements** (Subscrições) — `/admin/subscriptions`. Quatro indicadores — **Revenu récurrent mensuel**, **Actifs**, **En essai**, **En retard de paiement** — e a lista (300 mais recentes): empresa, software, plano, lugares, montante mensal, fim do período (com «résiliation programmée» se o cancelamento estiver agendado) e estado.

A página é só de consulta. A ativação, a mudança de plano e o cancelamento são feitos pelo cliente em `/account/subscriptions`. Exceção: a mudança de plano de uma subscrição Stripe ativa está bloqueada para o cliente («se fait via le support pour le moment») e não tem ecrã no painel — tem de ser feita no painel do Stripe e na base de dados.

## 13. Finanças e exportações

**Finance → Paiements & rapports** (Pagamentos e relatórios) — `/admin/finance`, com `finance.view`.

| Indicador | Cálculo |
|---|---|
| **Encaissé ce mois (net)** | Pagamentos bem-sucedidos desde o dia 1, menos reembolsos, por moeda. |
| **Encaissé au total (net)** | O mesmo, sem limite de data. |
| **Revenu récurrent mensuel** | MRR, como no painel. |
| **Paiements remboursés** | Número de pagamentos com pelo menos um reembolso. |

Tabela dos 150 últimos pagamentos (encomendas e subscrições) e cartão **Dernières factures** (20 últimas). Cada fatura abre uma página imprimível (`/admin/finance/invoice/<id>`).

Faturas: é criada uma fatura por encomenda paga, numerada `<prefixo>-F-AAAA-NNNNN` (prefixo `ATH` por omissão). A fatura guarda uma cópia dos dados da empresa e do cliente no momento do pagamento; alterar as definições depois não muda as faturas já emitidas. **Os pagamentos de subscrições não geram fatura na plataforma.**

### Exportações CSV

Dois botões no topo, sempre para o ano civil em curso:

| Botão | Colunas |
|---|---|
| **Export paiements AAAA (CSV)** | `date`, `provider`, `reference`, `status`, `object`, `currency`, `amount`, `refunded`, `net` |
| **Export commandes AAAA (CSV)** | `number`, `date`, `status`, `customer`, `email`, `country`, `currency`, `subtotal`, `discount`, `tax`, `tax_rate_percent`, `total`, `invoice` |

Para outro ano, altere o parâmetro `year` no endereço, por exemplo `/api/admin/reports?type=orders&year=2026`. Cada exportação fica no registo de auditoria (`finance.export`).

## 14. Conteúdo

**Plateforme → Contenu** (Plataforma → Conteúdo) — `/admin/content`, com `content.manage`. Seis cartões. As fichas de produto e o respetivo SEO gerem-se no catálogo.

### Páginas legais

**Pages légales** — quatro páginas (`mentions-legales`, `confidentialite`, `cgv`, `cookies`), cada uma em `fr`, `pt-PT` e `pt-BR`. Edita-se o **Titre** e o **Contenu (Markdown simplifié)**: títulos `##`, listas `-`, negrito `**texto**`, ligações `[texto](https://…)`. As variáveis `{{legalName}}`, `{{address}}`, `{{postalCode}}`, `{{city}}`, `{{email}}`, `{{phone}}` são substituídas pelos dados da empresa.

Os textos fornecidos são **modelos** e começam com o aviso «Modèle à valider»: têm de ser revistos por um jurista antes da publicação. Não é possível criar novas páginas legais pelo painel.

### Blog

**Blog** — artigos por língua (`fr`, `pt-PT`, `pt-BR`, `en`). Campos: título, slug (gerado a partir do título se ficar vazio; único por língua), resumo (10 a 400 caracteres), conteúdo em Markdown simplificado (mínimo 50 caracteres), estado (**Brouillon** / **Publié**), título e descrição SEO e **Clé de traduction**.

A chave de tradução liga as versões do mesmo artigo: dê a mesma chave (por exemplo `template-vs-custom`) à versão francesa, à pt-PT e à pt-BR para que o site gere as ligações `hreflang` entre elas. Cada mercado mostra os artigos da sua língua. O *seed* cria um artigo por língua.

### FAQ

**FAQ** — pergunta e resposta nas três línguas, **Emplacement** (por omissão `home`, a página inicial), ordem e **Publiée**. As perguntas das fichas de produto ficam guardadas em cada produto e não são editáveis aqui.

### Banners

**Bannières** — faixa promocional no topo do site: mensagem nas três línguas, **Lien interne (facultatif)** (um caminho interno, por exemplo `/templates`), **Active**, **Début** e **Fin**.

### Testemunhos — apenas reais

**Témoignages** — autor, função, empresa, texto, língua, **Publier sur le site**. Para publicar é obrigatório marcar «Je confirme que ce témoignage provient d’un client réel, qui a donné son accord pour sa publication.»; sem isso o painel recusa.

A secção de testemunhos só aparece no site quando existe pelo menos um testemunho publicado. Nenhum foi criado pelo *seed*. Não invente testemunhos: guarde a prova do acordo do cliente fora da plataforma.

### Traduções (correções)

**Traductions** — corrige um texto da interface numa língua sem tocar no código.

1. Escolha a língua (`pt-PT`, `pt-BR`, `fr-FR`, `en`, `fr`).
2. Procure o texto (mínimo 2 caracteres), pelo francês de origem ou pela tradução atual.
3. Escreva a correção e confirme com **OK**. Deixar o campo vazio repõe a tradução de origem.

Sem pesquisa, a página lista as correções já guardadas para a língua. A correção sobrepõe-se ao ficheiro de traduções. Serve para rótulos da interface; os conteúdos do catálogo, FAQ, blog e páginas legais editam-se nos respetivos ecrãs.

## 15. Definições

**Plateforme → Paramètres** (Plataforma → Definições) — `/admin/settings`, com `settings.manage`.

### Dados da empresa

Cartão **Entreprise**: denominação social, e-mail de contacto, morada, código postal, cidade, país (código ISO), telefone, número de IVA, número de empresa (IDE), IBAN, LinkedIn, WhatsApp. São usados nas faturas, nas páginas legais (variáveis `{{…}}`) e nos contactos do site.

### Mercados, moedas e impostos

Botão **Marchés, devises et taxes** — um cartão por mercado (`/fr-ch`, `/fr-fr`, `/pt-pt`, `/pt-br`):

| Campo | Notas |
|---|---|
| **Devise** | Código de 3 letras. Mudar a moeda de um mercado exige preços nessa moeda em todos os packs, opções e planos. |
| **Taux de taxe (%)** | 0 a 40. |
| **Libellé de la taxe** | Por exemplo TVA, IVA. |
| **Les prix du catalogue incluent la taxe** | Marcado: o imposto está incluído nos preços. Desmarcado: é somado no checkout. |
| **Moyens de paiement affichés** | Lista informativa mostrada no checkout, separada por vírgulas. A ativação real faz-se no prestador de pagamentos. |
| **Marché ouvert à la vente** | Desmarcado, o checkout desse mercado recusa encomendas («Marché indisponible.»). |

Todos os mercados começam com imposto a 0 %; enquanto houver um a 0 %, a página mostra um aviso. Ver `BUSINESS_CONFIGURATION.md`. Não é possível criar novos mercados pelo painel.

### Modelos de e-mail

Botão **Modèles d’e-mails** — um modelo por acontecimento e por língua (`fr`, `pt-PT`, `pt-BR`): edita-se **Objet** e **Corps (texte, variables entre {{ }})**. Não apague as variáveis (`{{name}}`, `{{orderNumber}}`…). À direita, **Derniers envois** mostra os 25 últimos e-mails com o estado (`sent`, `failed` ou registado apenas).

Os e-mails para a equipa (`admin_new_order`, `admin_briefing_submitted`, `admin_new_lead`) e os convites internos são sempre enviados em francês.

### Estado das integrações

Cartão **Intégrations** — só de leitura. As credenciais definem-se nas variáveis de ambiente do servidor, nunca no painel.

| Linha | Significado |
|---|---|
| **Paiements** | `Stripe` ou «Mode test (aucun paiement réel)». |
| **Webhook Stripe signé** | `STRIPE_WEBHOOK_SECRET` definido. |
| **E-mails** | `Resend` ou «Journal uniquement (aucun envoi)» — neste modo os e-mails ficam só registados. |
| **Google Analytics 4 / Tag Manager**, **Google Ads**, **Meta Pixel** | Identificadores definidos ou «À configurer». |
| **Tâche planifiée quotidienne (CRON_SECRET)** | Necessária para avisos de renovação, fim de testes e limpeza de dados. |
| **PayPal** | «Non implémenté». |

### Faturação, segurança, ficheiros, privacidade, automatizações

| Cartão | Campos | Valor por omissão |
|---|---|---|
| **Facturation** | Prefixo dos números de fatura; menção em rodapé | `ATH`; vazio |
| **Sécurité** | Duração da sessão (dias); comprimento mínimo da palavra-passe; tentativas de início de sessão por 15 minutos | 30; 10; 8 |
| **Fichiers** | Tamanho máximo (Mo); tipos autorizados (um por linha) | 15 MB; PNG, JPEG, WebP, SVG, PDF, TXT, DOCX, XLSX, ZIP |
| **Confidentialité et rétention** | Versão da política (alterá-la volta a pedir o consentimento de cookies); conservação dos leads (meses) | `2026-11`; 24 |
| **Automatisations** | «Créer une tâche “proposer la maintenance” quand un projet est approuvé» | Ligada |

O painel recusa um comprimento mínimo de palavra-passe inferior a 10 e uma sessão inferior a 1 dia. Acrescentar um tipo de ficheiro à lista não basta: o servidor só aceita os nove tipos que sabe verificar pelo conteúdo.

### Equipa

Botão **Équipe et rôles** — visível só para `SUPER_ADMIN`.

- **Ajouter un membre**: nome, e-mail e função. Se o e-mail não tiver conta, é criada e a pessoa recebe um convite (válido 7 dias) para definir a palavra-passe. Se já tiver conta (por exemplo, um cliente), passa a ter a função interna, sem e-mail.
- **Modifier**: mudar a função, marcar **Compte désactivé** ou escolher «Aucun (retirer l’accès à l’administration)».
- Proteções: não pode retirar a sua própria função de super administrador e tem de existir sempre pelo menos um super administrador ativo.

## 16. Pedidos RGPD

**Plateforme → Demandes RGPD** (Pedidos RGPD) — `/admin/data-requests`, com `customers.manage`. Os clientes criam pedidos em **Mes données**: exportação pela equipa ou eliminação. Cada pedido gera uma tarefa com prazo de 25 dias.

O cliente também pode descarregar sozinho, de imediato, um ficheiro JSON com os seus dados; o pedido de exportação serve para casos em que precisa de mais do que isso.

| Botão | Efeito |
|---|---|
| **Marquer comme traitée** (pedido de exportação) | Marca o pedido como tratado. **A plataforma não gera nem envia nenhum ficheiro**: prepare e envie a exportação por fora antes de clicar. |
| **Supprimer / anonymiser** (pedido de eliminação) | Executa a anonimização abaixo, depois de uma confirmação. Irreversível. |
| **Refuser** | Marca o pedido como recusado. O ecrã não tem campo para o motivo: explique-o ao cliente por e-mail. |

### O que «eliminar» faz realmente

A conta não é apagada: é anonimizada. Numa única operação:

| É eliminado ou esvaziado | Fica guardado |
|---|---|
| Sessões abertas | Encomendas, pagamentos e faturas, incluindo o nome e a morada de faturação gravados em cada documento (conservação contabilística) |
| Todos os ficheiros enviados pelo cliente (registo e ficheiro físico) | Projetos, o seu histórico e as revisões pedidas |
| Conteúdo de todos os briefings (e o consentimento de IA volta a «não») | Mensagens da equipa nesses projetos e tickets |
| Texto das mensagens que o cliente escreveu, substituído por `[supprimé]` | As empresas (organizações) do cliente, as suas subscrições e todos os dados de CRM e Pointage |
| Notificações e registos de consentimento de cookies | O registo de auditoria |
| Leads com o mesmo e-mail | |
| Na conta: e-mail substituído por `deleted-<id>@deleted.invalid`, nome por «Compte supprimé», telefone e país apagados, palavra-passe substituída, conta desativada | |

Antes de confirmar, verifique:

- se o cliente tem **subscrições ativas**: não são canceladas por esta operação e uma subscrição Stripe continuaria a ser cobrada — cancele-a primeiro;
- se o cliente é proprietário de uma **empresa com dados de CRM ou Pointage**: esses dados não são tocados e têm de ser tratados à parte;
- se há projetos em curso.

Uma conta interna não pode ser eliminada por este procedimento. Cada decisão fica no registo de auditoria (`data_request.completed` ou `data_request.rejected`).

## 17. Registo de auditoria

**Plateforme → Journal d’audit** (Registo de auditoria) — `/admin/audit`, com `audit.view`. Mostra as 300 últimas ações sensíveis: data, autor (e-mail ou «Système»), ação, objeto e detalhes.

O filtro procura pelo **início** do nome da ação. Exemplos: `product` (publicar, eliminar…), `payment` (reembolsos), `order`, `project`, `coupon`, `plan`, `setting`, `market`, `staff`, `customer`, `data_request`, `finance` (exportações), `user` (registo, exportação de dados), `subscription`.

O registo não pode ser editado nem apagado pelo painel, e não tem exportação nem paginação além das 300 linhas.

---

## 18. Procedimento: adicionar um novo modelo de site

Os passos 1 a 3 são feitos por um programador e exigem uma nova publicação da aplicação; os passos 4 a 6 fazem-se no painel.

1. **Criar a pasta da demonstração** em `src/demos/<slug>/`, com um `index.tsx` que exporte `meta` (slug, nome, língua do conteúdo `fr` ou `pt`, lista de páginas) e o componente por omissão que recebe a página a mostrar. Use uma demonstração existente como base (por exemplo `src/demos/atelier`). O conteúdo deve ser fictício.
2. **Registar a demonstração** em `src/demos/registry.ts`, acrescentando uma linha: `'<slug>': () => import('./<slug>'),`. Fica acessível em `/demo/<slug>`.
3. **Capturar as imagens** com `scripts/capture-catalog.mjs`. O script tem a sua própria lista de demonstrações: acrescente o slug e três páginas a capturar. Com a aplicação a correr e o Chromium do Playwright instalado: `BASE_URL=http://localhost:3000 node scripts/capture-catalog.mjs`. Gera `public/images/catalog/<slug>/cover.jpg` e `page-1.jpg` a `page-3.jpg` (e volta a gerar as dos outros modelos e a imagem Open Graph).
4. **Criar o produto** em **Catalogue → Produits → Nouveau produit**: nome, slug igual ao da demonstração, categoria, textos nas três línguas, **Démo interne** = `<slug>`, **Image principale** = `/images/catalog/<slug>/cover.jpg`, galeria com as três páginas, preço «a partir de» por moeda. Clique em **Créer le produit**.
5. **Preencher os três packs** em **Packs et prix**: preços por moeda, prazo, páginas incluídas, ciclos de revisão, conteúdo do pack. Guarde cada um com **Enregistrer le pack**.
6. **Publicar** com **Publier** e verificar a página com **Voir la page**, em cada mercado.

Depois: confirme que o preço «a partir de» coincide com o pack mais barato e escolha os **Produits associés**.

## 19. Procedimento: transformar uma encomenda num projeto de desenvolvimento com apoio de IA

1. **Encomenda paga.** Chega a tarefa «Nouvelle commande … — vérifier et planifier». Abra a encomenda, verifique o pack e as opções e abra o projeto ligado. Atribua um responsável e uma data em **Organisation**.
2. **Briefing.** O cliente preenche e envia o briefing (tarefa «Briefing reçu — planifier la production»). Leia-o no cartão **Briefing** e veja os ficheiros em **Fichiers**. Se faltar informação, peça-a por mensagem; o cliente pode corrigir o briefing até o confirmar definitivamente, momento em que o projeto passa a «En file d’attente».
3. **Verificar o consentimento de IA.** Veja o indicador **Consentement IA**. Se for «non», os dados de contacto vêm ocultados na exportação, e é sua responsabilidade retirar dados pessoais dos campos de texto livre antes de usar qualquer ferramenta de IA.
4. **Exportar o brief** com **Exporter (JSON)**. O ficheiro indica o modelo (`product.template`), a demonstração (`product.demo`), o pack, as páginas e revisões incluídas, as opções e as respostas do cliente.
5. **Partir do código da demonstração.** O ponto de partida do site do cliente é o código do modelo comprado, em `src/demos/<slug>/`. Copie-o para o repositório do projeto do cliente e use o JSON como especificação: textos, cores, páginas, funcionalidades. Os ficheiros do cliente descarregam-se um a um no cartão **Fichiers**. A plataforma não gera o site: exporta a especificação; a produção, com ou sem assistente de IA, é feita fora dela.
6. **Estados.** «En développement» ao começar; «Revue interne» para o controlo de qualidade (o cliente não é avisado). Compare o resultado com o número de páginas e as opções da encomenda.
7. **Revisão do cliente.** Publique uma pré-visualização, preencha **URL d’aperçu (client)** e passe o projeto a «À valider par vous». O cliente aprova ou pede uma revisão.
8. **Revisões.** Trate cada pedido no cartão **Révisions**, responda e volte a pôr o projeto em «À valider par vous».
9. **Aprovação e publicação.** Com a aprovação chegam as tarefas de publicação e de proposta de manutenção. Passe a «Mise en ligne en préparation», publique, preencha **URL du site en ligne** e termine com «Terminé» — ou «Maintenance» se o cliente tiver contrato de manutenção.
