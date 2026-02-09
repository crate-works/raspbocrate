import { Client } from '@opensearch-project/opensearch';

declare global {
  var __opensearch: Client | undefined;
}

const opensearchUrl = process.env.OPENSEARCH_URL || 'http://localhost:9200';

export const opensearch =
  globalThis.__opensearch || new Client({ node: opensearchUrl });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__opensearch = opensearch;
}
