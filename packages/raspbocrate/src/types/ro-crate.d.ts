declare module 'ro-crate' {
  export interface ROCrateOptions {
    array?: boolean;
    link?: boolean;
  }

  export interface Entity {
    '@id': string;
    '@type'?: string | string[];
    name?: string | string[];
    description?: string;
    hasPart?: Entity | Entity[];
    [key: string]: unknown;
  }

  export class ROCrate {
    constructor(data?: unknown, options?: ROCrateOptions);
    rootDataset: Entity;
    graph: Entity[];
    getEntity(id: string): Entity | undefined;
    addEntity(entity: Entity): void;
  }
}
