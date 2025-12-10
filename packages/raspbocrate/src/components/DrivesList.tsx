import type { UsbDrive } from '@/types/usb';
import { DriveCard } from './DriveCard';

type DrivesListProps = {
  drives: UsbDrive[];
};

export const DrivesList = ({ drives }: DrivesListProps) => {
  if (drives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No USB drives detected</p>
        <p className="text-gray-500 text-sm mt-2">
          Insert a USB drive and refresh the page
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {drives.map((drive) => (
        <DriveCard key={drive.name} drive={drive} />
      ))}
    </div>
  );
};
