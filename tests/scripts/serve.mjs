// Starts a throwaway copy of the site for the tests.
//  - copies the project (without .env, .git, GITHUB_TOKEN) into a temp folder
//  - runs the dev server from that copy with a test password and no GitHub token, so the editor saves to the copy
// Your real files, secrets and GitHub repository are never used or changed.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const COPY = path.join(os.tmpdir(), 'wl-site-tests');
const PORT = 4322;
const PASSWORD = 'playwright-test-password';

fs.rmSync(COPY, { recursive: true, force: true });
fs.mkdirSync(COPY, { recursive: true });
execFileSync('rsync', ['-a', '--exclude', 'node_modules', '--exclude', '.git', '--exclude', '.astro', '--exclude', '.env', '--exclude', 'dist', '--exclude', '.vercel', '--exclude', 'tests', `${ROOT}/`, `${COPY}/`]);
try { execFileSync('cp', ['-Rc', path.join(ROOT, 'node_modules'), path.join(COPY, 'node_modules')]); }   // instant copy-on-write on macOS
catch { execFileSync('cp', ['-R', path.join(ROOT, 'node_modules'), path.join(COPY, 'node_modules')]); }

const astro = path.join(COPY, 'node_modules', '.bin', 'astro');
const env = {
  ...process.env,
  EDIT_PASSWORD: PASSWORD,
  GITHUB_TOKEN: '',          // empty = the editor saves to the local copy, never to GitHub
  GITHUB_REPO: '', GITHUB_BRANCH: '',
  ASTRO_TELEMETRY_DISABLED: '1',
};
// Some setups start `astro dev` in the background and return straight away. Either way this script stays
// running until the tests finish, then stops the server (only the one started from the temp copy) and cleans up.
const child = spawn(astro, ['dev', '--port', String(PORT), '--host', 'localhost', '--ignore-lock'], { cwd: COPY, stdio: 'inherit', env });
let stopping = false;
const stop = () => {
  if (stopping) return; stopping = true;
  try { child.kill('SIGTERM'); } catch {}
  try { execFileSync(astro, ['dev', 'stop'], { cwd: COPY, env, stdio: 'ignore' }); } catch {}
  setTimeout(() => { fs.rmSync(COPY, { recursive: true, force: true }); process.exit(0); }, 500);
};
process.on('SIGTERM', stop); process.on('SIGINT', stop);
child.on('exit', (code) => { if (code && !stopping) process.exit(code); });
setInterval(() => {}, 1 << 30);
