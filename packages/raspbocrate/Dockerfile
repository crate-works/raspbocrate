################
# Setup pnpm cache
################
FROM node:22-slim AS base

# Cache pnpm store
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack for pnpm
RUN corepack enable

################
# Install dependencies
################
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/raspbocrate/package.json ./packages/raspbocrate/

# Install all dependencies (including dev for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

################
# Build the application
################
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

WORKDIR /app/packages/raspbocrate

COPY --from=deps /app/packages/raspbocrate/node_modules ./node_modules

# Copy source files
COPY packages/raspbocrate/package.json ./
COPY packages/raspbocrate/tsconfig.json ./
COPY packages/raspbocrate/vite.config.ts ./
COPY packages/raspbocrate/src ./src
COPY packages/raspbocrate/prisma ./prisma
COPY packages/raspbocrate/prisma.config.ts ./
COPY packages/raspbocrate/public ./public

# For prisma
RUN apt-get update -y && apt-get install -y openssl

# Just needs a valid DATABASE_URL, the database doesn't have to exist at this point
ENV DATABASE_URL="mysql://localhost:3306"
RUN pnpm exec prisma generate

# Build the application
RUN pnpm build

################
# Build the application
################
FROM node:22-slim AS prod

# Create non-root user for security
RUN addgroup --system --gid 1001 app && \
  adduser --system --uid 1001 app

# Switch to non-root user
USER app

WORKDIR /app

COPY --from=builder /app/packages/raspbocrate/.output ./.output

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
