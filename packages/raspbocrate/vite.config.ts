import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig({
  plugins: [
    tanstackStart(),
    nitro(),
    viteReact(),

    tailwindcss(),

    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    visualizer({
      filename: 'stats.html',
      emitFile: true,
      template: 'treemap',
    }) as PluginOption,
  ],
});

export default config;
