import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PORT = 4322;
export const BASE_URL = `http://localhost:${PORT}`;
/** The password of the throwaway test copy only. It has nothing to do with your real EDIT_PASSWORD. */
export const PASSWORD = 'playwright-test-password';
/** The real project (read only for the tests). */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/** The throwaway copy the test server runs from. Edits made by the editor tests land here, never in ROOT. */
export const COPY = path.join(os.tmpdir(), 'wl-site-tests');
