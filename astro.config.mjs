import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://avanthe.com.br',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
