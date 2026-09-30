# warrenlongmire.com — project guide for Claude

## What this is
Warren C. Longmire's professional portfolio hub. Portfolio-first for **L&D / instructional design hiring managers**; also serves technical-teaching and software-engineering audiences. The author/performer site lives separately at alongmirewriter.com and is only linked from here.

Full requirements: see `SITE_BRIEF.md`. Treat it as the source of truth.

## Stack
- Astro (static output), content collections in Markdown
- Deployed to Vercel from GitHub (main branch = production)
- No CMS, no database, no client-side framework unless a component truly needs it
- Plain CSS (custom properties for the palette); no Tailwind unless Warren asks

## Content model (Warren edits these by hand)
- `src/content/work/*.md` — one file per case study
- `src/content/pages/about.md`, `now.md`
- `public/resumes/*.pdf` — track-specific resumes

Case study front matter:
```yaml
title: ""
outcome: ""          # one line, shown on the card
role: ""
org: ""
dates: ""
audience: ""
tools: []
tracks: []           # any of: learning-design, teaching, engineering, design-ux
cover: ""            # optional image path
confidential: false  # true = described/recreated, not original artifacts
draft: false
```
Body sections, in order: Context, Approach, What I built, Outcome, Reflection.

## Rules
- Keep content editable by a non-developer: never hard-code case study text in components.
- Never invent facts about Warren's work. If a detail is missing, leave a `TODO:` in the Markdown and ask.
- Accessibility: WCAG AA contrast, semantic HTML, keyboard navigable, respects `prefers-reduced-motion` (the generative/interactive signature touch must pause or be static under reduced motion).
- Performance: static pages, no layout shift, images optimized with Astro's image tools.
- Voice: plain and specific in case studies; a noticeably poetic line on the homepage and About page. Clarity for a 30-second skim wins every tie.
- Explain what you changed in plain language after each task.
