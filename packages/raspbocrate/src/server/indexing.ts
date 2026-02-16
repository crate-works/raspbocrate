import { opensearch } from '@/opensearch';

export const INDEX_NAME = 'entities';

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
  inLanguage: string[];
  communicationMode: string[];
  type: string[];
  mediaType: string[];
};

const TEXT_WITH_KEYWORD = {
  type: 'text' as const,
  fields: { keyword: { type: 'keyword' as const } },
};

const INDEX_MAPPINGS = {
  properties: {
    rocrateId: TEXT_WITH_KEYWORD,
    name: TEXT_WITH_KEYWORD,
    description: { type: 'text' as const },
    entityType: TEXT_WITH_KEYWORD,
    memberOf: TEXT_WITH_KEYWORD,
    rootCollection: TEXT_WITH_KEYWORD,
    collector_name: TEXT_WITH_KEYWORD,
    countries: TEXT_WITH_KEYWORD,
    originatedOn: { type: 'date' as const, ignore_malformed: true },
    access_condition_name: TEXT_WITH_KEYWORD,
    inLanguage: TEXT_WITH_KEYWORD,
    communicationMode: TEXT_WITH_KEYWORD,
    type: TEXT_WITH_KEYWORD,
    mediaType: TEXT_WITH_KEYWORD,
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
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
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

export const deleteIndex = async (): Promise<void> => {
  const { body: exists } = await opensearch.indices.exists({
    index: INDEX_NAME,
  });

  if (exists) {
    await opensearch.indices.delete({ index: INDEX_NAME });
  }
};

export const refreshIndex = async (): Promise<void> => {
  await opensearch.indices.refresh({ index: INDEX_NAME });
};
