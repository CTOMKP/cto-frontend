FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-bookworm-slim AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_AUTH_API_BASE
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_SOLANA_RPC_URL
ARG NEXT_PUBLIC_CLOUDFRONT_DOMAIN
ARG NEXT_INTERNAL_API_URL
ARG NEXTAUTH_URL
ARG PANORA_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_AUTH_API_BASE=$NEXT_PUBLIC_AUTH_API_BASE
ENV NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_SOLANA_RPC_URL=$NEXT_PUBLIC_SOLANA_RPC_URL
ENV NEXT_PUBLIC_CLOUDFRONT_DOMAIN=$NEXT_PUBLIC_CLOUDFRONT_DOMAIN
ENV NEXT_INTERNAL_API_URL=$NEXT_INTERNAL_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV PANORA_API_KEY=$PANORA_API_KEY

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
