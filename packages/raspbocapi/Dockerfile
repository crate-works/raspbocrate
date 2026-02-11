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
COPY packages/raspbocapi/package.json ./packages/raspbocapi/

# Install all dependencies (including dev for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

################
# Build the application
################
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

WORKDIR /app/packages/raspbocapi

COPY --from=deps /app/packages/raspbocapi/node_modules ./node_modules

# Copy source files
COPY packages/raspbocapi/package.json ./
COPY packages/raspbocapi/app.ts ./
COPY packages/raspbocapi/prisma ./prisma
COPY packages/raspbocapi/prisma.config.ts ./

# For prisma
RUN apt-get update -y && apt-get install -y openssl

# Just needs a valid DATABASE_URL, the database doesn't have to exist at this point
ENV DATABASE_URL="mysql://mysql:3306"
RUN pnpm exec prisma generate

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
RUN mkdir -p /app/packages/raspbocapi
COPY --from=deps /app/node_modules ./node_modules

WORKDIR /app/packages/raspbocapi
COPY --from=builder /app/packages/raspbocapi ./
COPY --from=deps /app/packages/raspbocapi ./

# Expose the application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/entities').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# Start the application
CMD ["node", "app.ts"]
