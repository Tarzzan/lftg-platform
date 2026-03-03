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

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copier les fichiers publics
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Copier le build standalone (contient server.js + node_modules avec symlinks)
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./

# Les symlinks dans standalone/node_modules/ pointent vers ../../../node_modules/.pnpm/
# Depuis /app/apps/frontend/.next/standalone/node_modules/, ../../../ remonte a /app/
# Donc .pnpm doit etre dans /app/node_modules/.pnpm/
# Le standalone est copie a la racine /app/, donc les symlinks cherchent /node_modules/.pnpm/
# Il faut copier .pnpm dans /node_modules/.pnpm/ (a la racine du conteneur)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm /node_modules/.pnpm

# Copier les fichiers statiques
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
