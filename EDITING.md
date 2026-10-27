# Editing the site from the web (/edit)

`/edit` is a password-protected page for changing the site's **content**: case studies, My Journey steps,
the About text, the site details (name, email, footer links, contact-form reasons), pictures, files and the four
resume PDFs. It cannot change layouts, sections, styles or code.

Every save becomes a commit on GitHub (`main`), and Vercel redeploys the site about a minute later.
Because each save is a commit, every change is in the history and can be undone.

## One-time setup (about 10 minutes)

1. **Make a GitHub token** (this lets the page save to the repository):
   GitHub → your profile picture → Settings → Developer settings → Personal access tokens →
   *Fine-grained tokens* → Generate new token.
   - Resource owner: the account that owns the repository
   - Repository access: **Only select repositories** → choose this repository
   - Repository permissions → **Contents: Read and write** (leave everything else at "No access")
   - Pick an expiry (e.g. 1 year) and copy the token once it is shown.
2. **Add two settings in Vercel**: Project → Settings → Environment Variables (Production):
   - `EDIT_PASSWORD` = a long phrase (4+ random words is good)
   - `GITHUB_TOKEN` = the token from step 1
   - only if the repository is different from the default: `GITHUB_REPO` (`owner/name`) and `GITHUB_BRANCH`
3. **Redeploy** (Deployments → the latest one → ⋯ → Redeploy) so the settings take effect.
4. Open `https://<your-site>/edit` and sign in.

## Using it

- Pick a case study or journey step on the left. **Details** (the top box) are the named lines at the top of the
  file; **Text** is the description. Press **Save**. The page checks everything before saving and says what to fix.
- **+ New case study / + New step** makes a draft you can fill in. New case studies start with `draft: true`, which keeps
  them off the site until you remove that line (this is also how to hide one instead of deleting it).
- **Upload** pictures first, then paste the path it gives you into the Details box (`src:` for a picture, `url:` for an
  artifact). Pictures are shrunk automatically. Files can be up to 4 MB; bigger files must be added on github.com.
- Resumes: Upload → "A resume PDF" → choose which one. The file name stays the same, so the cards just update.

## The safety rules

- **Password login**: one shared password, checked on the server. Sessions last 4 hours. Five wrong tries lock that
  visitor out for 15 minutes (a speed bump, held in memory, so use a long password). Changing `EDIT_PASSWORD`
  signs everyone out. Signing out clears your browser's cookie, but the token itself is only invalid once it expires
  or the password changes.
- **The GitHub token never reaches the browser** and can only touch this one repository's contents.
- **Allowlist**: the server only reads and writes `src/content/work`, `src/content/timeline`, `src/content/pages/about.md`
  and `src/data/site.json`, plus uploads to `src/assets/work`, `src/assets/timeline`, `src/assets/headshot.jpg`,
  `public/artifacts` and the four `public/resumes/*.pdf` files. Anything else is refused.
- **Checks before saving**: the Details must be valid, required fields present, tracks from the allowed list, pictures
  must exist, text may not contain `<script>`/`<iframe>`. Uploads are checked by real file type, name and size.
  The contact-form address can't be changed from the page.
- **Requests must come from the site itself** (cookie is `SameSite=Strict`, plus an origin and header check).
- **Hidden from search engines** (`noindex`, `robots.txt`).
- If a save somehow breaks the build, Vercel keeps serving the last working version, and the commit can be reverted.

## Local testing

Copy `.env.example` to `.env`, set `EDIT_PASSWORD`, leave `GITHUB_TOKEN` empty, and run `npm run dev`. `/edit` then
edits your local files directly (shown as "Test mode"). In test mode the dev server reloads the page after each save.
