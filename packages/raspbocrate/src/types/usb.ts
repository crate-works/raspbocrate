export type UsbDrive = {
  name: string;
  mountpoint: string;
  size: string;
  label: string | null;
  hasCatalog: boolean;
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
