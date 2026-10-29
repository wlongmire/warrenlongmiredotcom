# Handoff prompt: build a portfolio site for a friend, using warrenlongmire.com as the pattern

Paste everything below the line into a new Claude Code session, opened in an empty folder for the new project.
Before you do, change the two paths marked `<<…>>` (or delete the reference line if you would rather start from scratch).

---

I want to build a professional portfolio site for a friend, using the same approach as my own site, which already exists and works.

## Reference project

My site is at `<<~/Desktop/Dev/warrenlongmire-site>>` (live at warrenlongmire.com, GitHub `wlongmire/warrenlongmiredotcom`). Read its `CLAUDE.md`, `SITE_BRIEF.md`, `EDITING.md` and `tests/README.md` first, then look at `src/` and `tests/`. Treat it as read-only: copy ideas and code from it into this new folder, never change it.

## What the site is

A one-page portfolio hub for **<<her name>>**, a **<<her field>>**, aimed at **<<her audience, e.g. hiring managers, clients>>**. The pattern from my site:

- **Astro** (static output), content in Markdown collections, plain CSS with custom properties for the palette, no CSS framework, no client-side framework. Deployed to **Vercel** from **GitHub** (`main` = production).
- Page order: sticky header with a scroll-spy nav, a full-width hero (photo, a one-line tagline, an About card), a one-screen **journey** stepper (one moment at a time, with a picture and YouTube video slideshow), a **Work History** grid of case study cards with filters and a "More info" popup (also a picture and video slideshow), a **Resumes** section (PDFs, "Coming soon" until a file exists), a footer, and a contact popup that posts to a form service (Formspree).
- **`/edit`**: a password-protected, content-only web editor so she can change text and pictures without a developer. It edits one continuous Markdown file per item, has a drag-and-drop list for ordering, a picture and video panel (add, preview, reorder, remove), uploads, and saves to GitHub (each save is a commit and redeploys) or to local files in dev when no `GITHUB_TOKEN` is set. Only a whitelist of content files can be edited, and every save is checked first.
- A separate **Playwright test suite** in `tests/` with its own `package.json`. It runs the site from a throwaway copy, so it never touches real files, secrets, GitHub or the real contact form.

## How to work

1. **Plan first, then build.** Start by asking me the questions below, then propose a short plan and wait for my yes. Build in small steps and run the site after each.
2. **Ask before adding any dependency** beyond what the reference uses (`astro`, `@astrojs/vercel`, `js-yaml`; and `@playwright/test` only inside `tests/`).
3. **Never invent facts about her work.** If something is missing, leave a `TODO:` in the Markdown and ask me. Placeholder text must be obviously a placeholder.
4. **Keep content editable by a non-developer.** No case study text hard-coded in components.
5. **Accessibility:** WCAG AA contrast, semantic HTML, keyboard navigable, respects `prefers-reduced-motion`.
6. **Performance:** static pages, no layout shift, images through Astro's image tools.
7. **Explain what you changed in plain language** after each task. I am not a developer.
8. Don't commit or push until I say so.

## Questions to ask me first

- Her name, the one-line tagline, who the site is for, and what she wants visitors to do.
- Her sections: keep the same ones (hero and About, journey, work history, resumes, contact) or change them? What are her **filter tracks** (mine are learning design, teaching, engineering, design and UX), and does she have resumes by track or just one?
- Colors, fonts and mood. Mine is a dark "night studio" theme with an amber accent and a faint constellation; ask whether she wants that, a different look, or a few mockups to choose from.
- Her photo, any logos, and where her case study and journey content will come from (she writes it, or pastes it to me).
- Her domain, her GitHub account and repo name, and her email.
- Where contact messages should go. We will use a Formspree (or similar) form with **her** email. I'll create the account; you only need the form address.
- Who edits the site later, and what they should be able to change.

## What to carry over from my site, and what must be replaced

Reuse the structure and code of: the content collections and schemas (`src/content.config.ts`), the order file and helper (`src/data/order.json`, `src/lib/order.ts`), media resolving by file name (`src/lib/media.ts`), the journey and case popup components (`src/components/Timeline.astro`, `CaseDialog.astro`), the contact dialog, the filter script, the whole editor (`src/pages/edit/`, `src/pages/api/edit/`, `src/lib/editor/`), `EDITING.md`, and the `tests/` folder.

Replace **everything that is mine**. Search the reference for all of these and do not copy them over:

- My name, email, tagline and About text; the headshot; every case study (`src/content/work/*`), journey step (`src/content/timeline/*`) and picture in `src/assets/`; the resume PDFs and `src/data/resumes.ts`.
- `src/data/site.json`, including the **Formspree address** (`contactEndpoint`) and my links and contact reasons. Mine must never end up on her site.
- Anything hard-coded: `astro.config.mjs` `site` URL, the default `GITHUB_REPO` in `src/lib/editor/config.ts`, the `mailto:` in the header of `src/pages/index.astro`, the filter list in `src/data/home.ts`, page titles and meta tags, `public/robots.txt` and the favicon.
- `.env` and any secrets. Create a fresh `.env.example`; never copy `.env`.
- Update `CLAUDE.md`, `SITE_BRIEF.md` and `EDITING.md` so they describe her site, not mine.

## Setup steps for the editor (walk me through these when you get there)

1. `EDIT_PASSWORD`: a long passphrase for her, set in Vercel and in a local `.env`.
2. `GITHUB_TOKEN`: a fine-grained token limited to **her** repository, with Contents read and write only. Set in Vercel. Leave it empty locally so editing goes to local files.
3. Optional `GITHUB_REPO` and `GITHUB_BRANCH`.
4. In Formspree, allow only her domain.
5. Sign in at `/edit`, make a change, and confirm it redeploys.

## Things I learned the hard way (avoid repeating them)

- Astro's dev server caches content in `.astro/`. After changing a collection schema or how content is read, stop the dev server, delete `.astro/data-store.json` and `.astro/content-assets.mjs`, and start it again. Never delete those while the server is running.
- Phone photos can carry a rotation flag; bake them upright (with `sharp`) before using them. A PNG renamed `.jpg` will not render.
- `astro dev` in this version can run in the background when not in a terminal. `astro dev stop` stops **whichever** dev server is running for that folder, so don't run it casually.
- Dev-server reloads when a new file appears in `src/assets/`. The editor keeps unsaved edits in the browser tab so a reload doesn't lose them.
- Pictures in `media:` lists are written as a plain file name (for example `my-picture.jpg`) and looked up in `src/assets/work/` or `src/assets/timeline/`. Videos are YouTube links shown as a thumbnail first, then played muted on arrival.
- Case study and journey order lives in `src/data/order.json` (set by drag and drop in `/edit`), not in the Markdown files.
- Any new content field must also get a check in `src/lib/editor/rules.ts`, or the editor will let bad values through.

## Testing and finishing

- Keep `tests/` (Playwright), update it to match her content and sections, and keep the throwaway-copy safety design. Run the whole suite before we call anything done.
- At the end give me: a one-page "how she edits her site" guide, a launch checklist (domain, DNS, Vercel env vars, Formspree, robots and meta tags, social preview image, accessibility check), and the list of any `TODO:` items still open.

Start by reading the reference project, then ask me the questions above.
