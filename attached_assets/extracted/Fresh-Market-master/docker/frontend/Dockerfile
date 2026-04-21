# ============================================================
# Stage 1: Build React + Vite frontend
# ============================================================
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests first (for layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/story-weaver/package.json ./artifacts/story-weaver/
COPY artifacts/api-server/package.json   ./artifacts/api-server/
COPY lib/api-spec/package.json           ./lib/api-spec/
COPY lib/api-client-react/package.json   ./lib/api-client-react/
COPY lib/api-zod/package.json            ./lib/api-zod/
COPY lib/db/package.json                 ./lib/db/

RUN pnpm install --frozen-lockfile

# Copy source files
COPY artifacts/story-weaver ./artifacts/story-weaver
COPY lib                     ./lib
COPY tsconfig.base.json      ./

# Build-time env vars (passed via docker-compose args)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV BASE_PATH=/
ENV NODE_ENV=production

RUN pnpm --filter @workspace/story-weaver run build

# ============================================================
# Stage 2: Serve with Nginx
# ============================================================
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/artifacts/story-weaver/dist/public /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
