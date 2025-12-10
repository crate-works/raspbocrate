import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft, HardDrive } from 'lucide-react';
import { getServerDriveContents } from '@/server/rocrate';
import { getServerUsbDrives } from '@/server/usb';
import { CrateTreeList } from '@/components/CrateTree';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';

const useDriveContents = (mountpoint: string) => {
  const getDriveContents = useServerFn(getServerDriveContents);

  return useSuspenseQuery({
    queryKey: ['drive-contents', mountpoint],
    queryFn: () => getDriveContents({ data: { drivePath: mountpoint } }),
  });
};

const useDriveInfo = (driveName: string) => {
  const getUsbDrives = useServerFn(getServerUsbDrives);

  return useSuspenseQuery({
    queryKey: ['usb-drives'],
    queryFn: () => getUsbDrives(),
    select: (drives) => drives.find((d) => d.name === driveName),
  });
};

const DriveDetailPage = () => {
  const { driveName } = Route.useParams();
  const { data: drive } = useDriveInfo(driveName);

  if (!drive) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/drives">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Drive Not Found</h1>
        </div>
        <p className="text-muted-foreground">
          The drive &quot;{driveName}&quot; is no longer connected or mounted.
        </p>
      </div>
    );
  }

  const { data: contents } = useDriveContents(drive.mountpoint);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/drives">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-500/10 p-2">
            <HardDrive className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {drive.label || drive.name}
            </h1>
            <p className="text-sm text-muted-foreground">{drive.mountpoint}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          RO-Crates ({contents.crateTree.length})
        </h2>
        <CrateTreeList crateTree={contents.crateTree} />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/drive/$driveName')({
  component: DriveDetailPage,
});
