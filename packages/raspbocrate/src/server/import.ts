import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type Prisma, prisma } from '#/db.ts';
import type {
  CrateEntity,
  CrateTreeNode,
  MediaFile,
  RoCrateInfo,
} from '#/types/rocrate.ts';
import {
  type EntityDocument,
  ensureIndex,
  indexEntityDocument,
  refreshIndex,
} from './indexing';

const findType = (type: string | string[]): string => {
  const types = Array.isArray(type) ? type : [type];

  if (types.includes('RepositoryObject')) {
    return 'http://pcdm.org/models#Object';
  }

  if (types.includes('RepositoryCollection')) {
    return 'http://pcdm.org/models#Collection';
  }

  if (types.includes('File')) {
    return 'http://schema.org/MediaObject';
  }

  return types.find((t) => t.includes('pcdm')) || types[0];
};

type GraphEntry = Record<string, unknown>;

const filterAndCopyCrate = async (
  driveCratePath: string,
  localCratePath: string,
  stats: ImportStats,
): Promise<void> => {
  const srcFile = path.join(driveCratePath, 'ro-crate-metadata.json');
  const content = await readFile(srcFile, 'utf-8');
  const data = JSON.parse(content) as { '@graph': GraphEntry[] } & Record<
    string,
    unknown
  >;

  const graph: GraphEntry[] = data['@graph'];

  // Build lookup map
  const graphMap = new Map<string, GraphEntry>();
  graph.forEach((entry) => {
    const id = entry['@id'] as string;
    if (id) {
      graphMap.set(id, entry);
    }
  });

  // Collect all hasPart-referenced IDs and resolve their file paths
  const hasPartIds = new Set<string>();
  const hasPartFilePaths = new Set<string>();

  graph.forEach((entry) => {
    const hasPart = entry.hasPart;
    if (!hasPart) return;

    const parts: unknown[] = Array.isArray(hasPart) ? hasPart : [hasPart];

    parts.forEach((part) => {
      if (!part || typeof part !== 'object') return;

      const partRef = part as { '@id'?: string };
      const partId = partRef['@id'];
      if (!partId) return;

      hasPartIds.add(partId);

      const resolved = graphMap.get(partId) as
        | { '@id': string; filename?: string; name?: string }
        | undefined;
      if (resolved) {
        const filePath =
          resolved.filename ||
          resolved.name ||
          resolved['@id'].split('/').pop();
        if (filePath) {
          hasPartFilePaths.add(filePath);
        }
      }
    });
  });

  // Check which hasPart items exist on disk — remove those that don't
  const removedIds = new Set<string>();

  const existPromises = [...hasPartIds].map(async (id) => {
    const entry = graphMap.get(id) as {
      '@id': string;
      filename?: string;
      name?: string;
    };
    if (!entry) return;

    const filePath =
      entry.filename || entry.name || entry['@id'].split('/').pop();
    if (!filePath) {
      removedIds.add(id);
      return;
    }

    try {
      await stat(path.join(driveCratePath, filePath));
    } catch {
      removedIds.add(id);
    }
  });

  await Promise.all(existPromises);

  stats.filesSkipped += removedIds.size;

  // Check for files on disk not referenced by any hasPart
  try {
    const diskEntries = await readdir(driveCratePath, { withFileTypes: true });

    diskEntries.forEach((entry) => {
      if (!entry.isFile()) return;
      if (entry.name === 'ro-crate-metadata.json') return;

      if (!hasPartFilePaths.has(entry.name)) {
        stats.errors.push(
          `Unmatched file on disk: ${path.join(driveCratePath, entry.name)} is not referenced in hasPart`,
        );
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(
      `Failed to read crate directory ${driveCratePath}: ${message}`,
    );
  }

  // Filter hasPart arrays to remove missing references
  graph.forEach((entry) => {
    const hasPart = entry.hasPart;
    if (!hasPart) return;

    const parts: unknown[] = Array.isArray(hasPart) ? hasPart : [hasPart];
    const filtered = parts.filter((part) => {
      if (!part || typeof part !== 'object') return true;

      const partRef = part as { '@id'?: string };

      return !partRef['@id'] || !removedIds.has(partRef['@id']);
    });

    if (filtered.length === 0) {
      delete entry.hasPart;
    } else if (filtered.length === 1) {
      entry.hasPart = filtered[0];
    } else {
      entry.hasPart = filtered;
    }
  });

  // Remove entries from @graph
  data['@graph'] = graph.filter((entry) => {
    const id = entry['@id'] as string;

    return !id || !removedIds.has(id);
  });

  // Write filtered metadata to local path
  await mkdir(localCratePath, { recursive: true });
  await writeFile(
    path.join(localCratePath, 'ro-crate-metadata.json'),
    JSON.stringify(data, null, 2),
  );
};

export type ImportStats = {
  entitiesCreated: number;
  entitiesUpdated: number;
  filesCreated: number;
  filesUpdated: number;
  filesSkipped: number;
  errors: string[];
};

export const blankStats = (): ImportStats => ({
  entitiesCreated: 0,
  entitiesUpdated: 0,
  filesCreated: 0,
  filesUpdated: 0,
  filesSkipped: 0,
  errors: [],
});

export type ImportProgress = {
  setCurrentItem?: (label: string) => void;
  tickProcessed?: () => void;
};

const processEntity = async (
  entity: CrateEntity,
  cratePath: string,
  rootCollectionId: string,
  parentId: string | null,
  stats: ImportStats,
  progress?: ImportProgress,
): Promise<void> => {
  progress?.setCurrentItem?.(`Entity: ${entity.name || entity.id}`);
  const entityId = entity.id;

  try {
    const existing = await prisma.entity.findFirst({
      where: { id: entityId },
    });

    const entityData: Prisma.EntityCreateInput = {
      id: entityId,
      name: entity.name,
      description: entity.description || '',
      entityType: findType(entity.type),
      memberOf: parentId,
      rootCollection: rootCollectionId,
      metadataLicenseId: 'foo',
      contentLicenseId: 'bar',
      meta: {
        cratePath: cratePath,
      },
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
      await processFile(file, rootCollectionId, entityId, stats, progress);
    }

    // Index entity into OpenSearch
    try {
      const encodingFormats = [
        ...new Set(
          entity.mediaFiles
            .map((f) => f.encodingFormat)
            .filter((f): f is string => !!f),
        ),
      ];

      const indexData = entity.indexData;
      const doc: EntityDocument = {
        rocrateId: entityId,
        name: entity.name,
        description: entity.description || '',
        entityType: entityData.entityType,
        memberOf: parentId,
        rootCollection: rootCollectionId,
        collector_name: indexData?.collectorName ?? [],
        countries: indexData?.countries ?? [],
        originatedOn: indexData?.originatedOn ?? null,
        access_condition_name: indexData?.accessConditionName ?? null,
        inLanguage: indexData?.languages ?? [],
        communicationMode: indexData?.communicationMode ?? [],
        type: indexData?.type ?? [],
        mediaType: encodingFormats,
      };

      await indexEntityDocument(doc);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      stats.errors.push(`Index entity ${entityId}: ${message}`);
    }

    // Process child entities
    for (const child of entity.children) {
      await processEntity(
        child,
        cratePath,
        rootCollectionId,
        entityId,
        stats,
        progress,
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(`Entity ${entityId}: ${message}`);
  } finally {
    progress?.tickProcessed?.();
  }
};

const processFile = async (
  file: MediaFile,
  rootCollectionId: string,
  parentEntityId: string,
  stats: ImportStats,
  progress?: ImportProgress,
): Promise<void> => {
  progress?.setCurrentItem?.(`File: ${file.name || file.id}`);
  try {
    // Skip files that don't exist on disk
    let fileSize: number;
    try {
      const fileStat = await stat(file.path);
      fileSize = file.contentSize || fileStat.size;
    } catch {
      stats.filesSkipped++;

      return;
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
          contentSize: Number(fileSize),
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

    const entityData: Prisma.EntityCreateInput = {
      id: file.id,
      name: file.name,
      description: '',
      entityType: 'http://schema.org/MediaObject',
      memberOf: parentEntityId,
      rootCollection: rootCollectionId,
      metadataLicenseId: 'foo',
      contentLicenseId: 'bar',
      meta: {
        rocrate: virtualRoCrate,
      },
    };

    const existingEntity = await prisma.entity.findFirst({
      where: { id: file.id },
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

    const fileData: Prisma.FileCreateInput = {
      entity: { connect: { id: file.id } },
      filename: file.name,
      mediaType: file.encodingFormat || 'application/octet-stream',
      size: BigInt(fileSize),
      meta: {
        filePath: file.path,
      },
    };

    const existingFile = await prisma.file.findUnique({
      where: { id: file.id },
    });

    if (existingFile) {
      await prisma.file.update({
        where: { id: file.id },
        data: fileData,
      });
      stats.filesUpdated++;
    } else {
      await prisma.file.create({
        data: fileData,
      });
      stats.filesCreated++;
    }

    // Index file entity into OpenSearch
    try {
      const doc: EntityDocument = {
        rocrateId: file.id,
        name: file.name,
        description: '',
        entityType: 'http://schema.org/MediaObject',
        memberOf: parentEntityId,
        rootCollection: rootCollectionId,
        collector_name: [],
        countries: [],
        originatedOn: null,
        access_condition_name: null,
        inLanguage: [],
        communicationMode: [],
        type: ['File'],
        mediaType: mediaType ? [mediaType] : [],
      };

      await indexEntityDocument(doc);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      stats.errors.push(`Index file ${file.id}: ${message}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(`File ${file.id}: ${message}`);
  } finally {
    progress?.tickProcessed?.();
  }
};

const processCrate = async (
  crate: RoCrateInfo,
  basePath: string,
  parentId: string | null,
  stats: ImportStats,
  dataDir: string,
  progress?: ImportProgress,
): Promise<void> => {
  progress?.setCurrentItem?.(
    `Preparing crate: ${crate.rootEntity.name || crate.rootEntity.id}`,
  );

  const driveCratePath = path.join(basePath, crate.path);
  const localCratePath = path.join(dataDir, crate.path);

  await filterAndCopyCrate(driveCratePath, localCratePath, stats);

  const rootCollectionId = crate.rootEntity.id;

  await processEntity(
    crate.rootEntity,
    localCratePath,
    rootCollectionId,
    parentId,
    stats,
    progress,
  );
};

const processCrateTreeInner = async (
  nodes: CrateTreeNode[],
  basePath: string,
  parentId: string | null,
  stats: ImportStats,
  dataDir: string,
  progress?: ImportProgress,
): Promise<void> => {
  for (const node of nodes) {
    await processCrate(
      node.crate,
      basePath,
      parentId,
      stats,
      dataDir,
      progress,
    );

    const childrenParentId = node.crate.rootEntity.id;

    // Process nested crates
    if (node.children.length > 0) {
      await processCrateTreeInner(
        node.children,
        basePath,
        childrenParentId,
        stats,
        dataDir,
        progress,
      );
    }
  }
};

export const processCrateTree = async (
  nodes: CrateTreeNode[],
  basePath: string,
  parentId: string | null,
  stats: ImportStats,
  dataDir: string,
  progress?: ImportProgress,
): Promise<void> => {
  try {
    await ensureIndex();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(`OpenSearch index setup: ${message}`);
  }

  await processCrateTreeInner(
    nodes,
    basePath,
    parentId,
    stats,
    dataDir,
    progress,
  );

  try {
    await refreshIndex();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    stats.errors.push(`OpenSearch index refresh: ${message}`);
  }
};

const countEntityItems = (entity: CrateEntity): number => {
  let count = 1; // the entity itself
  count += entity.mediaFiles.length;
  for (const child of entity.children) {
    count += countEntityItems(child);
  }
  return count;
};

export const countTreeItems = (nodes: CrateTreeNode[]): number => {
  let total = 0;
  for (const node of nodes) {
    total += countEntityItems(node.crate.rootEntity);
    total += countTreeItems(node.children);
  }
  return total;
};
