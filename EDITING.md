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

- The list on the left follows the page from top to bottom, the same order visitors see it:
  1 Top of the page ("Home page intro": the headline, your photo and the About me text), 2 My Journey, 3 Work History, 4 Resumes,
  5 Footer & contact form. Case studies and journey steps are listed in their `order`.
- Each item opens as **one continuous file**. The block between the two `---` lines at the top holds the details (dates,
  tags, pictures); everything below is the text. Press **Save**. The page checks the whole file first and
  says what to fix. A live preview of the text sits underneath, and a **Pictures in this file** strip shows every
  picture the file mentions (or "Not uploaded yet" for one that is missing). The editor opens on "Home page intro".
- The footer and contact form settings (name, email, footer links, contact-form reasons) are one short settings file
  of `name: value` lines.
- **+ New case study / + New step** makes a draft you can fill in. New case studies start with `draft: true`, which keeps
  them off the site until you remove that line (this is also how to hide one instead of deleting it).
- **Pictures go right where you are editing.** In a case study, a journey step or the Home page intro, the *Pictures in this
  file* panel has an **Add a picture** box: choose the picture, describe it in a few words, press *Upload and add*. It is
  shrunk, uploaded, and added to that file's picture list for you (on the Home page intro it replaces the headshot).
  Then press **Save**. Messages about pictures show right under them. Each picture has an **×** in its corner that takes
  it out of the section's list (with an **Undo**, and nothing is published until you press Save; the uploaded file itself
  stays in storage). The headshot can be replaced but not removed.
- **Anywhere → Upload pictures & files** is still there for everything else: files to link from a case study (PDF, Word,
  PowerPoint). Upload first, then paste the path it gives you (`url:` for an artifact). Pictures are shrunk automatically. Files can be up to 4 MB; bigger files must be added on github.com.
- Resumes: "Replace a resume PDF" → choose which one. The file name stays the same, so the cards just update.

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
