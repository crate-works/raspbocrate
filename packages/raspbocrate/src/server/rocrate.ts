import { createServerFn } from '@tanstack/react-start';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { ROCrate } from 'ro-crate';
import type {
  CrateEntity,
  CrateTreeNode,
  MediaFile,
  RoCrateInfo,
} from '@/types/rocrate';
import { z } from 'zod';

const RO_CRATE_METADATA_FILENAME = 'ro-crate-metadata.json';

const findRoCrateFiles = async (basePath: string): Promise<string[]> => {
  const roCrateFiles: string[] = [];

  const scanDirectory = async (dirPath: string): Promise<void> => {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (
          entry.isFile() &&
          entry.name === RO_CRATE_METADATA_FILENAME
        ) {
          roCrateFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dirPath}:`, error);
    }
  };

  await scanDirectory(basePath);

  return roCrateFiles;
};

const getEntityType = (entity: {
  '@type'?: string | string[];
}): string | string[] => {
  const type = entity['@type'];
  if (!type) {
    return 'Thing';
  }

  return type;
};

const getEntityName = (entity: {
  name?: string | string[];
  '@id': string;
}): string => {
  const name = entity.name;
  if (Array.isArray(name)) {
    return name[0] || entity['@id'];
  }

  return name || entity['@id'];
};

const isMediaType = (type: string | string[]): boolean => {
  const mediaTypes = [
    'MediaObject',
    'AudioObject',
    'VideoObject',
    'ImageObject',
    'File',
  ];
  const types = Array.isArray(type) ? type : [type];

  return types.some((t) => mediaTypes.includes(t));
};

const isDataEntity = (entity: {
  '@type'?: string | string[];
  '@id': string;
}): boolean => {
  const type = getEntityType(entity);
  const types = Array.isArray(type) ? type : [type];

  // Data entities are files, datasets, or media objects
  const dataTypes = [
    'File',
    'Dataset',
    'MediaObject',
    'AudioObject',
    'VideoObject',
    'ImageObject',
    'CreativeWork',
  ];

  // Exclude metadata descriptor and root
  if (entity['@id'] === 'ro-crate-metadata.json') {
    return false;
  }

  return types.some((t) => dataTypes.includes(t));
};

const parseRoCrate = async (
  filePath: string,
  basePath: string,
): Promise<RoCrateInfo> => {
  const content = await readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  const crate = new ROCrate(data, { array: false, link: true });

  const rootDataset = crate.rootDataset;
  const cratePath = path.dirname(filePath);
  const relativePath = path.relative(basePath, cratePath);

  // Build entity tree from hasPart relationships
  const buildEntityTree = (
    entity: Record<string, unknown>,
    visited: Set<string> = new Set(),
  ): CrateEntity => {
    const entityId = entity['@id'] as string;

    if (visited.has(entityId)) {
      return {
        id: entityId,
        type: getEntityType(entity as { '@type'?: string | string[] }),
        name: getEntityName(
          entity as { name?: string | string[]; '@id': string },
        ),
        mediaFiles: [],
        children: [],
      };
    }
    visited.add(entityId);

    const mediaFiles: MediaFile[] = [];
    const children: CrateEntity[] = [];

    // Get hasPart items
    const hasPart = entity.hasPart;
    if (hasPart) {
      const parts = Array.isArray(hasPart) ? hasPart : [hasPart];

      parts.forEach((part: Record<string, unknown>) => {
        if (!part || typeof part !== 'object') return;

        const partType = getEntityType(part as { '@type'?: string | string[] });

        if (isMediaType(partType)) {
          // It's a media file
          mediaFiles.push({
            id: part['@id'] as string,
            name: getEntityName(
              part as { name?: string | string[]; '@id': string },
            ),
            path: path.join(cratePath, part['@id'] as string),
            encodingFormat: part.encodingFormat as string | undefined,
            contentSize: part.contentSize as string | undefined,
          });
        } else if (
          isDataEntity(part as { '@type'?: string | string[]; '@id': string })
        ) {
          // It's a nested entity (like a Dataset)
          children.push(buildEntityTree(part, visited));
        }
      });
    }

    return {
      id: entityId,
      type: getEntityType(entity as { '@type'?: string | string[] }),
      name: getEntityName(
        entity as { name?: string | string[]; '@id': string },
      ),
      description: entity.description as string | undefined,
      mediaFiles,
      children,
    };
  };

  const rootEntity = buildEntityTree(rootDataset as Record<string, unknown>);

  return {
    path: relativePath || '.',
    name: getEntityName(
      rootDataset as { name?: string | string[]; '@id': string },
    ),
    description: rootDataset.description as string | undefined,
    rootEntity,
  };
};

// Build a tree structure from flat list of crates based on their paths
const buildCrateTree = (crates: RoCrateInfo[]): CrateTreeNode[] => {
  // Sort by path depth (fewer segments first) to process parents before children
  const sortedCrates = [...crates].sort((a, b) => {
    const aDepth = a.path === '.' ? 0 : a.path.split('/').length;
    const bDepth = b.path === '.' ? 0 : b.path.split('/').length;

    return aDepth - bDepth;
  });

  const rootNodes: CrateTreeNode[] = [];
  const nodeMap = new Map<string, CrateTreeNode>();

  sortedCrates.forEach((crate) => {
    const node: CrateTreeNode = { crate, children: [] };
    nodeMap.set(crate.path, node);

    // Find the closest parent crate
    const pathParts = crate.path === '.' ? [] : crate.path.split('/');
    let parentNode: CrateTreeNode | undefined;

    // Walk up the path to find a parent crate
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const parentPath = pathParts.slice(0, i).join('/') || '.';
      parentNode = nodeMap.get(parentPath);
      if (parentNode) break;
    }

    if (parentNode) {
      parentNode.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
};

const GetDriveContentsSchema = z.object({
  drivePath: z.string().min(1),
});

export const getServerDriveContents = createServerFn({ method: 'GET' })
  .inputValidator(GetDriveContentsSchema)
  .handler(async ({ data: { drivePath } }) => {
    try {
      // Verify the path exists and is a directory
      const pathStat = await stat(drivePath);
      if (!pathStat.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      // Find all ro-crate-metadata.json files
      const roCrateFiles = await findRoCrateFiles(drivePath);

      // Parse each RO-Crate
      const crates: RoCrateInfo[] = [];
      for (const filePath of roCrateFiles) {
        try {
          const crateInfo = await parseRoCrate(filePath, drivePath);
          crates.push(crateInfo);
        } catch (error) {
          console.warn(`Failed to parse RO-Crate at ${filePath}:`, error);
        }
      }

      // Build tree structure based on directory hierarchy
      const crateTree = buildCrateTree(crates);

      return {
        drivePath,
        crateTree,
      };
    } catch (error) {
      console.error('Failed to get drive contents:', error);
      throw new Error('Failed to read drive contents');
    }
  });
