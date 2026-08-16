FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,id=cto-frontend-npm-cache,target=/root/.npm \
    set -eu; \
    npm config set fetch-retries 8; \
    npm config set fetch-retry-factor 2; \
    npm config set fetch-retry-mintimeout 10000; \
    npm config set fetch-retry-maxtimeout 120000; \
    npm config set fetch-timeout 300000; \
    for attempt in 1 2 3; do \
      status=0; \
      npm ci --no-audit --no-fund --prefer-offline || status=$?; \
      if [ "$status" -eq 0 ]; then \
        exit 0; \
      fi; \
      rm -rf node_modules; \
      if [ "$attempt" -eq 3 ]; then \
        exit "$status"; \
      fi; \
      sleep $((attempt * 10)); \
    done

FROM node:20-bookworm-slim AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_AUTH_API_BASE
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_SOLANA_NETWORK
ARG NEXT_PUBLIC_SOLANA_RPC_URL
ARG NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL
ARG NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL
ARG NEXT_PUBLIC_CLOUDFRONT_DOMAIN
ARG NEXT_INTERNAL_API_URL
ARG NEXTAUTH_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_AUTH_API_BASE=$NEXT_PUBLIC_AUTH_API_BASE
ENV NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_SOLANA_NETWORK=$NEXT_PUBLIC_SOLANA_NETWORK
ENV NEXT_PUBLIC_SOLANA_RPC_URL=$NEXT_PUBLIC_SOLANA_RPC_URL
ENV NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=$NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL
ENV NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL=$NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL
ENV NEXT_PUBLIC_CLOUDFRONT_DOMAIN=$NEXT_PUBLIC_CLOUDFRONT_DOMAIN
ENV NEXT_INTERNAL_API_URL=$NEXT_INTERNAL_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs \
    && apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=nextjs:nodejs /app/package.json /app/package-lock.json ./
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD curl --fail --silent --show-error http://127.0.0.1:3000/health || exit 1

CMD ["npm", "start"]
