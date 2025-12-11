import 'dotenv/config';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Client } from '@opensearch-project/opensearch';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import arocapi, {
  AllPublicAccessTransformer,
  AllPublicFileAccessTransformer,
  type EntityTransformer,
} from 'arocapi';
import Fastify from 'fastify';
import { PrismaClient } from './generated/prisma/client.ts';

// NOTE: Only needed if you are going to use these yourself
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    opensearch: Client;
  }
}

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

if (!process.env.OPENSEARCH_URL) {
  throw new Error('OPENSEARCH_URL environment variable is not set');
}
const opensearchUrl = process.env.OPENSEARCH_URL;
const opensearch = new Client({ node: opensearchUrl });

const fastify = Fastify({
  logger: true,
});

const entityTransformers: EntityTransformer[] = [
  async (entity, { fastify }) => {
    const objectCount = entity.memberOf
      ? await fastify.prisma.entity.count({
          where: { memberOf: entity.id },
        })
      : 0;

    return {
      ...entity,
      counts: {
        objects: objectCount,
      },
    };
  },
  async (entity, { fastify }) => {
    const files = await fastify.prisma.file.findMany({
      where: {
        OR: [
          { memberOf: entity.id },
          { memberOf: { startsWith: `${entity.id}/` } },
        ],
      },
      select: { mediaType: true },
      distinct: ['mediaType'],
    });

    const mediaType = files.map((f) => f.mediaType);

    return {
      ...entity,
      mediaType,
    };
  },
  async (entity) => ({
    ...entity,
    accessControl: 'public',
  }),
];

await fastify.register(arocapi, {
  prisma,
  opensearch,
  entityTransformers,
  accessTransformer: AllPublicAccessTransformer,
  fileAccessTransformer: AllPublicFileAccessTransformer,
  // Required: File handler for serving File entity content
  fileHandler: {
    get: async (file) => {
      const filePath = (file.meta as { filePath?: string })?.filePath;
      if (!filePath) {
        return false;
      }

      // Check file exists
      try {
        await stat(filePath);
      } catch {
        return false;
      }

      return {
        type: 'stream',
        stream: createReadStream(filePath),
        metadata: {
          contentType: file.mediaType,
          contentLength: Number(file.size),
        },
      };
    },
    head: async (file) => {
      const filePath = (file.meta as { filePath?: string })?.filePath;
      if (!filePath) {
        return false;
      }

      // Check file exists and get actual size
      try {
        const fileStat = await stat(filePath);

        return {
          contentType: file.mediaType,
          contentLength: Number(fileStat.size),
        };
      } catch {
        return false;
      }
    },
  },
  // Required: RO-Crate handler for serving RO-Crate metadata
  roCrateHandler: {
    get: async (entity) => {
      type EntityMeta = { cratePath?: string; rocrate?: unknown };
      const meta = entity.meta as EntityMeta | null;

      // If cratePath exists, read from file system
      if (meta?.cratePath) {
        const metadataPath = path.join(
          meta.cratePath,
          'ro-crate-metadata.json',
        );
        const fileStat = await stat(metadataPath);

        return {
          type: 'stream',
          stream: createReadStream(metadataPath),
          metadata: {
            contentType: 'application/ld+json',
            contentLength: Number(fileStat.size),
          },
        };
      }

      // Otherwise serve the virtual rocrate from meta
      if (meta?.rocrate) {
        console.log('🪚 ♈');
        const jsonString = JSON.stringify(meta.rocrate, null, 2);

        return {
          type: 'stream',
          stream: Readable.from([jsonString]),
          metadata: {
            contentType: 'application/ld+json',
            contentLength: Buffer.byteLength(jsonString),
          },
        };
      }

      return false;
    },
    head: async (entity) => {
      type EntityMeta = { cratePath?: string; rocrate?: unknown };
      const meta = entity.meta as EntityMeta | null;

      // If cratePath exists, get size from file system
      if (meta?.cratePath) {
        const metadataPath = path.join(
          meta.cratePath,
          'ro-crate-metadata.json',
        );
        const fileStat = await stat(metadataPath);

        return {
          contentType: 'application/ld+json',
          contentLength: Number(fileStat.size),
        };
      }

      // Otherwise use the virtual rocrate size
      if (meta?.rocrate) {
        return {
          contentType: 'application/ld+json',
          contentLength: Buffer.byteLength(JSON.stringify(meta.rocrate)),
        };
      }

      return false;
    },
  },
});
console.log('🪚 ♓');

try {
  await fastify.listen({ port: 4000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
