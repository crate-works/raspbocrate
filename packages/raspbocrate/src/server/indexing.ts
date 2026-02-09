import { opensearch } from '@/opensearch';

const INDEX_NAME = 'entities';

export type EntityDocument = {
  rocrateId: string;
  name: string;
  description: string;
  entityType: string;
  memberOf: string | null;
  rootCollection: string;
  collector_name: string[];
  countries: string[];
  originatedOn: string | null;
  access_condition_name: string | null;
  languages: string[];
  communicationMode: string[];
  type: string[];
  encodingFormat: string[];
  entity_type: string;
};

const INDEX_MAPPINGS = {
  properties: {
    rocrateId: { type: 'keyword' as const },
    name: { type: 'text' as const },
    description: { type: 'text' as const },
    entityType: { type: 'keyword' as const },
    memberOf: { type: 'keyword' as const },
    rootCollection: { type: 'keyword' as const },
    collector_name: { type: 'keyword' as const },
    countries: { type: 'keyword' as const },
    originatedOn: { type: 'date' as const, ignore_malformed: true },
    access_condition_name: { type: 'keyword' as const },
    languages: { type: 'keyword' as const },
    communicationMode: { type: 'keyword' as const },
    type: { type: 'keyword' as const },
    encodingFormat: { type: 'keyword' as const },
    entity_type: { type: 'keyword' as const },
  },
};

export const ensureIndex = async (): Promise<void> => {
  const { body: exists } = await opensearch.indices.exists({
    index: INDEX_NAME,
  });

  if (!exists) {
    await opensearch.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: INDEX_MAPPINGS,
      },
    });
  }
};

export const indexEntityDocument = async (
  doc: EntityDocument,
): Promise<void> => {
  await opensearch.index({
    index: INDEX_NAME,
    id: doc.rocrateId,
    body: doc,
  });
};

export const refreshIndex = async (): Promise<void> => {
  await opensearch.indices.refresh({ index: INDEX_NAME });
};
