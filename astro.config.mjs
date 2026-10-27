import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are built as static files, except /edit and /api/edit/* which run on demand (they need to log you in
// and save to GitHub). The adapter is what lets Vercel run those few routes. Deployed from GitHub.
export default defineConfig({
  site: 'https://warrenlongmire.com', // the live address; used for canonical links
  output: 'static',
  adapter: vercel(),
});
