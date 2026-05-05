# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RaspboCrate is a Raspberry Pi-based system for managing RO-Crate (Research Object Crate) catalogues in remote locations. It provides a web admin interface for cataloguing, indexing, and serving research data.

## Architecture

**Monorepo with pnpm workspaces:**

- `packages/raspbocrate/` - React admin interface (TanStack Start + Vite, port 3000)
- `packages/raspbocapi/` - Fastify API server using arocapi library (port 4000)
- `website/` - Documentation site (Astro)
- `image-builder/` - Raspberry Pi image builder using pi-gen

**Key Technologies:**
- Frontend: React 19, TanStack Router/Query, Tailwind CSS, shadcn/ui
- Backend: Fastify, arocapi, Prisma with MariaDB adapter
- Search: OpenSearch
- Database: MySQL 8

## Development Commands

### Root (from project root)
```bash
pnpm install              # Install all dependencies
pnpm lint:biome           # Lint and format check entire project
docker compose up -d      # Start MySQL, OpenSearch, ONI-UI services
```

### Admin Interface (packages/raspbocrate)
```bash
pnpm dev                  # Start dev server on port 3000
pnpm build                # Build for production
pnpm test                 # Run Vitest tests
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Push schema to database
pnpm db:migrate           # Run database migrations
pnpm db:studio            # Open Prisma Studio
pnpm db:seed              # Seed database
```

### API Server (packages/raspbocapi)
```bash
pnpm dev                  # Start with --watch on port 4000
pnpm start                # Start production server
```

### Website (website)
```bash
pnpm dev                  # Start Astro dev server
pnpm build                # Build static site
```

### Docker
```bash
pnpm docker:raspbocrate   # Build admin interface image
pnpm docker:raspbocapi    # Build API image
```

## Code Style

- Uses Biome for linting and formatting (single quotes, space indentation)
- shadcn/ui components in `packages/raspbocrate/src/components/ui/` are excluded from linting
- Generated route files (`routeTree.gen.ts`) are excluded from linting
- Astro files have relaxed lint rules due to incomplete Biome support

## Database

Both packages use Prisma with the MariaDB adapter. Environment variables are loaded from `.env.local` files via dotenv-cli.

## Services (docker-compose.yml)

- **MySQL 8**: localhost:3306 (root/password, database: raspbocapi)
- **OpenSearch 3**: localhost:9200
- **ONI-UI**: localhost:80 (discovery interface)

## Notes

- The raspbocrate dev server serves at `localhost:3000/admin/` (Vite `base: '/admin/'`)
- The Pi image-builder docker-compose uses an nginx reverse proxy: `/` → ONI-UI, `/admin` → raspbocrate, `/admin/containers` → Dozzle

## Agent skills

### Issue tracker

Issues live as GitHub issues in `paradisec-archive/raspbocrate`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` and one `docs/adr/` at the repo root (neither exists yet; created lazily by `/grill-with-docs`). See `docs/agents/domain.md`.
