# ============================================================
# Stage 1: Build Express API
# ============================================================
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests first (for layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json   ./artifacts/api-server/
COPY artifacts/story-weaver/package.json ./artifacts/story-weaver/
COPY lib/api-spec/package.json           ./lib/api-spec/
COPY lib/api-client-react/package.json   ./lib/api-client-react/
COPY lib/api-zod/package.json            ./lib/api-zod/
COPY lib/db/package.json                 ./lib/db/

RUN pnpm install --frozen-lockfile

# Copy source files
COPY artifacts/api-server ./artifacts/api-server
COPY lib                  ./lib
COPY tsconfig.base.json   ./

RUN pnpm --filter @workspace/api-server run build

# ============================================================
# Stage 2: Production — minimal Node image
# ============================================================
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy compiled output only
COPY --from=builder /app/artifacts/api-server/dist ./dist

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
