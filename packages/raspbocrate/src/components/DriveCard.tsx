import { HardDrive, FolderOpen, FolderX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UsbDrive } from '@/types/usb';

type DriveCardProps = {
  drive: UsbDrive;
};

export const DriveCard = ({ drive }: DriveCardProps) => {
  const isDisabled = !drive.hasCatalog;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        isDisabled
          ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
          : 'border-gray-600 bg-gray-800 hover:border-blue-500 cursor-pointer',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'rounded-full p-3',
            isDisabled ? 'bg-gray-700' : 'bg-blue-500/20',
          )}
        >
          <HardDrive
            className={cn(
              'h-6 w-6',
              isDisabled ? 'text-gray-500' : 'text-blue-400',
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold truncate',
              isDisabled ? 'text-gray-500' : 'text-white',
            )}
          >
            {drive.label || drive.name}
          </h3>

          <p className="text-sm text-gray-400 truncate mt-1">
            {drive.mountpoint}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-sm text-gray-500">{drive.size}</span>

            <div className="flex items-center gap-1">
              {drive.hasCatalog ? (
                <>
                  <FolderOpen className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">
                    Catalogue found
                  </span>
                </>
              ) : (
                <>
                  <FolderX className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">No catalogue</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
