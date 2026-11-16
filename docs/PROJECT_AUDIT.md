# Auditoria do projeto existente

Data da auditoria: 16 de novembro de 2026 · Repositório: `CaikAraujo/Athana` (ramo `main`, commit `570e46c`).

## 1. Resumo

O repositório continha **apenas o site institucional** da ATHANA: uma aplicação de página única (SPA) em React, sem base de dados, sem autenticação e sem área privada. **Não existia código de CRM nem de Pointage** neste repositório, ao contrário do que o caderno de encargos pressupunha. Se esses sistemas existirem noutros repositórios, não foram indicados nem analisados.

Decisão tomada: a arquitetura existente não suportava a expansão pedida (venda online, contas, pagamentos, multi-empresa). O site antigo foi **movido sem alterações para `legacy/`** (nada foi apagado) e a plataforma foi construída ao lado, reaproveitando a marca, os conteúdos e os dados da empresa. O CRM e o Pointage foram construídos de raiz dentro da plataforma.

## 2. Tecnologia encontrada

| Elemento | Situação encontrada |
|---|---|
| Frontend | React 19 + Vite 7 + TypeScript, Tailwind CSS 4, framer-motion, react-router (SPA, renderização só no navegador) |
| Backend | 3 funções serverless na Vercel (`api/contact.ts`, `api/callback.ts`, `api/elite-filter.ts`) que apenas enviam e-mails via Resend |
| Base de dados | Nenhuma |
| Autenticação | Nenhuma |
| Idiomas | i18next com fr, en, de, it (sem português) |
| Alojamento | Vercel (`vercel.json`), domínio athana.ch |
| Serviços externos | Resend (e-mail), Google Analytics 4 (`react-ga4`), WhatsApp (ligação), Google Fonts |
| Testes | Nenhum |
| Documentação | README genérico de um modelo "AI Studio" (referia uma chave Gemini que o código não usa) e uma lista de palavras-chave SEO |

## 3. Páginas e API existentes

- Páginas: início, serviços, 3 páginas SEO locais (desenvolvimento web, aplicação segura, integração Odoo — Genebra), projetos, formulário "Démarrer", menções legais, confidencialidade.
- API: 3 endpoints de formulário com validação Zod, *honeypot*, escape de HTML e limitação de pedidos em memória.

## 4. Problemas identificados

| # | Problema | Gravidade | Tratamento |
|---|---|---|---|
| 1 | **Testemunhos inventados** (nomes fictícios com fotografias de `picsum.photos`) apresentados como avaliações de clientes | Alta (confiança, risco legal) | Não foram migrados. A plataforma só mostra testemunhos reais, inseridos e publicados no painel |
| 2 | Dados estruturados com número de empresa fictício (`CHE-XXX.XXX.XXX`) | Média | Não migrado; o número é um campo de configuração vazio até ser preenchido |
| 3 | SPA sem renderização no servidor: conteúdo e metadados dependem de JavaScript; sem `hreflang`; sitemap estático desatualizado (incluía uma âncora `#pricing`) | Média (SEO) | Renderização no servidor, metadados por página, `hreflang`, sitemap dinâmico |
| 4 | Limitação de pedidos em memória, por instância serverless (ineficaz com várias instâncias) | Média | Limitador partilhado em PostgreSQL |
| 5 | Google Analytics carregado sem pedido de consentimento | Média (RGPD / nLPD) | Etiquetas carregadas só após consentimento, com registo do consentimento |
| 6 | Google Fonts carregadas de servidores externos (transferência de IP para terceiros) | Baixa | Tipos de letra alojados localmente |
| 7 | Preços fixos no código (`constants.ts`) e textos comerciais espalhados pelos componentes | Média | Preços na base de dados, geridos no painel; textos em ficheiros de tradução |
| 8 | Imagens de portefólio vindas de bancos de imagens genéricos (Unsplash) | Baixa | Só foram mantidas as duas imagens reais de projetos |
| 9 | Sem testes, sem CI, sem `.env.example` | Média | Testes unitários, de integração e E2E; workflow de CI; `.env.example` |
| 10 | Cabeçalho `X-XSS-Protection` obsoleto; sem CSP nem HSTS | Baixa | Cabeçalhos de segurança atuais |

Não foram encontrados segredos no repositório.

## 5. Recursos reaproveitados

- **Marca**: logótipo e favicon SVG, paleta preto + dourado (`#C5A059`), tipos de letra Outfit e Space Grotesk (base do *design system*).
- **Dados da empresa** das menções legais: morada, e-mail, telefone, LinkedIn (agora editáveis em Admin → Paramètres).
- **Portefólio real**: VF Froid, Chez Energie, Fridge Telemetry, Scheduler API.
- **Posicionamento suíço** e domínio athana.ch.
- **Boas práticas dos formulários**: validação Zod, *honeypot*, escape de HTML — mantidas e reforçadas.
- **SEO adquirido**: os endereços antigos (`/fr/...`, páginas de serviços, `/projets`, `/demarrer`, `/impressum`, `/confidentialite`) são redirecionados para os novos endereços (`next.config.ts`).

## 6. O que deixou de existir no novo site

- As versões em inglês, alemão e italiano do site antigo (o caderno de encargos pede francês e português; os endereços `/en`, `/de`, `/it` redirecionam para `/fr-ch`). O inglês fica preparado na configuração, sem traduções.
- As três páginas SEO locais de Genebra, substituídas por páginas de serviço internacionais. Os textos originais continuam em `legacy/` caso se queira recuperá-los.
- O formulário "Elite filter" e o pedido de chamada, substituídos pelos formulários de contacto e de orçamento.

## 7. Questão em aberto para o proprietário

O caderno de encargos refere um **CRM atual** e um **Pointage atual** a auditar e melhorar. Não estão neste repositório. Se existirem noutro local, é preciso decidir se os dados devem ser migrados para os novos módulos — isso não foi feito.
