import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, HardDrive, Import, Loader2 } from 'lucide-react';
import { CrateTreeList } from '#/components/CrateTree.tsx';
import { Button } from '#/components/ui/button.tsx';
import { getServerDrives } from '#/server/drives.ts';
import type { ImportStats } from '#/server/import.ts';
import {
  type GetImportStatusResult,
  getActiveImport,
  getImportStatus,
  isTerminalPhase,
  startImport,
} from '#/server/import-jobs.ts';
import { getServerDriveContents } from '#/server/rocrate.ts';
import type { Drive } from '#/types/usb.ts';

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

const useActiveImport = () => {
  const fetchActive = useServerFn(getActiveImport);

  return useSuspenseQuery({
    queryKey: ['active-import'],
    queryFn: () => fetchActive(),
    staleTime: 0,
  });
};

const useStartImport = () => {
  const start = useServerFn(startImport);

  return useMutation({
    mutationFn: (drivePath: string) => start({ data: { drivePath } }),
  });
};

const useImportStatus = (jobId: string | null) => {
  const fetchStatus = useServerFn(getImportStatus);

  return useQuery({
    queryKey: ['import-status', jobId],
    queryFn: () => fetchStatus({ data: { jobId: jobId as string } }),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1500;
      return isTerminalPhase(data.phase) ? false : 1500;
    },
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

  return <DriveDetailContent drive={drive} />;
};

type DriveDetailContentProps = {
  drive: Drive;
};

const DriveDetailContent = ({ drive }: DriveDetailContentProps) => {
  const { data: contents } = useDriveContents(drive.mountpoint);
  const { data: activeJob } = useActiveImport();
  const startMutation = useStartImport();

  const localJobId = startMutation.data?.jobId ?? null;
  const reattachedJobId =
    activeJob && activeJob.drivePath === drive.mountpoint
      ? activeJob.jobId
      : null;
  const jobId = localJobId ?? reattachedJobId;

  const { data: status } = useImportStatus(jobId);

  // Treat "jobId set but status not yet fetched" as still importing — otherwise
  // the button is briefly clickable in the gap before the first poll response.
  const isImporting = !!jobId && (!status || !isTerminalPhase(status.phase));

  const handleImport = () => {
    startMutation.mutate(drive.mountpoint);
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
          disabled={
            isImporting ||
            startMutation.isPending ||
            contents.crateTree.length === 0
          }
        >
          {isImporting || startMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Import className="h-4 w-4 mr-2" />
              Import Metadata
            </>
          )}
        </Button>
      </div>

      <ImportStatusCard
        startError={startMutation.error}
        status={status ?? null}
      />

      <div>
        <h2 className="text-lg font-semibold mb-4">
          RO-Crates ({contents.crateTree.length})
        </h2>
        <CrateTreeList crateTree={contents.crateTree} />
      </div>
    </div>
  );
};

type ImportStatusCardProps = {
  startError: Error | null;
  status: GetImportStatusResult | null;
};

const ImportStatusCard = ({ startError, status }: ImportStatusCardProps) => {
  if (startError) {
    return <ErrorPanel message={startError.message} />;
  }

  if (!status) return null;

  if (status.phase === 'lost') {
    return (
      <ErrorPanel message="Import was interrupted (server restart). Please retry." />
    );
  }

  if (status.phase === 'failed') {
    return (
      <ErrorPanel
        message={`Import failed: ${status.error ?? 'Unknown error'}`}
        errors={status.stats.errors}
      />
    );
  }

  if (status.phase === 'done') {
    return (
      <DonePanel
        stats={status.stats}
        startedAt={status.startedAt}
        finishedAt={status.finishedAt ?? status.startedAt}
      />
    );
  }

  return (
    <ProgressPanel
      phase={status.phase}
      processed={status.processed}
      total={status.total}
      currentItem={status.currentItem}
      errors={status.stats.errors}
    />
  );
};

type ProgressPanelProps = {
  phase: 'preparing' | 'importing';
  processed: number;
  total: number;
  currentItem: string;
  errors: string[];
};

const ProgressPanel = ({
  phase,
  processed,
  total,
  currentItem,
  errors,
}: ProgressPanelProps) => {
  const pct =
    total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
  const phaseLabel = phase === 'preparing' ? 'Scanning drive…' : 'Importing…';

  return (
    <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-blue-700 dark:text-blue-400">
          {phaseLabel}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {total > 0 ? `${processed} / ${total}` : '…'}
        </span>
      </div>
      <div className="w-full h-2 bg-blue-500/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {currentItem && (
        <p className="mt-2 text-xs text-muted-foreground truncate">
          {currentItem}
        </p>
      )}
      {errors.length > 0 && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          {errors.length} non-fatal error{errors.length === 1 ? '' : 's'} so far
        </p>
      )}
    </div>
  );
};

type DonePanelProps = {
  stats: ImportStats;
  startedAt: number;
  finishedAt: number;
};

const formatDuration = (ms: number): string => {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds - minutes * 60);
  return `${minutes}m ${seconds}s`;
};

const ErrorList = ({ errors }: { errors: string[] }) =>
  errors.length === 0 ? null : (
    <ul className="mt-2 list-disc pl-4 space-y-1">
      {errors.map((err) => (
        <li key={err}>{err}</li>
      ))}
    </ul>
  );

const DonePanel = ({ stats, startedAt, finishedAt }: DonePanelProps) => {
  const created = stats.entitiesCreated + stats.filesCreated;
  const updated = stats.entitiesUpdated + stats.filesUpdated;
  const hasErrors = stats.errors.length > 0;

  let message = `Imported in ${formatDuration(finishedAt - startedAt)}: ${created} created, ${updated} updated`;
  if (stats.filesSkipped > 0) {
    message += `, ${stats.filesSkipped} files skipped (not on disk)`;
  }
  if (hasErrors) {
    message += ` (${stats.errors.length} errors)`;
  }

  const colour = hasErrors
    ? 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400'
    : 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400';

  return (
    <div className={`rounded-lg border p-3 text-sm ${colour}`}>
      <p>{message}</p>
      <ErrorList errors={stats.errors} />
    </div>
  );
};

type ErrorPanelProps = {
  message: string;
  errors?: string[];
};

const ErrorPanel = ({ message, errors }: ErrorPanelProps) => (
  <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
    <p>{message}</p>
    <ErrorList errors={errors ?? []} />
  </div>
);

export const Route = createFileRoute('/drive/$driveName')({
  component: DriveDetailPage,
});
