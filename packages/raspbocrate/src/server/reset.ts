import { prisma } from '@/db';
import { opensearch } from '@/opensearch';
import { deleteIndex, INDEX_NAME } from './indexing';

export type DataStats = {
  entityCounts: { entityType: string; count: number }[];
  fileCount: number;
  indexCount: number;
};

export const getDataStats = async (): Promise<DataStats> => {
  const [entityGroups, fileCount, indexCount] = await Promise.all([
    prisma.entity.groupBy({
      by: ['entityType'],
      _count: { entityType: true },
      orderBy: { _count: { entityType: 'desc' } },
    }),
    prisma.file.count(),
    getIndexCount(),
  ]);

  return {
    entityCounts: entityGroups.map((g) => ({
      entityType: g.entityType,
      count: g._count.entityType,
    })),
    fileCount,
    indexCount,
  };
};

const getIndexCount = async (): Promise<number> => {
  try {
    const { body: exists } = await opensearch.indices.exists({
      index: INDEX_NAME,
    });

    if (!exists) {
      return 0;
    }

    const { body } = await opensearch.count({ index: INDEX_NAME });

    return body.count as number;
  } catch {
    return 0;
  }
};

export type ResetResult = {
  success: boolean;
  filesDeleted: number;
  entitiesDeleted: number;
  error?: string;
};

export const resetAllData = async (): Promise<ResetResult> => {
  try {
    const { count: filesDeleted } = await prisma.file.deleteMany();
    const { count: entitiesDeleted } = await prisma.entity.deleteMany();
    await deleteIndex();

    return {
      success: true,
      filesDeleted,
      entitiesDeleted,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      filesDeleted: 0,
      entitiesDeleted: 0,
      error: message,
    };
  }
};
