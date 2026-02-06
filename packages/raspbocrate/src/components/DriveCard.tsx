import { Link } from '@tanstack/react-router';
import { Folder, FolderOpen, FolderX, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Drive } from '@/types/usb';

type DriveCardProps = {
  drive: Drive;
};

export const DriveCard = ({ drive }: DriveCardProps) => {
  const isDisabled = !drive.hasCatalog;
  const DriveIcon = drive.source === 'media' ? Folder : HardDrive;

  const content = (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'rounded-full p-3',
          isDisabled ? 'bg-muted' : 'bg-blue-500/10',
        )}
      >
        <DriveIcon
          className={cn(
            'h-6 w-6',
            isDisabled ? 'text-muted-foreground' : 'text-blue-500',
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            'font-semibold truncate',
            isDisabled ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {drive.label || drive.name}
        </h3>

        <p className="text-sm text-muted-foreground truncate mt-1">
          {drive.mountpoint}
        </p>

        <div className="flex items-center gap-4 mt-3">
          {drive.size && (
            <span className="text-sm text-muted-foreground">{drive.size}</span>
          )}

          <div className="flex items-center gap-1">
            {drive.hasCatalog ? (
              <>
                <FolderOpen className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Catalogue found</span>
              </>
            ) : (
              <>
                <FolderX className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  No catalogue
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isDisabled) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-4 transition-colors',
          'opacity-50 cursor-not-allowed',
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to="/drive/$driveName"
      params={{ driveName: drive.name }}
      className={cn(
        'block rounded-lg border bg-card p-4 transition-colors',
        'hover:border-primary cursor-pointer',
      )}
    >
      {content}
    </Link>
  );
};
