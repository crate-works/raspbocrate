import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://raspbocrate.crate-works.org',
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
