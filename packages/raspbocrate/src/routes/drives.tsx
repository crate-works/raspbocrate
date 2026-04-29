import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { DrivesList } from '#/components/DrivesList.tsx';
import { getServerDrives } from '#/server/drives.ts';

const useDrives = () => {
  const getDrives = useServerFn(getServerDrives);

  return useSuspenseQuery({
    queryKey: ['drives'],
    queryFn: () => getDrives(),
  });
};

const DrivesPage = () => {
  const { data: drives } = useDrives();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drives</h1>
        <p className="text-muted-foreground mt-2">
          Select a drive with a catalogue to import data.
        </p>
      </div>
      <DrivesList drives={drives} />
    </div>
  );
};

export const Route = createFileRoute('/drives')({
  component: DrivesPage,
});
