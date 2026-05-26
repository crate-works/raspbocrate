# RaspboCrate

> Your trusted tool for managing catalogues in the field

A Raspberry Pi-based system for managing RO-Crate catalogues in remote locations.

**[View Documentation & Downloads](https://raspbocrate.crate-works.org)**

---

## Development

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker and Docker Compose

### Project Structure

- `packages/raspbocrate/` - React admin interface
- `packages/raspbocapi/` - Fastify RO-Crate API
- `image-builder/` - Raspberry Pi image builder
- `website/` - Documentation site

### Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development services:

   ```bash
   docker compose up -d
   ```

3. Run the admin interface:

   ```bash
   cd packages/raspbocrate
   pnpm dev
   ```

4. Run the API:

   ```bash
   cd packages/raspbocapi
   pnpm dev
   ```

### Building the Pi Image

See [image-builder/README.md](image-builder/README.md) for instructions.

### Running Tests

```bash
pnpm test
```

### Code Style

This project uses Biome for linting and formatting:

```bash
pnpm lint:biome
```

## Licence

ISC
