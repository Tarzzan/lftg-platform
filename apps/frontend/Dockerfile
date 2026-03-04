# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --no-frozen-lockfile
COPY apps/frontend ./apps/frontend
RUN pnpm --filter frontend build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm@9
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copier les fichiers de configuration du workspace
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/tsconfig.json ./
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/

# Installer les dépendances de production
RUN pnpm install --no-frozen-lockfile --prod

# Copier le build Next.js complet
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/next.config.js ./apps/frontend/

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/frontend
CMD ["npx", "next", "start", "-p", "3000"]
