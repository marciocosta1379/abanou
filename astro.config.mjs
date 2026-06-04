import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://abanou.com.br',
  integrations: [
    mdx(),
    sitemap(),
  ],
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
