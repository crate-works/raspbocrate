export type Drive = {
  name: string;
  mountpoint: string | null;
  size: string | null;
  label: string | null;
  hasCatalog: boolean;
  source: 'usb' | 'media';
};

export type LsblkDevice = {
  name: string;
  type: 'disk' | 'part' | 'loop';
  mountpoint: string | null;
  size: string;
  label: string | null;
  hotplug: boolean;
  rm: boolean;
  tran: string | null;
  children?: LsblkDevice[];
};

export type LsblkOutput = {
  blockdevices: LsblkDevice[];
};
