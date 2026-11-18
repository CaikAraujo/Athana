# Correr a ATHANA no seu computador

Versão com o **tema claro** (ramo local `design/light-theme`, não publicado).

## Precisa de

- [Node.js 22](https://nodejs.org) (LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — só para a base de dados.
  Em alternativa, um PostgreSQL 16 instalado localmente com utilizador `athana`, palavra-passe `athana` e base de dados `athana`.

## Passos

Abra um terminal na pasta do projeto e execute, por ordem:

```bash
docker compose -f docker-compose.dev.yml up -d
```

```bash
cp .env.local.example .env
```

No Windows (PowerShell), o comando anterior é `Copy-Item .env.local.example .env`.

```bash
npm ci
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

O *seed* mostra no terminal o e-mail e a palavra-passe do administrador local (`admin@athana.local` + palavra-passe gerada). Guarde-a.

```bash
npm run dev
```

Abra <http://localhost:3000>.

## O que ver

| Endereço | O quê |
|---|---|
| `/fr-ch`, `/pt-pt`, `/pt-br` | Página inicial nos vários mercados |
| `/fr-ch/modeles` | Catálogo (passe o rato sobre um cartão: a pré-visualização percorre a página) |
| `/fr-ch/modeles/atelier` | Página de modelo, com demonstração em formato computador / telemóvel |
| `/fr-ch/logiciels/crm`, `/fr-ch/logiciels/pointage` | Páginas de software com ecrãs reais |
| `/fr-ch/admin` | Painel administrativo (conta criada pelo *seed*) |

Os pagamentos estão em modo de teste (nenhum dinheiro é movimentado) e os e-mails ficam apenas registados.

## Escolher a cor de destaque

- **Para experimentar:** em `npm run dev` aparece no canto inferior esquerdo um seletor com três cores (ciano, verde, verde-azulado). Só existe em desenvolvimento.
- **Para fixar:** altere `NEXT_PUBLIC_ACCENT` no ficheiro `.env` para `cyan`, `green` ou `teal` e reinicie.
- **Outra cor:** as paletas estão no início de `src/app/globals.css` (blocos `[data-accent="…"]`); basta acrescentar uma.

## Ecrãs do CRM e do Pointage com dados de demonstração (opcional)

Com o site a correr, noutro terminal:

```bash
npx playwright install chromium
```

```bash
npx tsx scripts/capture-product.ts
```

Cria a empresa fictícia «Atelier Démo SA» na sua base de dados local e regenera as imagens de `public/images/software`. Pode depois entrar com `demo-captures@athana.local` / `Demo-captures-2026!` para explorar o CRM e o Pointage já com dados.
