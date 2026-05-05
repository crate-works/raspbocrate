import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import {
  blankStats,
  countTreeItems,
  type ImportStats,
  processCrateTree,
} from '#/server/import.ts';
import { getServerDriveContents } from '#/server/rocrate.ts';

type ImportJobPhase = 'preparing' | 'importing' | 'done' | 'failed' | 'lost';

type ImportJobState = {
  jobId: string;
  drivePath: string;
  phase: ImportJobPhase;
  processed: number;
  total: number;
  currentItem: string;
  stats: ImportStats;
  error?: string;
  startedAt: number;
  finishedAt?: number;
};

export type GetImportStatusResult =
  | ImportJobState
  | { jobId: string; phase: 'lost' };

export const isTerminalPhase = (phase: ImportJobPhase): boolean =>
  phase === 'done' || phase === 'failed' || phase === 'lost';

// Single-slot model: at most one import runs at a time.
let currentJob: ImportJobState | null = null;

const runImport = async (job: ImportJobState): Promise<void> => {
  try {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

    const contents = await getServerDriveContents({
      data: { drivePath: job.drivePath },
    });

    job.total = countTreeItems(contents.crateTree);
    job.phase = 'importing';

    await processCrateTree(
      contents.crateTree,
      job.drivePath,
      null,
      job.stats,
      dataDir,
      {
        setCurrentItem: (label) => {
          job.currentItem = label;
        },
        tickProcessed: () => {
          job.processed += 1;
        },
      },
    );

    job.phase = 'done';
    job.finishedAt = Date.now();
  } catch (error) {
    job.phase = 'failed';
    job.error =
      error instanceof Error ? error.message : 'Unknown error occurred';
    job.finishedAt = Date.now();
    console.error('Import job failed:', error);
  }
};

const StartImportSchema = z.object({
  drivePath: z.string().min(1),
});

export const startImport = createServerFn({ method: 'POST' })
  .inputValidator(StartImportSchema)
  .handler(({ data: { drivePath } }): { jobId: string } => {
    if (currentJob && !isTerminalPhase(currentJob.phase)) {
      if (currentJob.drivePath === drivePath) {
        return { jobId: currentJob.jobId };
      }
      throw new Error(
        `Another import is already running for ${currentJob.drivePath}`,
      );
    }

    const jobId = randomUUID();
    const job: ImportJobState = {
      jobId,
      drivePath,
      phase: 'preparing',
      processed: 0,
      total: 0,
      currentItem: '',
      stats: blankStats(),
      startedAt: Date.now(),
    };
    currentJob = job;
    runImport(job);

    return { jobId };
  });

const GetImportStatusSchema = z.object({
  jobId: z.string(),
});

export const getImportStatus = createServerFn({ method: 'GET' })
  .inputValidator(GetImportStatusSchema)
  .handler(({ data: { jobId } }): GetImportStatusResult => {
    if (!currentJob || currentJob.jobId !== jobId) {
      return { jobId, phase: 'lost' };
    }
    return currentJob;
  });

export const getActiveImport = createServerFn({ method: 'GET' }).handler(
  (): { jobId: string; drivePath: string } | null => {
    if (!currentJob || isTerminalPhase(currentJob.phase)) {
      return null;
    }
    return { jobId: currentJob.jobId, drivePath: currentJob.drivePath };
  },
);
