// Settings for the /edit page. Secrets come from environment variables (set in Vercel, or in a local .env file):
//   EDIT_PASSWORD  the one password that unlocks /edit
//   GITHUB_TOKEN   a fine-grained GitHub token limited to this repository (Contents: read and write)
//   GITHUB_REPO    optional, "owner/name" (defaults below)
//   GITHUB_BRANCH  optional (defaults to main)
export const env = (key: string): string | undefined =>
  (typeof process !== 'undefined' ? process.env[key] : undefined) ?? (import.meta.env as Record<string, string | undefined>)[key];

export const REPO = () => env('GITHUB_REPO') || 'wlongmire/warrenlongmiredotcom';
export const BRANCH = () => env('GITHUB_BRANCH') || 'main';

export const SESSION_HOURS = 4;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept request bodies up to about 4.5 MB
export const MAX_TEXT_BYTES = 100 * 1024;
