import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import {
  Container,
  Database,
  FileText,
  HardDrive,
  Loader2,
  Search,
  Server,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { getDataStats, type ResetResult, resetAllData } from '@/server/reset';

const fetchDataStats = createServerFn({ method: 'GET' }).handler(async () => {
  return await getDataStats();
});

const resetData = createServerFn({ method: 'POST' }).handler(async () => {
  return await resetAllData();
});

type ResetStatus = {
  message: string;
  failed: boolean;
};

const formatEntityType = (entityType: string): string => {
  const lastSegment = entityType.split(/[/#]/).pop();

  return lastSegment || entityType;
};

const HomePage = () => {
  const [resetStatus, setResetStatus] = useState<ResetStatus | null>(null);
  const doReset = useServerFn(resetData);
  const getStats = useServerFn(fetchDataStats);

  const statsQuery = useQuery({
    queryKey: ['data-stats'],
    queryFn: () => getStats(),
  });

  const resetMutation = useMutation({
    mutationKey: ['reset-data'],
    mutationFn: () => doReset(),
  });

  const handleReset = async () => {
    setResetStatus(null);

    try {
      const result = (await resetMutation.mutateAsync()) as ResetResult;

      if (result.success) {
        await statsQuery.refetch();
        setResetStatus({
          message: `Reset complete: ${result.entitiesDeleted} entities and ${result.filesDeleted} files deleted.`,
          failed: false,
        });
      } else {
        setResetStatus({
          message: `Reset failed: ${result.error || 'Unknown error'}`,
          failed: true,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setResetStatus({
        message: `Reset failed: ${message}`,
        failed: true,
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to RaspboCrate
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your Raspberry Pi RO-Crate services and import data from USB
          drives.
        </p>
      </div>

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          RaspboCrate is an admin interface for managing Raspberry Pi devices
          running RO-Crate catalogue services:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>
            <strong className="text-foreground">oni-ui</strong> - A web
            interface for browsing and searching RO-Crate catalogues
          </li>
          <li>
            <strong className="text-foreground">arocapi</strong> - The API
            backend that serves catalogue data
          </li>
        </ul>
        <p>
          Use the sidebar to navigate between importing data from USB drives,
          managing services, and monitoring containers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <HardDrive className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold">Import Data</h2>
              <p className="text-sm text-muted-foreground">
                Load catalogues from USB drives into the database
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <Server className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="font-semibold">Services</h2>
              <p className="text-sm text-muted-foreground">
                Manage oni-ui and arocapi services
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <Container className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h2 className="font-semibold">Containers</h2>
              <p className="text-sm text-muted-foreground">
                Monitor and control Docker containers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>

        {statsQuery.data && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Entities</h3>
              </div>
              {statsQuery.data.entityCounts.length > 0 ? (
                <div className="space-y-1.5">
                  {statsQuery.data.entityCounts.map((group) => (
                    <div
                      key={group.entityType}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {formatEntityType(group.entityType)}
                      </span>
                      <span className="font-medium tabular-nums">
                        {group.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Files</h3>
              </div>
              {statsQuery.data.fileCounts.length > 0 ? (
                <div className="space-y-1.5">
                  {statsQuery.data.fileCounts.map((group) => (
                    <div
                      key={group.mediaType}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {group.mediaType}
                      </span>
                      <span className="font-medium tabular-nums">
                        {group.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Index Documents</h3>
              </div>
              <p className="text-2xl font-semibold tabular-nums">
                {statsQuery.data.indexCount}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Clear all imported data to re-import or troubleshoot.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all imported entities, files, and
                  the search index. You will need to re-import data from your
                  USB drives afterwards.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Reset All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {resetStatus && (
          <div
            className={`rounded-lg border p-3 text-sm mt-4 ${
              resetStatus.failed
                ? 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400'
                : 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
            }`}
          >
            <p>{resetStatus.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/')({ component: HomePage });
