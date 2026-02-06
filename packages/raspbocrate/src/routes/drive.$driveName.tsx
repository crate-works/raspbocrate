import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { ArrowLeft, HardDrive, Import, Loader2 } from 'lucide-react';
import { useState } from 'react';
import z from 'zod';
import { CrateTreeList } from '@/components/CrateTree';
import { Button } from '@/components/ui/button';
import { getServerDrives } from '@/server/drives';
import { type ImportStats, processCrateTree } from '@/server/import';
import { getServerDriveContents } from '@/server/rocrate';
import type { Drive } from '@/types/usb';

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
  const getDrives = useServerFn(getServerDrives);

  return useSuspenseQuery({
    queryKey: ['drives'],
    queryFn: () => getDrives(),
    select: (drives) => drives.find((d) => d.name === driveName),
  });
};

const DriveDetailPage = () => {
  const { driveName } = Route.useParams();
  const { data: drive } = useDriveInfo(driveName);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);

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

type ImportStatus = {
  message: string;
  errors: string[];
  failed: boolean;
};

type DriveDetailContentProps = {
  drive: Drive;
  importStatus: ImportStatus | null;
  setImportStatus: (status: ImportStatus | null) => void;
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
        const hasErrors = stats.errors.length > 0;

        let message = `Imported: ${created} created, ${updated} updated`;
        if (hasErrors) {
          message += ` (${stats.errors.length} errors)`;
        }
        setImportStatus({ message, errors: stats.errors, failed: false });
      } else {
        setImportStatus({
          message: `Import failed: ${result.error || 'Unknown error'}`,
          errors: [],
          failed: true,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setImportStatus({
        message: `Import failed: ${message}`,
        errors: [],
        failed: true,
      });
    }
  };

  const hasErrors =
    importStatus && (importStatus.failed || importStatus.errors.length > 0);

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
            hasErrors
              ? 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400'
              : 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
          }`}
        >
          <p>{importStatus.message}</p>
          {importStatus.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-4 space-y-1">
              {importStatus.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
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
