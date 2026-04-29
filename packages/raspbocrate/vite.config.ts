import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';

const config = defineConfig({
  base: '/admin/',
  plugins: [
    devtools(),
    tanstackStart(),
    nitro({
      baseURL: '/admin/',
    }),
    viteReact(),

    tailwindcss(),

    visualizer({
      filename: 'stats.html',
      emitFile: true,
      template: 'treemap',
    }) as PluginOption,
  ],
});

export default config;
