import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getServerUsbDrives } from '@/server/usb';
import { DrivesList } from '@/components/DrivesList';
import { useServerFn } from '@tanstack/react-start';

const useDrives = () => {
  const getUsbDrives = useServerFn(getServerUsbDrives);

  return useSuspenseQuery({
    queryKey: ['usb-drives'],
    queryFn: () => getUsbDrives(),
  });
};

const DrivesPage = () => {
  console.log('🪚 ⭐');
  const { data: drives } = useDrives();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">USB Drives</h1>
        <p className="text-muted-foreground mt-2">
          Select a USB drive with a catalogue to import data.
        </p>
      </div>
      <DrivesList drives={drives} />
    </div>
  );
};

export const Route = createFileRoute('/drives')({
  component: DrivesPage,
});
