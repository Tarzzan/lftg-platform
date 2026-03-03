# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile
COPY apps/frontend ./apps/frontend
RUN pnpm --filter frontend build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copier le build standalone complet (server.js + node_modules + apps/)
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./

# Copier les fichiers statiques Next.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

# Copier les fichiers publics
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

# Copier .pnpm pour résoudre les symlinks pnpm
# Les symlinks dans node_modules pointent vers ../../../node_modules/.pnpm/
# Depuis /app/node_modules/, ../../../ = / (racine)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm /node_modules/.pnpm

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
