import { createFileRoute } from '@tanstack/react-router';
import { Container, HardDrive, Server } from 'lucide-react';

const HomePage = () => (
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
      <h2 className="text-lg font-semibold mb-4">About RaspboCrate</h2>
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
    </div>
  </div>
);

export const Route = createFileRoute('/')({ component: HomePage });
