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

RUN npm install -g pnpm@9

# Copy workspace config + lockfile pour prod install
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/tsconfig.json /app/tsconfig.base.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/plugins/animaux-couvees/package.json ./plugins/animaux-couvees/
COPY --from=builder /app/plugins/formation/package.json ./plugins/formation/
COPY --from=builder /app/plugins/personnel/package.json ./plugins/personnel/
COPY --from=builder /app/plugins/stock/package.json ./plugins/stock/
# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy build artifacts
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/core/prisma ./packages/core/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy i18n files
COPY --from=builder /app/apps/backend/src/i18n ./apps/backend/dist/i18n

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/core/prisma/schema.prisma && node apps/backend/dist/main.js"]
