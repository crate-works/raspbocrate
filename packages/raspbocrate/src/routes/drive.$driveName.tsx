import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { ArrowLeft, HardDrive, Import, Loader2 } from 'lucide-react';
import { useState } from 'react';
import z from 'zod';
import { CrateTreeList } from '@/components/CrateTree';
import { Button } from '@/components/ui/button';
import { type ImportStats, processCrateTree } from '@/server/import';
import { getServerDriveContents } from '@/server/rocrate';
import { getServerUsbDrives } from '@/server/usb';

type ImportResult = {
  success: boolean;
  stats: {
    entitiesCreated: number;
    entitiesUpdated: number;
    filesCreated: number;
    filesUpdated: number;
    errors: string[];
  };
  error?: string;
};

const ImportDriveCratesSchema = z.object({
  drivePath: z.string().min(1),
});
const importDriveCrates = createServerFn({ method: 'POST' })
  .inputValidator(ImportDriveCratesSchema)
  .handler(async ({ data: { drivePath } }) => {
    const stats: ImportStats = {
      entitiesCreated: 0,
      entitiesUpdated: 0,
      filesCreated: 0,
      filesUpdated: 0,
      errors: [],
    };

    try {
      // Get drive contents using existing function
      const contents = await getServerDriveContents({ data: { drivePath } });

      // Process all crates
      await processCrateTree(contents.crateTree, drivePath, null, stats);

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error('Failed to import drive crates:', error);

      return {
        success: false,
        stats,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

const useImportCrates = (drivePath: string) => {
  const doImport = useServerFn(importDriveCrates);

  return useMutation({
    mutationKey: ['import-crates', drivePath],
    mutationFn: () => doImport({ data: { drivePath } }),
  });
};

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
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Can't call hooks conditionally, so we need a wrapper component
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

  return (
    <DriveDetailContent
      drive={drive}
      importStatus={importStatus}
      setImportStatus={setImportStatus}
    />
  );
};

type DriveInfo = {
  name: string;
  label: string;
  mountpoint: string;
};

type DriveDetailContentProps = {
  drive: DriveInfo;
  importStatus: string | null;
  setImportStatus: (status: string | null) => void;
};

const DriveDetailContent = ({
  drive,
  importStatus,
  setImportStatus,
}: DriveDetailContentProps) => {
  const { data: contents } = useDriveContents(drive.mountpoint);
  const importMutation = useImportCrates(drive.mountpoint);

  const handleImport = async () => {
    setImportStatus(null);

    try {
      const result = (await importMutation.mutateAsync()) as ImportResult;

      if (result.success) {
        const { stats } = result;
        const created = stats.entitiesCreated + stats.filesCreated;
        const updated = stats.entitiesUpdated + stats.filesUpdated;
        const errorCount = stats.errors.length;

        let message = `Imported: ${created} created, ${updated} updated`;
        if (errorCount > 0) {
          message += ` (${errorCount} errors)`;
        }
        setImportStatus(message);
      } else {
        setImportStatus(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setImportStatus(`Import failed: ${message}`);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/drives">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3 flex-1">
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
        <Button
          onClick={handleImport}
          disabled={importMutation.isPending || contents.crateTree.length === 0}
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Import className="h-4 w-4 mr-2" />
              Import
            </>
          )}
        </Button>
      </div>

      {importStatus && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            importStatus.includes('failed')
              ? 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400'
              : 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
          }`}
        >
          {importStatus}
        </div>
      )}

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
