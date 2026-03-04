# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace config + lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/core/package.json ./packages/core/
COPY plugins/animaux-couvees/package.json ./plugins/animaux-couvees/
COPY plugins/formation/package.json ./plugins/formation/
COPY plugins/personnel/package.json ./plugins/personnel/
COPY plugins/stock/package.json ./plugins/stock/

# Install all dependencies (plugins inclus dans le workspace)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/backend ./apps/backend
COPY packages/core ./packages/core
COPY plugins ./plugins

# Generate Prisma client
RUN pnpm --filter @lftg/core prisma:generate

# Build backend
RUN pnpm --filter backend build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# OpenSSL est requis par Prisma pour les migrations et le query engine
RUN apk add --no-cache openssl openssl-dev

RUN npm install -g pnpm@9

# Copy workspace config + lockfile pour prod install
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/tsconfig.json /app/tsconfig.base.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/plugins/animaux-couvees/package.json ./plugins/animaux-couvees/
COPY --from=builder /app/plugins/formation/package.json ./plugins/formation/
COPY --from=builder /app/plugins/personnel/package.json ./plugins/personnel/
COPY --from=builder /app/plugins/stock/package.json ./plugins/stock/

# Install production dependencies (prisma is now in dependencies, not devDependencies)
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma schema (needed for generate + migrate)
COPY --from=builder /app/packages/core/prisma ./packages/core/prisma

# Generate Prisma client in the runner (ensures correct binary for Alpine linux-musl)
RUN pnpm --filter backend exec prisma generate --schema=../../packages/core/prisma/schema.prisma

# CRITICAL: pnpm résout .prisma/client depuis le store pnpm, pas depuis node_modules/.prisma/client
# On doit copier le client généré dans TOUS les emplacements du store pnpm
RUN cp -rf /app/node_modules/.prisma/client/* /app/node_modules/.pnpm/@prisma+client@5.10.2_prisma@5.10.2/node_modules/.prisma/client/ 2>/dev/null || true && \
    cp -rf /app/node_modules/.prisma/client/* /app/node_modules/.pnpm/@prisma+client@5.10.2_prisma@5.22.0/node_modules/.prisma/client/ 2>/dev/null || true

# Copy build artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy i18n files
COPY --from=builder /app/apps/backend/src/i18n ./apps/backend/dist/apps/backend/src/i18n

EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter backend exec prisma migrate deploy --schema=../../packages/core/prisma/schema.prisma && node apps/backend/dist/apps/backend/src/main.js"]
