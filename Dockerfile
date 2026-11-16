# syntax=docker/dockerfile:1
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are inlined at build time: pass them as build args when tags are used.
ARG NEXT_PUBLIC_GA4_ID="" NEXT_PUBLIC_GTM_ID="" NEXT_PUBLIC_GOOGLE_ADS_ID="" NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL="" NEXT_PUBLIC_META_PIXEL_ID=""
ENV NEXT_PUBLIC_GA4_ID=$NEXT_PUBLIC_GA4_ID NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID NEXT_PUBLIC_GOOGLE_ADS_ID=$NEXT_PUBLIC_GOOGLE_ADS_ID NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL=$NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID
RUN npx prisma generate && npx next build

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 STORAGE_DIR=/data/storage
RUN useradd --system --uid 1001 athana && mkdir -p /data/storage && chown -R athana /data
COPY --from=build --chown=athana /app/.next/standalone ./
COPY --from=build --chown=athana /app/.next/static ./.next/static
COPY --from=build --chown=athana /app/public ./public
# Migration + seed tooling (used by the "migrate" service; not needed to serve requests).
COPY --from=build --chown=athana /app/prisma ./prisma
COPY --from=build --chown=athana /app/src/lib/crypto.ts ./src/lib/crypto.ts
COPY --from=build --chown=athana /app/src/i18n/config.ts ./src/i18n/config.ts
COPY --from=deps --chown=athana /app/node_modules ./node_modules
USER athana
EXPOSE 3000
VOLUME ["/data/storage"]
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
