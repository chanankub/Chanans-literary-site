import { defineConfig } from 'astro/config';

// https://chanankub.github.io/My_Website/
export default defineConfig({
  site: 'https://chanankub.github.io',
  base: '/My_Website',
  trailingSlash: 'always',
  redirects: {
    '/translations/i-carry-your-heart-f': '/translations/i-carry-your-heart',
    '/translations/i-carry-your-heart-m': '/translations/i-carry-your-heart',
  },
});
