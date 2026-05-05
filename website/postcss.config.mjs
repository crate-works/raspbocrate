// TODO: revert to @tailwindcss/vite (in astro.config.ts) and delete this file
// once @tailwindcss/vite supports Astro 6's rolldown-vite.
// See: https://github.com/withastro/astro/issues/16542
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
