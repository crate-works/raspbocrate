export type MediaFile = {
  id: string;
  atId: string;
  name: string;
  path: string;
  encodingFormat?: string;
  contentSize?: number;
};

export type IndexData = {
  collectorName: string[];
  countries: string[];
  originatedOn: string | null;
  accessConditionName: string | null;
  languages: string[];
  communicationMode: string[];
  type: string[];
};

export type CrateEntity = {
  id: string;
  atId: string;
  type: string | string[];
  name: string;
  description?: string;
  license?: string;
  mediaFiles: MediaFile[];
  children: CrateEntity[];
  indexData?: IndexData;
};

export type RoCrateInfo = {
  path: string;
  metadataFilename: string;
  name: string;
  description?: string;
  rootEntity: CrateEntity;
};

// A crate node in the directory tree - can contain nested crates
export type CrateTreeNode = {
  crate: RoCrateInfo;
  children: CrateTreeNode[];
};
