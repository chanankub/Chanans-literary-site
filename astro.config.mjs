import { defineConfig } from 'astro/config';

// https://chanankub.github.io/Chanans-literary-site/
export default defineConfig({
  site: 'https://chanankub.github.io',
  base: '/Chanans-literary-site',
  trailingSlash: 'always',
  redirects: {
    '/translations/i-carry-your-heart-f': '/translations/i-carry-your-heart',
    '/translations/i-carry-your-heart-m': '/translations/i-carry-your-heart',
  },
});
