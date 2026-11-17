# Integrações externas

Estado de cada integração, o que o proprietário tem de fornecer e os passos de configuração. Nenhuma integração foi ligada a contas reais: não havia chaves no ambiente onde o código foi escrito.

## 1. Quadro de estado

| Integração | Estado | Verificação feita | O que falta |
|---|---|---|---|
| Stripe — pagamento único (Checkout alojado) | Implementado | Mapeamento de eventos testado com eventos sintéticos assinados | **Nunca testado contra a API do Stripe.** Chaves do proprietário e ensaio em modo de teste. |
| Stripe — subscrições (Checkout alojado) | Implementado | Idem (evento `invoice.paid`) | Idem; ver limitações na secção 2. |
| Stripe — reembolsos | Implementado para pagamentos de encomendas | Lógica interna testada com o fornecedor de teste | Chamada real por testar. Pagamentos de subscrições Stripe são recusados no backoffice: reembolsar no painel do Stripe. |
| Meios de pagamento (cartões, TWINT, Multibanco, MB WAY, Pix) | Sem código próprio: ativam-se no Stripe Dashboard | — | Elegibilidade depende do país da conta. **A verificar com o Stripe.** |
| PayPal | **Não implementado** | — | Escrever um adaptador. |
| Fornecedor de pagamento de teste (sandbox) | Implementado | Testes Vitest e E2E | Nada. Nunca usar em produção. |
| E-mail Resend | Implementado | Não testado com chave real | Chave API e verificação do domínio. |
| E-mail em modo `log` | Implementado | Testes Vitest e E2E | Nada. |
| Google Analytics 4 | Carregador implementado, dependente de consentimento | Não testado com identificador real | Identificador e nova compilação. |
| Google Tag Manager | Carregador implementado | Não testado | Identificador, contentor configurado, nova compilação. |
| Google Ads | Etiqueta base e conversão de compra implementadas (sem GTM) | Não testado com identificadores reais | Identificador, etiqueta de conversão, nova compilação. Ver secção 7. |
| Meta Pixel | Carregador implementado | Não testado | Identificador e nova compilação. |
| Armazenamento de ficheiros | Disco local implementado; **S3 não implementado** | Testes Vitest | Volume persistente; adaptador S3 se necessário. |
| Tarefa diária (cron) | Endpoint implementado | E2E verifica a recusa sem segredo; a lógica de faturação e de retenção é testada em Vitest | Agendar a chamada. |
| Fluxo IA / Claude | Exportação JSON do brief implementada | Teste Vitest da redação | **Nada é enviado a nenhum serviço de IA.** O uso é manual. |
| Stripe Tax, faturação eletrónica, contabilidade | Não implementado | — | — |

## 2. Stripe

Ficheiros: `src/modules/payments/stripe-provider.ts`, `src/modules/payments/service.ts`, `src/app/api/webhooks/stripe/route.ts`.

### O que está feito

**Pagamento único.** `createCheckout` cria uma sessão `mode: 'payment'` com uma única linha cujo valor é o total da encomenda calculado pela ATHANA (descontos e impostos incluídos), `metadata.orderId` e idioma do checkout segundo o locale. Não é usada chave de idempotência fixa: cada tentativa de pagamento (incluindo "pagar de novo" depois de uma falha) cria uma sessão nova e a encomenda passa a apontar para ela. O cliente é redirecionado para `checkout.stripe.com` e volta a `/checkout/success?order=…`. A página de sucesso não confirma o pagamento: mostra "pagamento em confirmação" até o webhook chegar.

**Subscrições.** `createSubscriptionCheckout` cria uma sessão `mode: 'subscription'` com preço mensal em linha (`price_data` com `recurring: { interval: 'month' }`), no valor de `subscriptionAmount()` (preço base + lugares acima dos incluídos) e `metadata.subscriptionId`. Não são usados objetos *Price* criados no Dashboard; a coluna `Plan.stripePriceIds` existe mas não é lida.

**Reembolsos.** `refund` chama `refunds.create` com o `payment_intent` e chave de idempotência. `refundPayment` recusa pagamentos de subscrições Stripe ("Les paiements d’abonnement se remboursent depuis le tableau de bord du prestataire de paiement.").

**Cancelamento.** `setCancelAtPeriodEnd` atualiza `cancel_at_period_end` na subscrição Stripe.

### Mapeamento de webhooks (`mapStripeEvent`)

| Evento Stripe | Condição | Evento interno | Efeito |
|---|---|---|---|
| `checkout.session.completed`, `checkout.session.async_payment_succeeded` | `mode = payment`, com `metadata.orderId` e `payment_status = paid` | `checkout.completed` | Encomenda paga, fatura, projetos em briefing. |
| idem | `payment_status ≠ paid` (método diferido, por exemplo Multibanco) | ignorado | Espera por `async_payment_succeeded`. |
| idem | `mode = subscription`, com `metadata.subscriptionId` | `subscription.activated` | Subscrição `ACTIVE`; o fim do período é lido da subscrição Stripe. |
| `checkout.session.async_payment_failed` | com `metadata.orderId` | `checkout.failed` | Encomenda `PAYMENT_FAILED`. |
| `checkout.session.expired` | com `metadata.orderId` | `checkout.expired` | Encomenda `PAYMENT_FAILED`. |
| `charge.refunded` | — | `refund.updated` | Atualiza o montante reembolsado e o estado. |
| `invoice.paid` | com subscrição e `billing_reason ≠ subscription_create` | `subscription.renewed` | Novo período, pagamento registado. |
| `invoice.payment_failed` | com subscrição | `subscription.payment_failed` | Subscrição `PAST_DUE`, e-mail ao proprietário da organização. |
| `customer.subscription.updated` | — | `subscription.updated` | Sincroniza cancelamento agendado e fim do período. |
| `customer.subscription.deleted` | — | `subscription.canceled` | Subscrição `CANCELED`. |
| qualquer outro | — | ignorado | Resposta 200 sem efeitos. |

A leitura do fim do período e da subscrição de uma fatura aceita os dois formatos que a API do Stripe usou em versões diferentes.

### O que foi testado e o que não foi

Testado (`tests/platform.test.ts`, "Stripe adapter: verifies signatures and maps events"): construção e verificação de um evento com assinatura gerada por `stripe.webhooks.generateTestHeaderString`, rejeição com segredo errado, e o mapeamento de quatro casos (pagamento concluído, pagamento ainda não pago, renovação, evento desconhecido).

**Não testado:** qualquer chamada à API do Stripe — criação de sessões, redirecionamento real, receção de webhooks reais, reembolsos, subscrições, cancelamento, métodos diferidos, o formato exato dos objetos na versão da API da conta.

### Pontos a validar no ensaio (riscos identificados na leitura do código)

| Ponto | Detalhe |
|---|---|
| Nova tentativa de pagamento da mesma encomenda | Cada tentativa cria uma sessão Stripe nova. A sessão anterior continua válida no Stripe até expirar; se o cliente pagar nas duas, o segundo evento encontra a encomenda já paga e é ignorado pela plataforma, mas **o dinheiro foi cobrado duas vezes** e tem de ser reembolsado à mão. Testar "pagamento falhado → pagar de novo" e considerar expirar a sessão anterior. |
| Reembolso de pagamentos de subscrição | **Limitação.** Estes pagamentos são guardados com a referência da fatura (`inv_first_<id>` ou o id da fatura), não com um `payment_intent`. O backoffice recusa o reembolso com mensagem explícita; faz-se no painel do Stripe. O evento `charge.refunded` resultante não fica ligado ao pagamento na plataforma: o montante reembolsado não aparece nos registos nem na exportação financeira. |
| Número de lugares do Pointage | `Subscription.seats` é atualizado na base de dados quando se criam ou desativam funcionários, mas o valor mensal no Stripe é fixado no momento do checkout e **não é atualizado depois**. |
| Mudança de plano com subscrição Stripe ativa | Recusada pelo código ("via suporte"); tem de ser feita à mão no Dashboard. |
| Período de teste | É gerido pela ATHANA (`TRIALING` sem dados de pagamento), não pelo Stripe. A cobrança só começa quando o cliente ativa. |
| Impostos | O Stripe recebe o total já com imposto; não há Stripe Tax nem faturas Stripe para encomendas. |
| Cliente Stripe | As sessões usam `customer_email`; cada checkout pode criar um novo *Customer*. Não há portal de cliente Stripe. |

### O que o proprietário tem de fornecer

- Conta Stripe ativada (dados da empresa, conta bancária).
- `STRIPE_SECRET_KEY` (teste e produção).
- `STRIPE_WEBHOOK_SECRET` de cada endpoint (staging e produção).

### Passos

1. Criar a conta em stripe.com e concluir a ativação.
2. Em modo de teste: copiar `sk_test_…` para o ambiente de staging; `PAYMENTS_MODE=stripe`.
3. Registar o endpoint `https://<staging>/api/webhooks/stripe` com os nove eventos listados em [DEPLOYMENT.md](DEPLOYMENT.md), secção 7; copiar o `whsec_…`.
4. Ensaiar com os cartões de teste do Stripe: compra concluída, cartão recusado e nova tentativa, sessão abandonada, reembolso parcial e total a partir do backoffice, ativação de subscrição, renovação (relógio de teste do Stripe), falha de renovação, cancelamento e retoma.
5. Em cada passo, confirmar o estado na base de dados, o e-mail em `EmailLog` e a resposta 200 em Developers → Webhooks.
6. Só depois repetir com as chaves reais em produção, com uma compra real de baixo valor seguida de reembolso.

## 3. Meios de pagamento

O código não escolhe meios de pagamento: a sessão de checkout não define `payment_method_types`, pelo que o Stripe apresenta os que estiverem ativos em Settings → Payment methods e forem compatíveis com a moeda e o país do comprador.

| Meio | Mercado alvo | Observação |
|---|---|---|
| Cartões | Todos | Disponível por omissão. |
| TWINT | Suíça (CHF) | Depende do país da conta. **A verificar com o Stripe.** |
| Multibanco | Portugal (EUR) | Pagamento diferido: a encomenda só é cumprida quando chega `async_payment_succeeded`. O mapeamento existe; **não foi testado**. **A verificar.** |
| MB WAY | Portugal (EUR) | **A verificar.** |
| Pix | Brasil (BRL) | Em regra exige uma entidade brasileira ou um programa específico do Stripe. **A verificar.** |

A elegibilidade depende do país da entidade titular da conta Stripe e muda com o tempo; a lista `PROVIDER_NOTES` em `src/modules/payments/types.ts` é apenas uma nota de intenção, não é usada pelo código. Nem todos os meios suportam subscrições.

A lista de meios mostrada ao cliente na página de checkout vem de `Market.paymentMethods` (Admin → Definições → Mercados). É **informativa**: preenchê-la não ativa nada no Stripe, e convém que corresponda ao que está realmente ativo.

## 4. PayPal

**Não implementado.** Existe a interface `PaymentProvider` (`src/modules/payments/types.ts`), que um adaptador PayPal teria de cumprir. Trabalho necessário: escrever `paypal-provider.ts` (criação de ordem e de subscrição, reembolso, verificação da assinatura do webhook, mapeamento para `PaymentEvent`), alargar os tipos `id: 'stripe' | 'test'` e `processWebhook`, acrescentar a rota `/api/webhooks/paypal`, permitir ao cliente escolher o fornecedor no checkout (hoje há um só fornecedor ativo, definido por `PAYMENTS_MODE`) e ajustar o `form-action` da CSP.

## 5. Fornecedor de teste (sandbox)

Ficheiro: `src/modules/payments/test-provider.ts`. Ativo com `PAYMENTS_MODE=test`.

- O checkout leva a `/<locale>/sandbox-payment`, identificada como pagamento de teste, com botões para simular sucesso ou recusa.
- O botão gera um evento assinado (HMAC derivado de `SESSION_SECRET`) e passa-o por `processWebhook`: o mesmo caminho dos eventos Stripe, com idempotência e verificação de montante.
- `POST /api/webhooks/test` aceita eventos com o cabeçalho `x-athana-signature`; responde 404 fora do modo de teste.
- Os reembolsos e o cancelamento são simulados sem efeitos externos.
- Recusado em produção, salvo com `ALLOW_TEST_PAYMENTS=true` (staging).

## 6. E-mail

Ficheiro: `src/modules/email/service.ts`. Os modelos estão na tabela `EmailTemplate` (19 chaves; ver [DATABASE.md](DATABASE.md)) e editam-se em Admin → Definições → E-mails. O corpo é texto simples com `{{variáveis}}`, inserido num layout HTML com a marca. Todos os envios ficam em `EmailLog`. Uma falha de e-mail nunca interrompe a operação de negócio.

| Modo | Comportamento |
|---|---|
| `EMAIL_PROVIDER=log` | Nada sai do servidor. A mensagem fica em `EmailLog` com estado `logged`. Para desenvolvimento, testes e staging. |
| `EMAIL_PROVIDER=resend` | Envio pela API Resend com `EMAIL_FROM`. Estado `sent` ou `failed` (com o erro). |

### O que o proprietário tem de fornecer

- Conta Resend e `RESEND_API_KEY`.
- Acesso ao DNS de athana.ch para verificar o domínio de envio.

### Passos

1. Criar a conta em resend.com.
2. Domains → Add domain → `athana.ch` (ou um subdomínio de envio).
3. Criar no DNS os registos indicados (DKIM, SPF/MX de retorno) e aguardar a verificação. Acrescentar um registo DMARC.
4. Criar uma chave API com permissão de envio.
5. Definir `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` (remetente no domínio verificado) e `CONTACT_EMAIL`.
6. Testar: pedir uma recuperação de palavra-passe e enviar o formulário de contacto; verificar a receção e `EmailLog`.

Não implementado: tratamento de devoluções e reclamações (webhooks do Resend), repetição de envios falhados, cancelamento de subscrição de e-mails (só são enviados e-mails transacionais), anexos (as faturas consultam-se na área de cliente).

## 7. Medição e publicidade

Ficheiros: `src/components/site/Consent.tsx` (banner e carregador), `src/modules/analytics/track.ts` (camada `track()`), `src/components/site/UtmCapture.tsx`.

### Carregamento dependente do consentimento

| Etiqueta | Condição para ser carregada |
|---|---|
| Google Tag Manager | `NEXT_PUBLIC_GTM_ID` definido **e** consentimento de medição. Antes de carregar o contentor é enviado para o `dataLayer` o Consent Mode por omissão: `analytics_storage: granted` e `ad_storage`, `ad_user_data`, `ad_personalization` conforme o consentimento de marketing. |
| gtag.js (GA4 e/ou Google Ads) | Sem GTM, com `NEXT_PUBLIC_GA4_ID` ou `NEXT_PUBLIC_GOOGLE_ADS_ID`, **e** consentimento de medição. O Consent Mode é definido com `analytics_storage: granted` e `ad_storage`, `ad_user_data`, `ad_personalization` conforme o consentimento de marketing. O GA4 é configurado com `anonymize_ip`. A configuração do Google Ads só é feita com consentimento de marketing. |
| Meta Pixel | `NEXT_PUBLIC_META_PIXEL_ID` definido **e** consentimento de marketing. |

Sem escolha, ou com recusa, nenhum script de terceiros é pedido e `track()` não faz nada. A escolha é guardada no cookie `athana_consent` (180 dias) e registada no servidor (`/api/consent`).

`track(evento, parâmetros)` envia o evento por `gtag` (definido tanto no caminho gtag.js como no caminho GTM, onde escreve no `dataLayer`) se houver consentimento de medição, e para `fbq` se houver consentimento de marketing e o evento tiver equivalente Meta. No evento `purchase`, com consentimento de marketing e com `NEXT_PUBLIC_GOOGLE_ADS_ID` e `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` definidos, envia ainda `conversion` com `send_to`, `value`, `currency` e `transaction_id`. Emite também o evento DOM `athana:track`.

### Eventos realmente disparados

| Evento | Onde | Parâmetros | Equivalente Meta |
|---|---|---|---|
| `page_view` | `ConsentManager`, em cada mudança de caminho, com consentimento de medição | `page_path` | — (o Pixel envia `PageView` só ao ser carregado) |
| `view_item` | Página de um modelo (`templates/[slug]/page.tsx`) | `item_id`, `item_name`, `currency`, `value` | `ViewContent` |
| `add_to_cart` | Botão de compra do configurador (`Configurator.tsx`) | `item_id`, `item_name`, `value`, `currency` | `AddToCart` |
| `begin_checkout` | Botão de pagamento (`CheckoutForm.tsx`) | `value`, `currency` | `InitiateCheckout` |
| `purchase` | Página de sucesso, só com a encomenda paga, uma vez por encomenda e por sessão do browser | `transaction_id`, `value`, `currency`, `tax`, `items` | `Purchase` |
| `briefing_start` | Primeira alteração no formulário de briefing | `project` | — |
| `briefing_submit` | Envio do briefing | (ver `BriefingForm.tsx`) | — |
| `contact` | Formulário de contacto enviado com sucesso | `form`, `interest` | `Contact` |
| `form_submit` | Formulário de orçamento ou de campanha enviado com sucesso | `form`, `interest` | `Lead` |
| `subscribe` | Clique em "teste gratuito" (`step: 'trial'`) e regresso do pagamento da subscrição (`step: 'activated'`) | `plan`, `step` | `Subscribe` |
| `sign_up` | Painel da área de cliente (`account/page.tsx`), na primeira visita depois do registo (`?welcome=1`), uma vez por utilizador e por sessão do browser | — | `CompleteRegistration` |

Notas factuais:

- `cta_click` está declarado no tipo `AnalyticsEvent` mas **não é disparado** em nenhum ponto.
- `sign_up` depende de o visitante ter aceitado os cookies antes de se registar; como os restantes eventos, não é enviado sem consentimento.
- `purchase` é disparado no browser, na página de sucesso. Se o cliente fechar a janela antes de voltar do Stripe, ou se o webhook chegar depois de a página ser mostrada, a compra não é contada. Não há envio do lado do servidor (Measurement Protocol, Conversions API).
- A conversão de compra do Google Ads (`conversion` com `send_to`) é enviada no browser junto com `purchase`, com as mesmas limitações. Só chega ao Google Ads no modo gtag.js direto, em que a etiqueta `AW-…` é configurada. Com GTM, o carregador não configura o Google Ads: a conversão tem de ser criada como etiqueta dentro do contentor (a partir do evento `purchase` ou `conversion` do `dataLayer`). **Não testado com uma conta real.**
- Com GTM, o contentor é carregado logo que há consentimento de medição, com o Consent Mode por omissão já definido. As etiquetas Google dentro do contentor respeitam-no; etiquetas de outros fornecedores (por exemplo Meta via GTM) têm de ser condicionadas à mão. Se o visitante alterar a escolha, o novo estado só é aplicado no carregamento de página seguinte (não é enviado `consent update`).
- Os parâmetros UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) são guardados no cookie `athana_utm` por 30 dias, só com consentimento de medição, e anexados ao lead criado pelo formulário (`Lead.utm`).
- A CSP (`next.config.ts`) autoriza `googletagmanager.com`, `googleadservices.com`, `connect.facebook.net`, os domínios de recolha do Google Analytics, `*.doubleclick.net`, `google.com` e `facebook.com`. Outros domínios que etiquetas adicionadas no GTM venham a usar podem ser bloqueados e exigem ajuste da CSP.

### O que o proprietário tem de fornecer

Os identificadores (GA4, GTM, Google Ads, Meta Pixel) das propriedades que quiser usar.

### Passos

1. Criar a propriedade GA4 e/ou o contentor GTM, a conta Google Ads e o Pixel.
2. Escolher: GTM (gere tudo no contentor) **ou** identificadores diretos GA4/Ads. Se `NEXT_PUBLIC_GTM_ID` estiver definido, os outros dois são ignorados pelo carregador.
3. Passar as variáveis `NEXT_PUBLIC_*` **na compilação** (ver [DEPLOYMENT.md](DEPLOYMENT.md), secção 3).
4. Em staging, aceitar os cookies e verificar com o modo de depuração do GA4 / pré-visualização do GTM / Meta Pixel Helper que os eventos chegam e que a consola do browser não mostra bloqueios da CSP.
5. Recusar os cookies e confirmar no separador de rede que nenhum pedido a terceiros é feito.
6. Atualizar a página de cookies (Admin → Conteúdo → Páginas) com as ferramentas realmente ativas.

Admin → Definições mostra quais destas integrações estão configuradas.

## 8. Armazenamento de ficheiros

Ficheiro: `src/modules/storage/service.ts`. A interface `StorageAdapter` tem três métodos (`put`, `get`, `remove`). A única implementação é `localStorage`, que escreve em `STORAGE_DIR`.

| Aspeto | Situação |
|---|---|
| O que o proprietário fornece | Um volume persistente, incluído nas cópias de segurança. |
| Várias instâncias da aplicação | Não suportado sem disco partilhado. |
| S3 ou compatível | **Não implementado.** Seria preciso escrever um adaptador com os mesmos três métodos e trocar a linha `export const storage: StorageAdapter = localStorage`. Não existem variáveis de ambiente para S3. Os ficheiros continuariam a ser servidos por `/api/files/[id]` com o controlo de acesso atual. |

As imagens públicas (catálogo, logótipo) estão em `public/` e fazem parte da imagem da aplicação; não usam este adaptador.

## 9. Tarefa diária

`GET /api/cron/daily`, protegida por `CRON_SECRET`. O proprietário tem de gerar o segredo e agendar uma chamada por dia. Conteúdo e exemplos em [DEPLOYMENT.md](DEPLOYMENT.md), secção 8. Não há agendador interno: se ninguém chamar o endpoint, a manutenção não corre.

## 10. Fluxo de trabalho com IA (Claude)

O que existe:

- o cliente pode autorizar, no briefing, o tratamento dos seus dados com ferramentas de IA (`Briefing.aiConsent`, desligado por omissão);
- a equipa descarrega, na página do projeto no backoffice, o ficheiro `<referência>-brief.json` (`GET /api/admin/projects/[id]/brief`, permissão `projects.view`, exportação auditada);
- o ficheiro segue o esquema `athana.project-brief/v1` e reúne modelo, escalão, demonstração de partida, tecnologias, opções, páginas e revisões incluídas, respostas do briefing e lista de ficheiros;
- sem consentimento, são substituídos por um marcador o nome, o e-mail e o telefone do contacto, a morada e os três campos de conteúdo livre (`texts`, `extra`, `inTheirOwnWords`). O nome da empresa e os requisitos do projeto (objetivo, público, páginas, funcionalidades, referências…) são sempre incluídos.

O que **não** existe:

- nenhuma chamada a APIs de IA (não há SDK da Anthropic nem de outro fornecedor nas dependências, nem chave de API nas variáveis de ambiente);
- nenhuma geração automática de sites, textos ou código;
- nenhum envio automático do brief para fora da plataforma.

Uso previsto: um membro da equipa descarrega o brief e usa-o, por sua decisão, como contexto numa ferramenta de desenvolvimento assistido, a partir da demonstração do modelo em `src/demos/<slug>`. Os ficheiros anexados pelo cliente não vão no JSON (só os metadados); descarregam-se um a um.

Antes de usar um brief com uma ferramenta de IA: confirmar `aiProcessingConsent`. Se for `false`, o conteúdo livre já vem ocultado, mas convém rever os campos de requisitos, que são texto escrito pelo cliente e podem conter dados pessoais.
