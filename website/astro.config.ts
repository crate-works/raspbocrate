import { defineConfig } from 'astro/config';

// TODO: re-add @tailwindcss/vite plugin and remove postcss.config.mjs once
// @tailwindcss/vite supports Astro 6's rolldown-vite.
// See: https://github.com/withastro/astro/issues/16542

// https://astro.build/config
export default defineConfig({
  site: 'https://raspbocrate.inodes.dev',
});
