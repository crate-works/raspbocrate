import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { DrivesList } from '#/components/DrivesList.tsx';
import { drivesQueryOptions } from '#/queries.ts';

const DrivesPage = () => {
  const { data: drives } = useSuspenseQuery(drivesQueryOptions);

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
  loader: ({ context }) => context.queryClient.query(drivesQueryOptions),
  component: DrivesPage,
});
