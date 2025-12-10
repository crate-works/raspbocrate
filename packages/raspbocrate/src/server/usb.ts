import { createServerFn } from '@tanstack/react-start';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, constants } from 'node:fs/promises';
import path from 'node:path';
import type { UsbDrive, LsblkOutput, LsblkDevice } from '@/types/usb';

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
    // Check if this is a USB disk with children (partitions)
    if (
      device.tran === 'usb' &&
      device.hotplug &&
      device.rm &&
      device.children
    ) {
      device.children.forEach((child) => {
        // Only include mounted partitions
        if (child.type === 'part' && child.mountpoint) {
          partitions.push(child);
        }
      });
    }
  });

  return partitions;
};

export const getUsbDrives = createServerFn().handler(
  async (): Promise<UsbDrive[]> => {
    try {
      const { stdout } = await execFileAsync('lsblk', [
        '-J',
        '-o',
        'NAME,TYPE,MOUNTPOINT,SIZE,LABEL,HOTPLUG,RM,TRAN',
      ]);

      const lsblkOutput: LsblkOutput = JSON.parse(stdout);
      const usbPartitions = extractUsbPartitions(lsblkOutput.blockdevices);

      const drives: UsbDrive[] = await Promise.all(
        usbPartitions.map(async (partition) => {
          const hasCatalog = await checkCatalogDirectory(partition.mountpoint!);

          return {
            name: partition.name,
            mountpoint: partition.mountpoint!,
            size: partition.size,
            label: partition.label,
            hasCatalog,
          };
        }),
      );

      return drives;
    } catch (error) {
      console.error('Failed to get USB drives:', error);
      throw new Error('Failed to detect USB drives');
    }
  },
);
