import 'dotenv/config';
import { Readable } from 'node:stream';
import { Client } from '@opensearch-project/opensearch';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import arocapi, {
  AllPublicAccessTransformer,
  AllPublicFileAccessTransformer,
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

fastify.register(arocapi, {
  prisma,
  opensearch,
  accessTransformer: AllPublicAccessTransformer,
  fileAccessTransformer: AllPublicFileAccessTransformer,
  // Required: File handler for serving File entity content
  fileHandler: {
    get: async (file) => {
      const fileUrl = `https://storage.example.com/${file.meta.storagePath}`;
      return { type: 'redirect', url: fileUrl };
    },
    head: async (file) => ({
      contentType: file.mediaType,
      contentLength: file.size,
    }),
  },
  // Required: RO-Crate handler for serving RO-Crate metadata
  roCrateHandler: {
    get: async (entity) => {
      const jsonString = JSON.stringify(entity.rocrate, null, 2);
      return {
        type: 'stream',
        stream: Readable.from([jsonString]),
        metadata: {
          contentType: 'application/ld+json',
          contentLength: Buffer.byteLength(jsonString),
        },
      };
    },
    head: async (entity) => ({
      contentType: 'application/ld+json',
      contentLength: Buffer.byteLength(JSON.stringify(entity.rocrate)),
    }),
  },
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
