import { queryOptions } from '@tanstack/react-query';
import { getServerDrives } from '#/server/drives.ts';
import { getActiveImport } from '#/server/import-jobs.ts';
import { getServerDriveContents } from '#/server/rocrate.ts';

export const drivesQueryOptions = queryOptions({
  queryKey: ['drives'],
  queryFn: () => getServerDrives(),
});

export const driveContentsQueryOptions = (drivePath: string) =>
  queryOptions({
    queryKey: ['drive-contents', drivePath],
    queryFn: () => getServerDriveContents({ data: { drivePath } }),
  });

export const activeImportQueryOptions = queryOptions({
  queryKey: ['active-import'],
  queryFn: () => getActiveImport(),
  staleTime: 0,
});
