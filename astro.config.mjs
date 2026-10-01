import { defineConfig } from 'astro/config';

// Static output (default). Deployed to Vercel from GitHub.
export default defineConfig({
  site: 'https://warrenlongmire.com', // the live address; used for canonical links
  output: 'static',
});
