# Plano de marketing — 90 dias de lançamento

> **Isto é apenas um plano.** Nenhum dinheiro foi gasto, nenhuma conta de anúncios foi criada, nada foi comprado nem contratado, e nenhuma campanha foi lançada. Qualquer despesa — incluindo a abertura de contas Google Ads ou Meta, a compra de ferramentas e a contratação de prestadores — exige a decisão explícita do proprietário. Os montantes abaixo são propostas de repartição do orçamento de referência indicado por ele.

> **Sobre os números.** Este documento não contém previsões de receita, custos por clique esperados, taxas de conversão «típicas» nem referências de mercado: não existem dados reais da ATHANA para as sustentar. Onde um número seria um palpite, está a fórmula e a indicação de que tem de ser medido. As percentagens de repartição por mercado e os limiares das regras de decisão são hipóteses de trabalho, assinaladas como tal.

## Índice

1. [Orçamento de referência](#1-orçamento-de-referência)
2. [Objetivos e indicadores](#2-objetivos-e-indicadores)
3. [Como medir: os eventos da plataforma](#3-como-medir-os-eventos-da-plataforma)
4. [Pré-requisitos](#4-pré-requisitos)
5. [Fase 1 — dias 1 a 30: fundações e primeiras campanhas de pesquisa](#5-fase-1--dias-1-a-30-fundações-e-primeiras-campanhas-de-pesquisa)
6. [Fase 2 — dias 31 a 60: Meta, remarketing e conteúdo](#6-fase-2--dias-31-a-60-meta-remarketing-e-conteúdo)
7. [Fase 3 — dias 61 a 90: otimização e reserva](#7-fase-3--dias-61-a-90-otimização-e-reserva)
8. [Orçamento semanal por canal e por mercado](#8-orçamento-semanal-por-canal-e-por-mercado)
9. [Estrutura de palavras-chave e grupos de anúncios](#9-estrutura-de-palavras-chave-e-grupos-de-anúncios)
10. [Lista de criativos](#10-lista-de-criativos)
11. [Prospeção por setor](#11-prospeção-por-setor)
12. [Cupões e campanhas no painel](#12-cupões-e-campanhas-no-painel)
13. [Relatórios e cadência](#13-relatórios-e-cadência)
14. [Riscos e pontos de atenção](#14-riscos-e-pontos-de-atenção)

---

## 1. Orçamento de referência

Repartição indicada pelo proprietário, num total de **10 000 CHF**:

| Linha | CHF | Natureza |
|---|---:|---|
| Plataforma e checkout | 2 300 | Não é média |
| Catálogo e demonstrações | 900 | Não é média |
| Google Ads | 1 800 | Média paga |
| Meta Ads | 1 000 | Média paga |
| SEO e conteúdo | 800 | Produção |
| Vídeos e criativos | 700 | Produção |
| Prospeção | 500 | Ferramentas e tempo |
| Reserva de otimização | 2 000 | Só libertada por decisão (secção 7) |
| **Total** | **10 000** | |

Sobre as duas primeiras linhas: este plano não detalha a sua utilização, porque não foram pedidos orçamentos reais. Exemplos do que podem cobrir, **a confirmar com preços reais antes de comprometer qualquer valor**: alojamento e domínio, serviço de envio de e-mails, validação jurídica dos textos legais, revisão das traduções por falantes nativos, e a produção de novos modelos e demonstrações para as categorias ainda vazias. As comissões do prestador de pagamentos são cobradas por transação e não saem deste orçamento.

As plataformas de anúncios podem faturar numa moeda diferente do franco suíço e aplicar impostos: o controlo do orçamento faz-se pelo valor realmente debitado, convertido em CHF.

Média paga disponível sem a reserva: 2 800 CHF em cerca de 12 semanas e 4 mercados. É um orçamento de **aprendizagem**: serve para descobrir que combinações de mercado, tema e mensagem trazem encomendas ou leads a um custo aceitável, e não para ganhar volume.

## 2. Objetivos e indicadores

### Objetivos dos 90 dias

1. **Medição fiável** dos quatro percursos — compra de modelo, pedido de orçamento ou contacto, teste de software, registo — em todos os mercados abertos.
2. **Primeiras vendas e primeiros leads atribuíveis** a um canal, com o custo real de cada um conhecido.
3. **Saber onde continuar a investir**: no dia 90, uma decisão fundamentada por mercado e por tema (manter, aumentar, parar).
4. **Base orgânica**: Search Console ativa nos quatro mercados e um primeiro conjunto de artigos publicados.

### Indicadores e fórmulas

Os valores-alvo ficam em branco de propósito: são fixados pelo proprietário no dia 30, com os primeiros dados reais.

| Indicador | Fórmula | Fonte | Alvo |
|---|---|---|---|
| Sessões por mercado | Sessões com caminho a começar por `/fr-ch`, `/fr-fr`, `/pt-pt`, `/pt-br` | GA4 (`page_view`) | A medir |
| Taxa de interesse num modelo | `add_to_cart` ÷ `view_item` | GA4 | A medir |
| Taxa de passagem ao checkout | `begin_checkout` ÷ `add_to_cart` | GA4 | A medir |
| Taxa de conclusão da compra | `purchase` ÷ `begin_checkout` | GA4, confirmada no painel | A medir |
| Encomendas pagas | Número de encomendas com estado pago | Admin → Commandes; exportação CSV | A fixar no dia 30 |
| Valor médio da encomenda | Total das encomendas pagas ÷ número de encomendas, **por moeda** | Admin → Paiements & rapports → exportação de encomendas | A medir |
| Custo por encomenda paga | Despesa do canal ÷ encomendas pagas atribuídas ao canal | Plataforma de anúncios + painel | ≤ custo máximo (abaixo) |
| Retorno da despesa (ROAS) | Receita atribuída ÷ despesa, na mesma moeda | Plataforma de anúncios + painel | ≥ ROAS de equilíbrio (abaixo) |
| Leads | Número de leads criados | Admin → Leads | A fixar no dia 30 |
| Custo por lead | Despesa do canal ÷ leads com esse `utm_source` | Plataforma de anúncios + Admin → Leads | A medir |
| Taxa de qualificação dos leads | Leads «Qualifié» ÷ leads recebidos | Admin → Leads | A medir |
| Testes de software iniciados | Subscrições criadas em teste | Admin → Abonnements («En essai»); GA4 `subscribe` com `step = trial` | A medir |
| Taxa de ativação dos testes | Subscrições ativadas ÷ testes iniciados no mesmo período | Admin → Abonnements; GA4 `subscribe` com `step = activated` | A medir |
| Receita recorrente mensal | MRR por moeda | Admin → Abonnements | A medir |
| Briefings enviados | `briefing_submit` ÷ `purchase` | GA4; Admin → Projets | A medir |
| Visibilidade orgânica | Impressões e cliques por consulta e por país | Search Console | A medir |

### Limites de rentabilidade (a calcular pelo proprietário)

- **Custo máximo por encomenda** = valor médio da encomenda × margem bruta × parte da margem que se aceita gastar na aquisição.
- **ROAS de equilíbrio** = 1 ÷ margem bruta.
- **Custo máximo por lead** = custo máximo por encomenda × taxa de transformação de lead em encomenda (medida).
- **Custo máximo por teste de software** = valor de um cliente (mensalidade × duração média da subscrição × margem) × taxa de ativação dos testes. A duração média só será conhecida ao fim de vários meses: até lá, use uma hipótese prudente e escreva-a.

A margem bruta depende do custo real de produção de um site (horas de trabalho) e ainda não é conhecida: medi-la nas primeiras encomendas faz parte dos objetivos.

## 3. Como medir: os eventos da plataforma

A plataforma dispara os eventos abaixo através de uma camada única (`src/modules/analytics/track.ts`). **Nada é enviado antes de o visitante escolher na faixa de cookies.** Com acordo de «medição de audiência», os eventos vão para o GA4 (ou para o `dataLayer` do Tag Manager); com acordo de «marketing», os eventos com correspondência vão também para o Meta Pixel.

| Evento | Quando dispara | Parâmetros | Evento Meta |
|---|---|---|---|
| `page_view` | Em cada mudança de página do site | `page_path` | — (o pixel envia `PageView` ao carregar) |
| `view_item` | Abertura da ficha de um modelo | `item_id`, `item_name`, `currency`, `value` (preço «a partir de») | `ViewContent` |
| `add_to_cart` | Clique em «Acheter maintenant» no configurador | `item_id`, `item_name`, `value`, `currency` | `AddToCart` |
| `begin_checkout` | Clique no botão de confirmação do checkout | `value`, `currency` | `InitiateCheckout` |
| `purchase` | Página de confirmação, uma vez por encomenda paga | `transaction_id` (número da encomenda), `value`, `currency`, `tax`, `items` | `Purchase` |
| `briefing_start` | Primeira alteração no formulário do briefing | `project` | — |
| `briefing_submit` | Clique em «Envoyer le briefing» | `project` | — |
| `form_submit` | Envio do formulário de orçamento ou de uma página de campanha | `form` (`quote` ou `campaign`), `interest` | `Lead` |
| `contact` | Envio do formulário de contacto | `form`, `interest` | `Contact` |
| `subscribe` | Clique num botão de teste gratuito (`step = trial`); regresso após ativação paga (`step = activated`) | `plan`, `step` | `Subscribe` |
| `sign_up` | Criação de conta | — | `CompleteRegistration` |

Existe ainda um evento `cta_click` definido no código, mas nenhuma página o dispara.

**Conversão Google Ads.** Com `NEXT_PUBLIC_GOOGLE_ADS_ID` e `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` definidos e acordo de marketing, o evento `purchase` envia diretamente a conversão de compra ao Google Ads, com valor, moeda e número da encomenda. As outras conversões (leads, testes, registos) têm de ser importadas do GA4.

### Limites da medição a ter em conta

- **Só visitantes que aceitaram os cookies são medidos.** O GA4 e as plataformas de anúncios mostram menos do que a realidade. **A referência é o painel de administração**: encomendas, pagamentos, leads e subscrições.
- `purchase` só dispara se o cliente regressar à página de confirmação. Compare sempre com Admin → Commandes.
- `add_to_cart`, `begin_checkout`, `briefing_submit` e `subscribe` (passo `trial`) disparam **no clique**, mesmo que o servidor recuse a seguir (formulário incompleto, por exemplo). Podem sobrestimar ligeiramente.
- `sign_up` é enviado no momento em que o registo redireciona para a área de cliente: confirme no GA4 (DebugView) que chega de facto.
- O `page_view` é enviado pela plataforma em cada página e o GA4 também envia um automaticamente ao carregar: verifique se a primeira página de cada visita não fica contada duas vezes e, se ficar, desative o envio automático na configuração.
- As páginas de demonstração em ecrã inteiro (`/demo/<slug>`) não têm faixa de cookies nem medição. O interesse por um modelo mede-se pela sua ficha (`view_item`).
- **Atribuição dos leads:** os parâmetros `utm_*` do endereço são guardados durante 30 dias (com acordo de medição) e gravados em cada lead; o painel mostra `utm_source/utm_campaign`. **As encomendas e os registos não guardam UTM**: a atribuição das vendas vem do GA4 e das plataformas de anúncios, ou de um cupão por canal (secção 12).
- As quatro páginas de campanha enviam leads com o interesse `website`, `ecommerce` ou `software`. CRM e Pointage partilham `software`: distinga-os pelo `utm_campaign`.
- Receita em três moedas: analise por moeda, ou converta para CHF com uma taxa fixa escrita no relatório.

## 4. Pré-requisitos

Nada de anúncios enquanto esta lista não estiver completa.

### Produto e operação

- [ ] Site em produção, pagamentos reais ativos e percurso de compra testado (ver `ROADMAP.md`, «Antes do lançamento»).
- [ ] Preços, impostos e textos legais validados para cada mercado onde se vai anunciar. **Um mercado sem preços e fiscalidade validados não recebe orçamento**; a sua parte é redistribuída.
- [ ] `ALLOW_INDEXING=true` no domínio de produção.
- [ ] Capacidade de produção confirmada: quantos projetos a equipa consegue entregar por mês dentro dos prazos anunciados. Este número limita o ritmo das campanhas.
- [ ] Alguém responsável por responder aos leads, com prazo definido.

### Identificadores de medição

Definem-se nas variáveis de ambiente do servidor e exigem uma nova publicação da aplicação. O estado aparece em Admin → Paramètres → **Intégrations**.

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_GA4_ID` | Propriedade Google Analytics 4 |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Conta Google Ads |
| `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` | Rótulo da conversão «compra» |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel da Meta |
| `NEXT_PUBLIC_GTM_ID` | Tag Manager — **alternativa**, ver nota |

Nota sobre o Tag Manager: se `NEXT_PUBLIC_GTM_ID` estiver definido, substitui as etiquetas GA4 e Google Ads diretas; os eventos passam a ser apenas colocados no `dataLayer`, e as etiquetas, os acionadores, a conversão de compra do Google Ads e o respeito pelo acordo de marketing têm de ser configurados dentro do Tag Manager. **Para o lançamento, é mais simples não usar o Tag Manager** e definir diretamente os identificadores GA4 e Google Ads.

### Consentimento

- [ ] Faixa de cookies verificada em cada mercado: sem escolha, nenhuma etiqueta carrega; «medição» carrega o GA4; «marketing» ativa o Google Ads e o Meta Pixel.
- [ ] Política de cookies e política de privacidade a mencionar as ferramentas realmente usadas.
- [ ] Sem acordo de marketing, não há remarketing: as audiências serão mais pequenas do que o tráfego.

### Conversões

- [ ] No GA4, marcar como eventos principais: `purchase`, `form_submit`, `contact`, `subscribe`, `sign_up`. Criar uma dimensão personalizada para `step` (para separar `trial` de `activated`) e para `form` e `interest`.
- [ ] Ligar o GA4 ao Google Ads e importar `form_submit`, `contact` e `subscribe`. A compra é enviada diretamente pela plataforma; **não a importe também do GA4**, para não a contar duas vezes.
- [ ] No Meta, verificar no gestor de eventos a receção de `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `Lead`, `Subscribe`.
- [ ] Fazer uma compra de teste, um pedido de orçamento e um início de teste em cada mercado, e confirmar que aparecem no GA4, nas plataformas e no painel.

### Search Console

- [ ] Propriedade de domínio verificada; sitemap submetido; relatório de segmentação internacional (`hreflang`) sem erros.

## 5. Fase 1 — dias 1 a 30: fundações e primeiras campanhas de pesquisa

### Semana 1 — medição (sem anúncios)

- Fechar os pré-requisitos da secção 4.
- Criar um painel simples no GA4: sessões por mercado, funil `view_item` → `add_to_cart` → `begin_checkout` → `purchase`, leads por formulário, testes por plano.
- Preparar a folha de relatório semanal (secção 13).
- Criar no painel os cupões de atribuição, se o proprietário os aprovar (secção 12).

### Semanas 2 a 4 — Google Ads, rede de pesquisa

Uma campanha por mercado e, dentro dela, um grupo de anúncios por tema. Cada grupo aponta para a página de campanha correspondente, que já existe na plataforma:

| Tema | Slug | `/fr-ch` e `/fr-fr` | `/pt-pt` e `/pt-br` | Botão principal leva a |
|---|---|---|---|---|
| Site profissional | `site-internet` | `/fr-ch/offres/site-internet` | `/pt-pt/ofertas/site-internet` | Catálogo de modelos |
| Loja online | `boutique-en-ligne` | `/fr-ch/offres/boutique-en-ligne` | `/pt-pt/ofertas/boutique-en-ligne` | Catálogo filtrado em e-commerce |
| CRM | `logiciel-crm` | `/fr-ch/offres/logiciel-crm` | `/pt-pt/ofertas/logiciel-crm` | Página do ATHANA CRM |
| Pointage | `logiciel-pointage` | `/fr-ch/offres/logiciel-pointage` | `/pt-pt/ofertas/logiciel-pointage` | Página do ATHANA Pointage |

(Para França e Brasil, substituir o prefixo por `/fr-fr` e `/pt-br`.)

Características destas páginas: título, promessa, quatro argumentos, um botão para a oferta e um formulário «Être rappelé ou recevoir une proposition» que cria um lead. Não são indexadas pelos motores de pesquisa, o que é adequado para tráfego pago. Os slugs são em francês em todos os mercados.

Cada anúncio leva sempre os parâmetros de seguimento, por exemplo:

```
https://athana.ch/pt-pt/ofertas/site-internet?utm_source=google&utm_medium=cpc&utm_campaign=pt-pt_site-internet&utm_term={keyword}
```

Convenção: `utm_campaign = <mercado>_<slug>`; `utm_source` = `google`, `meta`, `prospecao`, `newsletter`…; `utm_medium` = `cpc`, `paid_social`, `email`…

**Ordem de ativação.** 150 CHF por semana repartidos por 16 grupos (4 mercados × 4 temas) dariam cerca de 1,30 CHF por dia a cada um, o que dificilmente gera dados utilizáveis. Proposta:

1. Semana 2: os dois temas de sites (`site-internet`, `boutique-en-ligne`) no mercado prioritário do proprietário.
2. Semana 3: os mesmos temas num segundo mercado.
3. Semana 4: os temas de software (`logiciel-crm`, `logiciel-pointage`) num mercado, **se** os testes gratuitos e a ativação paga estiverem validados em produção.
4. Os restantes grupos entram quando um grupo ativo for pausado ou quando a reserva for libertada.

Regra de trabalho para o orçamento diário de um grupo: só ativar um grupo se o seu orçamento diário cobrir vários cliques ao custo por clique **realmente observado** na primeira semana; caso contrário, concentrar.

Configuração mínima: correspondência de frase e exata; segmentação por país e por língua do mercado; lista de palavras-chave negativas desde o primeiro dia («gratuit / grátis», «emploi / emprego / vagas», «formation / curso», «tutoriel / tutorial», nomes de ferramentas de criação de sites de que não se quer tráfego); licitação manual ou de maximização de cliques com teto, até haver conversões suficientes para uma estratégia automática; extensões de ligação para o catálogo, a página de orçamento e as páginas dos programas.

### SEO — fundações (dias 1 a 30)

- Verificar na Search Console a indexação das páginas principais de cada mercado e corrigir o que surgir.
- Rever os títulos e descrições SEO das dez fichas de modelo (Admin → Catalogue → Produits) nas três línguas.
- Planear os artigos da fase 2 com as consultas reais que começarem a aparecer na Search Console e no relatório de termos de pesquisa do Google Ads.
- Publicar o primeiro artigo adicional por língua.

### Decisão do dia 30

Com os dados reais: fixar os valores-alvo da secção 2; calcular os primeiros custos por lead e por encomenda; confirmar ou alterar a repartição por mercado; decidir que grupos continuam.

## 6. Fase 2 — dias 31 a 60: Meta, remarketing e conteúdo

### Meta Ads (Facebook e Instagram)

Orçamento: 125 CHF por semana durante 8 semanas (semanas 5 a 12).

| Campanha | Público | Criativo | Destino | Objetivo |
|---|---|---|---|---|
| Descoberta por setor | Interesses e profissões ligados a um setor (restauração, saúde, imobiliário, beleza, construção…), no país do mercado | Vídeo curto da demonstração do modelo desse setor | Ficha do modelo (`/modeles/<slug>` ou `/modelos/<slug>`), com UTM | `ViewContent` e `AddToCart` no início; `Purchase` ou `Lead` quando houver volume |
| Loja online | Pequenas marcas e criadores | Vídeo da demonstração Boutique Nord | `/offres/boutique-en-ligne` | `Lead` |
| Software | Gestores de PME | Gravação de ecrã do CRM ou do Pointage com dados fictícios | `/offres/logiciel-crm`, `/offres/logiciel-pointage` | `Subscribe` |

Começar com um ou dois setores por mercado — os que tiverem mostrado mais interesse na fase 1 (`view_item` por modelo) — e acrescentar os outros apenas com dados.

Enviar para a **ficha do modelo** e não para a demonstração em ecrã inteiro: a ficha contém a demonstração, o configurador e a medição; a página `/demo/<slug>` não mede nada.

### Remarketing

Só é possível com visitantes que aceitaram os cookies de marketing; o tamanho das audiências tem de ser verificado antes de lhes atribuir orçamento. Se uma audiência for demasiado pequena para ser servida, o orçamento volta à descoberta.

| Audiência | Definição | Mensagem |
|---|---|---|
| Viram um modelo, não adicionaram | `ViewContent` sem `AddToCart` | O mesmo modelo, com o prazo e o preço «a partir de» |
| Adicionaram, não compraram | `AddToCart` ou `InitiateCheckout` sem `Purchase` | Lembrete do carrinho; eventualmente um cupão com data limite, se o proprietário aprovar |
| Visitaram uma página de software sem iniciar teste | Visita a `/logiciels/…` ou `/software/…` sem `Subscribe` | Teste gratuito sem cartão |

No Google Ads, o equivalente (listas de remarketing para anúncios de pesquisa) pode ser acrescentado aos grupos existentes sem orçamento próprio.

### SEO e conteúdo

Um artigo por palavra-chave do caderno de encargos, na língua e no mercado indicados, cada um com ligações internas para a página de oferta correspondente:

| Palavra-chave | Língua do artigo | Página a reforçar |
|---|---|---|
| création site internet Suisse | `fr` | `/fr-ch/sites-web` e catálogo |
| création boutique en ligne | `fr` | `/fr-ch/e-commerce`, ficha Boutique Nord |
| logiciel CRM PME | `fr` | `/fr-ch/logiciels/crm` |
| logiciel de pointage | `fr` | `/fr-ch/logiciels/pointage` |
| criação de sites profissionais | `pt-PT` e `pt-BR` | `/pt-pt/sites`, `/pt-br/sites` |
| criação de lojas virtuais | `pt-BR` | `/pt-br/lojas-virtuais` |
| software CRM | `pt-PT` e `pt-BR` | `/pt-pt/software/crm`, `/pt-br/software/crm` |
| sistema de ponto eletrônico | `pt-BR` | `/pt-br/software/pointage` |

Notas:

- «Lojas virtuais» e «ponto eletrônico» são expressões do português do Brasil. Para Portugal, as variantes naturais («lojas online», «registo de ponto») devem ser confirmadas num planeador de palavras-chave antes de escrever; nenhum volume de pesquisa foi verificado para este plano.
- Os artigos em francês são partilhados pelos mercados `/fr-ch` e `/fr-fr`: um artigo centrado na Suíça também aparece no blog francês.
- Os artigos criam-se em Admin → Contenu → Blog, um por língua, com a mesma **Clé de traduction** nas versões do mesmo tema, para as ligações `hreflang`.
- Cada artigo deve responder a uma pergunta concreta (preço, prazo, modelo ou à medida, o que preparar antes de encomendar) e não fazer promessas que as condições de venda não sustentem.
- Ritmo proposto: 8 artigos em 5 semanas (4 em francês, 4 em português, adaptando os temas comuns a pt-PT e pt-BR).

### Decisão do dia 60

Comparar canais, mercados e temas pelos custos reais por lead, por encomenda paga e por teste iniciado; decidir a utilização da reserva (secção 7).

## 7. Fase 3 — dias 61 a 90: otimização e reserva

### Otimização

- Relatório de termos de pesquisa todas as semanas: acrescentar negativas, isolar em grupos próprios os termos que convertem.
- Testar uma variação de cada vez (título do anúncio, primeiro segundo do vídeo, modelo mostrado).
- Rever as páginas de campanha com os dados do funil: se muitos visitantes clicam no botão principal e poucos preenchem o formulário, o problema pode estar na etapa seguinte (ficha, configurador, checkout) e não no anúncio.
- Cruzar com a operação: de que canal vêm os leads que a equipa qualifica e os clientes cujos projetos correm bem.

### Regras de realocação

Os limiares são hipóteses de trabalho, a ajustar pelo proprietário.

| Situação observada | Ação |
|---|---|
| Um grupo gastou mais de 2 × o custo máximo por lead (ou por encomenda) sem nenhuma conversão | Pausar e redistribuir o orçamento |
| Um grupo tem custo por conversão abaixo do máximo, com pelo menos algumas conversões confirmadas no painel | Aumentar o orçamento por etapas (por exemplo +20 % por semana) enquanto o custo se mantiver |
| Um mercado não tem nenhuma encomenda nem lead qualificado ao dia 60 | Reduzir ao mínimo ou pausar; investigar preço, língua e meios de pagamento antes de voltar a investir |
| Muitos cliques e poucos `view_item` ou formulários | Problema de página ou de correspondência entre anúncio e oferta: corrigir antes de gastar mais |
| Muitos `begin_checkout` e poucos `purchase` | Problema de pagamento (meios disponíveis, confiança, preço com imposto): investigar com as encomendas não pagas do painel |
| A equipa já não consegue cumprir os prazos | Pausar a aquisição de sites; manter software e conteúdo |

### Utilização da reserva (2 000 CHF)

A reserva **não é para gastar por omissão**. Só é libertada por decisão do proprietário, em parcelas de até 500 CHF por semana (semanas 10 a 13), e só se:

1. a medição estiver validada (as conversões das plataformas batem certo com o painel, dentro da diferença explicada pelo consentimento);
2. existir pelo menos uma combinação canal × mercado × tema com custo por encomenda ou por lead qualificado **medido** abaixo do máximo calculado na secção 2;
3. a capacidade de produção permitir absorver mais encomendas.

Destinos possíveis, por ordem: reforçar as combinações que cumprem a condição 2; produzir criativos adicionais para elas; abrir um mercado ou tema ainda não testado. Se as condições não se verificarem, a reserva fica por gastar e transita para o período seguinte — é um resultado válido.

### Balanço do dia 90

Um documento de uma página: o que foi gasto por linha, resultados por mercado e por tema (encomendas, leads, testes, custos unitários reais), o que se aprendeu, e a proposta para os 90 dias seguintes.

## 8. Orçamento semanal por canal e por mercado

Semanas 1–4 ≈ dias 1–30; semanas 5–9 ≈ dias 31–60; semanas 10–13 ≈ dias 61–90. Valores em CHF.

### Por canal

| Semana | Google Ads | Meta Ads | SEO e conteúdo | Vídeos e criativos | Prospeção | Total da semana | Reserva (máximo, sob decisão) |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 50 | 0 | 25 | 75 | — |
| 2 | 150 | 0 | 50 | 0 | 25 | 225 | — |
| 3 | 150 | 0 | 50 | 150 | 25 | 375 | — |
| 4 | 150 | 0 | 50 | 150 | 25 | 375 | — |
| 5 | 150 | 125 | 80 | 60 | 40 | 455 | — |
| 6 | 150 | 125 | 80 | 60 | 40 | 455 | — |
| 7 | 150 | 125 | 80 | 60 | 40 | 455 | — |
| 8 | 150 | 125 | 80 | 60 | 40 | 455 | — |
| 9 | 150 | 125 | 80 | 60 | 40 | 455 | — |
| 10 | 150 | 125 | 50 | 50 | 50 | 425 | 500 |
| 11 | 150 | 125 | 50 | 50 | 50 | 425 | 500 |
| 12 | 150 | 125 | 50 | 0 | 50 | 375 | 500 |
| 13 | 150 | 0 | 50 | 0 | 50 | 250 | 500 |
| **Total** | **1 800** | **1 000** | **800** | **700** | **500** | **4 800** | **2 000** |

4 800 + 2 000 de reserva + 2 300 de plataforma e checkout + 900 de catálogo e demonstrações = 10 000 CHF.

Os vídeos são produzidos nas semanas 3 e 4 para estarem prontos no arranque da Meta na semana 5. Na semana 13 a Meta só continua se a reserva for libertada.

### Por mercado (média paga)

Hipótese de partida, **a decidir pelo proprietário** e a rever no dia 30: 40 % para a Suíça francófona (mercado de origem, moeda de referência dos preços) e 20 % para cada um dos outros três.

| Mercado | Parte | Google Ads / semana (semanas 2–13) | Total Google | Meta Ads / semana (semanas 5–12) | Total Meta | Total do mercado |
|---|---:|---:|---:|---:|---:|---:|
| `/fr-ch` — Suíça | 40 % | 60 | 720 | 50 | 400 | 1 120 |
| `/fr-fr` — França | 20 % | 30 | 360 | 25 | 200 | 560 |
| `/pt-pt` — Portugal | 20 % | 30 | 360 | 25 | 200 | 560 |
| `/pt-br` — Brasil | 20 % | 30 | 360 | 25 | 200 | 560 |
| **Total** | 100 % | **150** | **1 800** | **125** | **1 000** | **2 800** |

Um mercado que não esteja pronto (preços, impostos, meios de pagamento, textos revistos) não é ativado, e a sua parte é somada aos mercados ativos. Com poucos mercados ativos, o orçamento por grupo de anúncios fica mais próximo de um nível que permite aprender.

## 9. Estrutura de palavras-chave e grupos de anúncios

Uma campanha de pesquisa por mercado; quatro grupos por campanha. As palavras-chave de partida são as do caderno de encargos; as variantes a acrescentar saem do planeador de palavras-chave e, depois, do relatório de termos de pesquisa. **Nenhum volume nem custo foi verificado.**

### Campanhas em francês — `/fr-ch` e `/fr-fr`

| Grupo | Palavra-chave de partida | Variantes a validar | Página de destino |
|---|---|---|---|
| Site internet | création site internet Suisse *(só `/fr-ch`)* | création site internet, création site web entreprise, site vitrine professionnel, agence web + cidade | `/offres/site-internet` |
| Boutique en ligne | création boutique en ligne | créer site e-commerce, création site de vente en ligne | `/offres/boutique-en-ligne` |
| CRM | logiciel CRM PME | CRM simple PME, logiciel gestion clients, CRM petite entreprise | `/offres/logiciel-crm` |
| Pointage | logiciel de pointage | pointeuse en ligne, gestion des temps, application de pointage | `/offres/logiciel-pointage` |

Para `/fr-fr`, retirar «Suisse» e não segmentar por cidades suíças.

### Campanhas em português — `/pt-pt` e `/pt-br`

| Grupo | Palavra-chave de partida | Variantes a validar | Página de destino |
|---|---|---|---|
| Sites | criação de sites profissionais | criação de sites, criar site para empresa, site institucional | `/ofertas/site-internet` |
| Lojas | criação de lojas virtuais *(pt-BR)* | criar loja virtual; para Portugal: criação de lojas online, criar loja online | `/ofertas/boutique-en-ligne` |
| CRM | software CRM | CRM para pequenas empresas, CRM para PME, sistema de gestão de clientes | `/ofertas/logiciel-crm` |
| Ponto | sistema de ponto eletrônico *(pt-BR)* | controle de ponto online; para Portugal: registo de ponto, software de assiduidade | `/ofertas/logiciel-pointage` |

Regras:

- Não misturar grafias: anúncios e palavras-chave em português do Brasil só na campanha `/pt-br`, em português europeu só na campanha `/pt-pt`.
- Três a cinco palavras-chave por grupo no início; mais do que isso dispersa um orçamento pequeno.
- Os textos dos anúncios só podem afirmar o que o site mostra: demonstração visível antes da compra, preço fixo, prazo estimado em dias úteis, teste gratuito sem cartão, cancelamento online. Qualquer preço no anúncio tem de coincidir com o do mercado (por exemplo o «a partir de» do catálogo), que por sua vez tem de estar validado.
- **Regime jurídico do registo de ponto no Brasil:** antes de anunciar «ponto eletrônico», confirmar com um especialista se o ATHANA Pointage cumpre as exigências locais aplicáveis a esses sistemas. Sem essa confirmação, não ativar este grupo em `/pt-br`.

## 10. Lista de criativos

Tudo o que mostra o produto é feito a partir das demonstrações e dos ecrãs reais; nada de resultados de clientes, números ou testemunhos inventados.

| # | Criativo | Formato | Origem | Língua | Fase |
|---|---|---|---|---|---|
| 1 | Vídeo «um modelo em 20 segundos», um por setor prioritário (começar por 3) | Vertical 9:16 e quadrado 1:1, 15–30 s | Gravação de ecrã da demonstração (`/demo/<slug>`), em computador e telemóvel | fr, pt | Produção semanas 3–4 |
| 2 | Vídeo «como funciona»: escolher → encomendar → briefing → validar | 30–45 s | Gravação do percurso real em modo de teste, com dados fictícios | fr, pt | Semanas 3–4 |
| 3 | Vídeo da loja online (Boutique Nord): catálogo, ficha, carrinho | 15–30 s | Demonstração | fr, pt | Semana 5 |
| 4 | Gravação do ATHANA CRM: pipeline, contacto, proposta | 20–30 s | Empresa de demonstração com dados fictícios | fr, pt | Semanas 5–6 |
| 5 | Gravação do ATHANA Pointage: registo de ponto no telemóvel, relatório | 20–30 s | Empresa de demonstração com dados fictícios | fr, pt | Semanas 5–6 |
| 6 | Imagens estáticas por modelo | 1:1 e 4:5 | Capturas já existentes em `public/images/catalog/<slug>/` | fr, pt | Semana 4 |
| 7 | Carrossel «10 modelos» | 1:1 | As dez capas do catálogo | fr, pt | Semana 5 |
| 8 | Variações de remarketing (lembrete do modelo visto, teste gratuito) | 1:1 | Derivadas de 1, 4 e 5 | fr, pt | Semana 6 |
| 9 | Textos dos anúncios de pesquisa: 4 temas × línguas | Texto | Argumentos das páginas de campanha | fr, pt-PT, pt-BR | Semana 1 |
| 10 | Imagens de capa dos artigos | 1200 × 630 | Capturas das demonstrações | — | Fase 2 |

Pontos a resolver antes da produção:

- **Língua das demonstrações.** Nove das dez demonstrações têm o conteúdo em francês; só «Lena Moreau» está em português. Um vídeo de uma demonstração em francês mostrado em Portugal ou no Brasil enfraquece a mensagem. Opções: usar apenas a demonstração portuguesa nos mercados lusófonos no início; produzir versões portuguesas das demonstrações prioritárias (linha «Catálogo e demonstrações» do orçamento); ou centrar os vídeos nos elementos visuais com legendas em português.
- Os 700 CHF pressupõem produção interna (gravação de ecrã, montagem simples, legendas). Uma produção externa tem de ser orçamentada antes.
- Legendas sempre visíveis; versões separadas para pt-PT e pt-BR quando o texto diferir.

## 11. Prospeção por setor

Contacto direto e personalizado com empresas de um setor, mostrando o modelo desse setor.

### Setores e modelos

| Setor | Modelo a mostrar | Argumento próprio do modelo |
|---|---|---|
| Restaurantes, bistrôs, catering | Maison Lumière | Carta filtrável e pedido de reserva |
| Consultórios e clínicas | Clinique Alba | Especialidades, equipa, pedido de consulta |
| Agências imobiliárias | Helvetia Immo | Catálogo de imóveis com filtros, pedido de avaliação |
| Salões de beleza, spas, institutos | Studio Éclat | Tratamentos e preços, pedido de marcação |
| Construção e renovação | BatiPro | Obras realizadas, formulário de orçamento detalhado |
| Agências de viagens e turismo | Alpina Voyages | Destinos filtráveis, pedido de informações |
| Marcas e criadores (venda online) | Boutique Nord | Catálogo, ficha de produto, carrinho |
| Escritórios, contabilistas, consultoras | Cabinet Méridien | Áreas de especialização, equipa, publicações |
| Criativos, designers, fotógrafos | Lena Moreau | Casos de estudo, portfólio |
| Serviços B2B, lançamento de um produto | Atelier | Página única orientada para a conversão |

### Método

1. **Escolher um setor e uma zona por semana** (uma cidade ou região de um mercado ativo). Começar pelos setores cujos modelos tiveram mais `view_item`.
2. **Construir uma lista curta e qualificada** a partir de fontes públicas (diretórios profissionais, mapas, redes sociais das empresas): empresas sem site, com um site antigo ou não adaptado ao telemóvel. Registar o que se observou — é a base da mensagem.
3. **Registar os contactos no ATHANA CRM** da própria ATHANA: uma empresa e um contacto por prospeto, um pipeline «Prospeção» com etapas (identificado, contactado, respondeu, proposta, ganho, perdido), uma tarefa de seguimento para cada um. É também a melhor forma de testar o produto em condições reais.
4. **Mensagem individual e curta**: uma observação concreta sobre a presença online da empresa, a ligação para a ficha do modelo do seu setor, o preço «a partir de» e o prazo estimado, e uma pergunta simples. Sem promessas de resultados.
5. **Ligação com seguimento**, para a **ficha do modelo** (que inclui a demonstração e é medida), não para `/demo/<slug>`:
   `https://athana.ch/fr-ch/modeles/maison-lumiere?utm_source=prospection&utm_medium=email&utm_campaign=fr-ch_restaurants`
6. **Um único seguimento**, alguns dias depois; sem resposta, parar.
7. **Respostas**: os pedidos que chegarem pelos formulários aparecem em Admin → Leads com a origem; os que chegarem por e-mail ou telefone registam-se à mão no CRM.

Ritmo: fixar um número semanal de contactos compatível com mensagens realmente personalizadas e com a capacidade de resposta da equipa, e mantê-lo constante para poder comparar semanas. Poucas mensagens bem preparadas valem mais do que um envio em massa.

Indicadores: taxa de resposta = respostas ÷ contactos; taxa de proposta = propostas ÷ respostas; taxa de venda = encomendas ÷ propostas; custo por encomenda = (ferramentas + horas × custo horário) ÷ encomendas. Todos a medir.

### Regras a respeitar

- **Legislação sobre comunicações comerciais não solicitadas e proteção de dados**: as regras diferem entre a Suíça, a UE (França, Portugal) e o Brasil, e entre e-mail, telefone e redes sociais. Validar com o jurista o que é permitido em cada mercado **antes** do primeiro envio.
- Usar apenas contactos profissionais publicados pela própria empresa; identificar claramente a ATHANA; oferecer uma forma simples de recusar novos contactos e respeitá-la de imediato (marcar o contacto como «Inativo» no CRM).
- Sem compra de listas e sem envios automáticos em massa a partir do domínio principal: prejudicam a entrega dos e-mails transacionais (confirmações de encomenda, avisos de projeto).
- Os 500 CHF da linha cobrem ferramentas (por exemplo, uma caixa de correio dedicada) e não a compra de dados.

## 12. Cupões e campanhas no painel

Os cupões gerem-se em Admin → **Finance → Coupons** (`ADMIN_GUIDE.md`, secção 11). Dar ou não descontos é uma decisão comercial do proprietário; o plano funciona sem eles.

### Usos possíveis

| Uso | Como configurar |
|---|---|
| **Atribuição por canal** | Um código por canal e mercado, com o campo **Campagne** preenchido (por exemplo `google_fr-ch`). A coluna **Utilisations** mostra quantas encomendas **pagas** o usaram. Compensa a falta de UTM nas encomendas e a perda de medição por falta de consentimento. |
| **Oferta de lançamento com prazo** | Percentagem, com **Fin** e **Utilisations maximales** definidos. |
| **Recuperação de carrinho** (remarketing) | Código próprio, validade curta. |
| **Prospeção** | Um código por setor ou por vaga de contactos. |

### Regras da plataforma a ter em conta

- Códigos de 3 a 30 caracteres: letras, algarismos, hífen e sublinhado (por exemplo `BEMVINDO10`, `META-PT`).
- **Percentagem**: funciona em todas as moedas. **Montante fixo**: vale numa só moeda — são precisos três códigos para CHF, EUR e BRL.
- O limite de utilizações é global, não por cliente; um cupão não se restringe a um produto ou a um mercado. Um código publicado num anúncio pode circular: fixe sempre uma data de fim e um máximo de utilizações.
- O desconto aplica-se a modelos e opções, antes do imposto. **Não se aplica às subscrições de software.**
- O cliente escreve o código no carrinho; não há aplicação automática a partir de uma ligação.
- Desativar um cupão é imediato (caixa **Actif**).

### Outros instrumentos do painel

- **Banner** (Contenu → Bannières): faixa no topo do site com mensagem nas três línguas, ligação interna e datas de início e fim — para anunciar uma oferta de lançamento em coerência com os anúncios.
- **Leads** (Ventes → Leads): origem da campanha visível em cada lead; estados Nouveau → Contacté → Qualifié → Clos para medir a qualidade por canal.
- **Páginas de campanha**: existem quatro, definidas no código (`src/modules/content/campaigns.ts`). Criar uma nova página (por exemplo, por setor) ou alterar os textos exige um programador; correções pontuais de texto fazem-se em Contenu → Traductions.
- **Testemunhos**: só reais e com acordo. Os primeiros clientes satisfeitos são a fonte; pedir o acordo por escrito no fim do projeto.

## 13. Relatórios e cadência

| Frequência | Quem | O quê |
|---|---|---|
| Diária (5 minutos, durante campanhas ativas) | Responsável pelas campanhas | Despesa do dia face ao orçamento; anúncios reprovados; leads novos em Admin → Leads atribuídos e respondidos |
| Semanal (30 minutos, segunda-feira) | Responsável + proprietário | Folha semanal (abaixo); termos de pesquisa e negativas; decisões de pausa ou reforço dentro do orçamento da semana |
| Dias 30 e 60 | Proprietário | Revisão de fase: valores-alvo, repartição por mercado, utilização da reserva |
| Dia 90 | Proprietário | Balanço e proposta para o período seguinte |

### Folha semanal (uma linha por canal × mercado × tema)

| Coluna | Fonte |
|---|---|
| Despesa (moeda da plataforma e CHF) | Google Ads, Meta |
| Impressões, cliques, custo por clique real | Google Ads, Meta |
| Sessões na página de destino | GA4 |
| `view_item`, `add_to_cart`, `begin_checkout`, `purchase` | GA4 |
| Leads recebidos e leads qualificados | Admin → Leads (por `utm_source/utm_campaign`) |
| Encomendas pagas e montante, por moeda | Admin → Commandes; cupões em Finance → Coupons |
| Testes iniciados, subscrições ativadas | Admin → Abonnements |
| Custo por lead, por encomenda, por teste | Calculado |
| Decisão da semana | — |

Fonte de verdade para dinheiro e encomendas: o painel de administração e as exportações CSV de Admin → Paiements & rapports. As plataformas de anúncios servem para comparar anúncios entre si, não para contar receita.

Registar também, todas as semanas, a diferença entre as conversões vistas pelo GA4 e as encomendas do painel: dá a ordem de grandeza da perda de medição por falta de consentimento, a aplicar na leitura dos outros números.

## 14. Riscos e pontos de atenção

| Risco | Consequência | Prevenção |
|---|---|---|
| Lançar anúncios antes de a medição estar validada | Orçamento gasto sem aprendizagem | Semana 1 sem anúncios; compras e leads de teste em cada mercado |
| Orçamento demasiado disperso | Nenhum grupo com dados suficientes | Ativação por etapas; menos mercados e temas em simultâneo |
| Preços e impostos não validados num mercado | Vendas com preço errado ou sem imposto | Mercado sem validação não recebe orçamento; fechar o mercado em Paramètres → Marchés se necessário |
| Meios de pagamento locais indisponíveis | Abandono no pagamento | Verificar na conta Stripe o que está ativo por país antes de anunciar nesse país |
| Demonstrações em francês para públicos lusófonos | Mensagem menos convincente | Ver secção 10 |
| Traduções portuguesas não revistas | Imagem pouco cuidada | Revisão por falantes nativos antes de anunciar em `/pt-pt` e `/pt-br` |
| Promessas de prazo que a equipa não cumpre | Reembolsos e má reputação | Ligar o ritmo das campanhas à capacidade de produção |
| Sem testemunhos nem realizações reais | Menos confiança | Recolher os primeiros com acordo; não inventar |
| Subscrições sem imposto, sem fatura e sem mudança de plano | Atrito com os primeiros clientes de software | Campanhas de software só depois de fechadas as decisões de `BUSINESS_CONFIGURATION.md` |
| Prospeção não conforme com a lei local | Queixas, bloqueio do domínio de e-mail | Validação jurídica prévia; volumes baixos; mensagens individuais |
| Leitura otimista de poucos dados | Decisões erradas de reforço | Decidir com as encomendas do painel; não extrapolar a partir de uma ou duas conversões |
