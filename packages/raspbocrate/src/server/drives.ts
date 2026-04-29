import { execFile } from 'node:child_process';
import { access, constants, readdir } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { createServerFn } from '@tanstack/react-start';
import type { Drive, LsblkDevice, LsblkOutput } from '#/types/usb.ts';

const execFileAsync = promisify(execFile);

const checkCatalogDirectory = async (mountpoint: string): Promise<boolean> => {
  try {
    const catalogPath = path.join(mountpoint, 'catalog');
    await access(catalogPath, constants.R_OK);

    return true;
  } catch {
    return false;
  }
};

const extractUsbPartitions = (devices: LsblkDevice[]): LsblkDevice[] => {
  const partitions: LsblkDevice[] = [];

  devices.forEach((device) => {
    if (device.tran === 'usb' && device.children) {
      device.children.forEach((child) => {
        if (child.type === 'part' && child.mountpoint) {
          partitions.push(child);
        }
      });
    }
  });

  return partitions;
};

const getUsbDrives = async (): Promise<Drive[]> => {
  try {
    const { stdout } = await execFileAsync('lsblk', [
      '-J',
      '-o',
      'NAME,TYPE,MOUNTPOINT,SIZE,LABEL,RM,TRAN',
    ]);

    const lsblkOutput: LsblkOutput = JSON.parse(stdout);
    const usbPartitions = extractUsbPartitions(lsblkOutput.blockdevices);

    const drives: Drive[] = await Promise.all(
      usbPartitions.map(async (partition) => {
        const hasCatalog = partition.mountpoint
          ? await checkCatalogDirectory(partition.mountpoint)
          : false;

        return {
          name: partition.name,
          mountpoint: partition.mountpoint || 'NOT MOUNTED',
          size: partition.size,
          label: partition.label || 'NO LABEL',
          hasCatalog,
          source: 'usb' as const,
        };
      }),
    );

    return drives;
  } catch (error) {
    console.error('Failed to get USB drives:', error);

    return [];
  }
};

const getMediaDirectoryDrives = async (): Promise<Drive[]> => {
  const mediaDir = process.env.MEDIA_DIR || '/media';

  try {
    const entries = await readdir(mediaDir, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());

    const drives: Drive[] = await Promise.all(
      directories.map(async (dir) => {
        const dirPath = path.join(mediaDir, dir.name);
        const hasCatalog = await checkCatalogDirectory(dirPath);

        return {
          name: dir.name,
          mountpoint: dirPath,
          size: null,
          label: dir.name,
          hasCatalog,
          source: 'media' as const,
        };
      }),
    );

    return drives;
  } catch (error) {
    console.error('Failed to read media directory:', error);

    return [];
  }
};

export const getServerDrives = createServerFn().handler(
  async (): Promise<Drive[]> => {
    const [usbDrives, mediaDrives] = await Promise.all([
      getUsbDrives(),
      getMediaDirectoryDrives(),
    ]);

    const usbMountpoints = new Set(
      usbDrives
        .map((d) => d.mountpoint)
        .filter((mp): mp is string => mp !== null),
    );

    const uniqueMediaDrives = mediaDrives.filter(
      (d) => !d.mountpoint || !usbMountpoints.has(d.mountpoint),
    );

    return [...usbDrives, ...uniqueMediaDrives];
  },
);
