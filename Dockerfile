# ==============================================================================
# Aetherium Codex & Digital Library - Production Dockerfile for AWS ECS Fargate
# Multi-stage optimized build for linux/amd64 and linux/arm64
# ==============================================================================

# Stage 1: Dependencies Cache
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build Application
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

# Stage 3: Minimal Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001

# Add curl for ECS container healthchecks
RUN apk add --no-cache curl

# Non-root secure user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 aether

# Copy built production assets and production dependencies
COPY --from=builder --chown=aether:nodejs /app/dist ./dist
COPY --from=builder --chown=aether:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=aether:nodejs /app/package.json ./package.json

USER aether

EXPOSE 3001

# Healthcheck for AWS Fargate & Application Load Balancer (ALB)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/healthz || exit 1

CMD ["node", "dist/server.cjs"]
