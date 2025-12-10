export type MediaFile = {
  id: string;
  name: string;
  path: string;
  encodingFormat?: string;
  contentSize?: string;
};

export type CrateEntity = {
  id: string;
  type: string | string[];
  name: string;
  description?: string;
  mediaFiles: MediaFile[];
  children: CrateEntity[];
};

export type RoCrateInfo = {
  path: string;
  name: string;
  description?: string;
  rootEntity: CrateEntity;
};

// A crate node in the directory tree - can contain nested crates
export type CrateTreeNode = {
  crate: RoCrateInfo;
  children: CrateTreeNode[];
};

export type DriveContents = {
  drivePath: string;
  crateTree: CrateTreeNode[];
};
