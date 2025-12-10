import { createFileRoute } from '@tanstack/react-router';

const App = () => (
  <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
    <h1 className="text-3xl font-bold text-white p-4">
      Welcome to RaspboCrate!
    </h1>
  </div>
);

export const Route = createFileRoute('/')({ component: App });
