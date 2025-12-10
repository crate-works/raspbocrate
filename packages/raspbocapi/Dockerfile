FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the rasbocapi package
COPY packages/rasbocapi ./packages/rasbocapi/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/rasbocapi
RUN pnpm prisma generate

EXPOSE 3000

CMD ["node", "app.js"]
