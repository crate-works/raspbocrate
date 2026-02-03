import { stat } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '@/db';
import type {
  CrateEntity,
  CrateTreeNode,
  MediaFile,
  RoCrateInfo,
} from '@/types/rocrate';

const parseContentSize = (contentSize: string | undefined): bigint => {
  if (!contentSize) {
    return BigInt(0);
  }

  // contentSize might be a number string like "12345" or with units like "1.5 MB"
  const numericMatch = contentSize.match(/^(\d+)/);
  if (numericMatch) {
    return BigInt(numericMatch[1]);
  }

  return BigInt(0);
};

const findType = (type: string | string[]): string => {
  const types = Array.isArray(type) ? type : [type];

  return types.find((t) => t.includes('pcdm')) || types[0];
};

export type ImportStats = {
  entitiesCreated: number;
  entitiesUpdated: number;
  filesCreated: number;
  filesUpdated: number;
  errors: string[];
};

const processEntity = async (
  entity: CrateEntity,
  cratePath: string,
  rootCollectionId: string,
  parentId: string | null,
  stats: ImportStats,
): Promise<void> => {
  const entityId = entity.id;

  try {
    const existing = await prisma.entity.findFirst({
      where: { rocrateId: entityId },
    });

    const entityData = {
      rocrateId: entityId,
      name: entity.name,
      description: entity.description || '',
      entityType: findType(entity.type),
      memberOf: parentId,
      rootCollection: rootCollectionId,
      metadataLicenseId: 'foo',
      contentLicenseId: 'bar',
      fileId: null,
      meta: {
        cratePath: cratePath,
      },
      rocrate: {},
    };

    if (existing) {
      await prisma.entity.update({
        where: { id: existing.id },
        data: entityData,
      });
      stats.entitiesUpdated++;
    } else {
      await prisma.entity.create({
        data: entityData,
      });
      stats.entitiesCreated++;
    }

    // Process media files
    for (const file of entity.mediaFiles) {
      await processFile(file, rootCollectionId, entityId, stats);
    }

    // Process child entities
    for (const child of entity.children) {
      await processEntity(child, cratePath, rootCollectionId, entityId, stats);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(`Entity ${entityId}: ${message}`);
  }
};

const processFile = async (
  file: MediaFile,
  rootCollectionId: string,
  parentEntityId: string,
  stats: ImportStats,
): Promise<void> => {
  try {
    // Check file size from filesystem if contentSize not provided
    // Use atId for the file path since it's the actual path in the crate
    let size = parseContentSize(file.contentSize);

    if (size === BigInt(0)) {
      try {
        const fileStat = await stat(file.path);
        size = BigInt(fileStat.size);
      } catch {
        // File might not exist or be inaccessible, use 0
      }
    }

    const fileData = {
      fileId: file.id,
      filename: file.name,
      mediaType: file.encodingFormat || 'application/octet-stream',
      size,
      memberOf: parentEntityId,
      rootCollection: rootCollectionId,
      contentLicenseId: 'foo',
      meta: {
        filePath: file.path,
      },
    };

    const existingFile = await prisma.file.findUnique({
      where: { fileId: file.id },
    });

    if (existingFile) {
      await prisma.file.update({
        where: { fileId: file.id },
        data: fileData,
      });
      stats.filesUpdated++;
    } else {
      await prisma.file.create({
        data: fileData,
      });
      stats.filesCreated++;
    }

    // Also create an Entity record for the file (MediaObject)
    const mediaType = file.encodingFormat || 'application/octet-stream';
    const virtualRoCrate = {
      '@context': [
        'https://w3id.org/ro/crate/1.2-DRAFT/context',
        { '@vocab': 'http://schema.org/' },
        'http://purl.archive.org/language-data-commons/context.json',
        {
          Geometry: 'http://www.opengis.net/ont/geosparql#Geometry',
          asWKT: 'http://www.opengis.net/ont/geosparql#asWKT',
        },
        'https://w3id.org/ldac/context',
      ],
      '@graph': [
        {
          '@id': file.id,
          '@type': 'File',
          contentSize: Number(size),
          encodingFormat: mediaType,
          name: file.name,
          filename: file.path,
          parentId: parentEntityId,
        },
        {
          '@id': 'ro-crate-metadata.json',
          '@type': 'CreativeWork',
          conformsTo: { '@id': 'https://w3id.org/ro/crate/1.2-DRAFT' },
          about: { '@id': file.id },
        },
      ],
    };

    const entityData = {
      rocrateId: file.id,
      name: file.name,
      description: '',
      entityType: 'http://schema.org/MediaObject',
      memberOf: parentEntityId,
      rootCollection: rootCollectionId,
      metadataLicenseId: 'foo',
      contentLicenseId: 'bar',
      fileId: file.id,
      meta: {
        rocrate: virtualRoCrate,
      },
    };

    const existingEntity = await prisma.entity.findFirst({
      where: { rocrateId: file.id },
    });

    if (existingEntity) {
      await prisma.entity.update({
        where: { id: existingEntity.id },
        data: entityData,
      });
      stats.entitiesUpdated++;
    } else {
      await prisma.entity.create({
        data: entityData,
      });
      stats.entitiesCreated++;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(`File ${file.id}: ${message}`);
  }
};

const processCrate = async (
  crate: RoCrateInfo,
  basePath: string,
  parentId: string | null,
  stats: ImportStats,
): Promise<void> => {
  const cratePath = path.join(basePath, crate.path);
  const rootCollectionId = crate.rootEntity.id;

  await processEntity(
    crate.rootEntity,
    cratePath,
    rootCollectionId,
    parentId,
    stats,
  );
};

export const processCrateTree = async (
  nodes: CrateTreeNode[],
  basePath: string,
  parentId: string | null,
  stats: ImportStats,
): Promise<void> => {
  for (const node of nodes) {
    console.log('🪚 ♎', node);
    await processCrate(node.crate, basePath, parentId, stats);

    const childrenParentId = node.crate.rootEntity.id;

    // Process nested crates
    if (node.children.length > 0) {
      await processCrateTree(node.children, basePath, childrenParentId, stats);
    }
  }
};
