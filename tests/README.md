# Tests for warrenlongmire.com

End-to-end tests ([Playwright](https://playwright.dev)) that open the site and the `/edit` page in a real browser.
They live in their own folder with their own `package.json`, so the site and its Vercel build don't know they exist.

## Run them

```bash
cd tests
npm install              # first time only
npm run install-browsers # first time only (downloads a test browser, ~100 MB)
npm test                 # everything
npm run test:site        # public site (desktop and phone)
npm run test:editor      # the /edit page and its API
npm run report           # open the last HTML report
```

## Safe by design

`scripts/serve.mjs` makes a **throwaway copy** of the project in your temp folder and runs a dev server from it on port 4322.

- Editor tests save into the copy. Your real files are never changed (and `support/site.ts` resets the copy between tests).
- The copy has no `.env` and an empty `GITHUB_TOKEN`: nothing can be committed to GitHub.
- The copy uses its own test password, not your real `EDIT_PASSWORD`.
- Site tests block every outside address. The contact form's service (Formspree) is replaced by a stand-in, so no real email is sent.
- The copy is wiped and rebuilt at the start of every run.

## What is covered

| File | Checks |
| --- | --- |
| `specs/site/home.spec.ts` | headline and About, nav order and highlight, theme toggle, stars (not links, roll-over), My Journey stepper and slideshow, Work History cards, filters, popups, resumes, contact form (validation, send, cooldown, failure, spam field) |
| `specs/site/mobile.spec.ts` | no sideways scroll, nav, hidden stars, popup fits a phone |
| `specs/editor/api.spec.ts` | sign-in required, wrong password, other-site requests blocked, only content files editable, save and conflict, front-matter checks (media, tracks, script tags), uploads (type, size, fake pictures, resumes), preview limits, ordering, site details |
| `specs/editor/ui.spec.ts` | login, file order, save and error messages, draft restore, picture and video list (preview, drag, arrow keys, remove and undo, edit description, add video, add photo), left-list reorder, new case study |
| `specs/editor/zz-lockout.spec.ts` | five wrong passwords lock further tries |

Tests read counts (number of cards, steps) from your content, so adding a case study doesn't break them.
