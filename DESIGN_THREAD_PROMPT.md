# Context prompt for the design thread

Paste everything below the line into the thread where you are designing your friend's site. It tells that thread what the
structure you want to build on can and can't do, so the design fits it. Fill in the `<<…>>` parts first.

---

I'm designing a portfolio site for a friend, **<<her name>>** (<<her field>>). I want to build it on a structure I already
have working: my own site, warrenlongmire.com. We are still in the **design stage**, so please don't write code yet. Use the
facts below so the designs we make can be built on this structure without reworking it.

## What the structure is

A one-page portfolio hub built with Astro (static pages, content in Markdown files, plain CSS, no CSS framework, no client-side
framework), deployed to Vercel from GitHub. Everything on the page comes from content files that a non-developer can edit
through a built-in password-protected web editor at `/edit`.

## The sections (in page order)

1. **Sticky header**: her name, a nav that highlights the section on screen, a light/dark theme toggle, and a Contact button.
2. **Hero**: a full-width area with a photo, one big tagline line, and an "About me" card with a short paragraph.
3. **Journey**: a section that fits one screen and shows **one moment at a time**. Each moment has a label, dates, a title, a
   short paragraph, small tag pills, and a slideshow of pictures and YouTube videos. Moments are stepped with buttons or pills.
4. **Work History**: a grid of **case study cards** (title, role line, one-line outcome, category tags, a "More info" button),
   with filter chips by category. "More info" opens a popup with a picture and video slideshow, a longer write-up, and optional
   file and link lists.
5. **Resumes**: one card per resume PDF (for example one per type of role), each a download, or "Coming soon" until the file exists.
6. **Footer**: name, email, social links.
7. **Contact popup**: name, email, a reason dropdown, a message; sends to the owner's email through a form service. It shows a
   confirmation and locks for a minute after sending.

## What is flexible (design freely)

- Look and feel: colors, fonts, spacing, mood, imagery, background treatments, and decorative touches. (Mine is a dark "night
  studio" theme with an amber accent and a faint constellation behind the hero. Hers can be completely different.)
- Hero layout and the tagline's voice.
- How each section looks: card style, grid shape, how the journey stepper and slideshows look.
- Section names and wording, and the set of **filter categories** on the case studies (mine are four; hers can be any list).
- Whether the resume section exists, and how many resumes there are.
- Light and dark themes.

## What is fixed or costly to change (design within it)

- The page is **one page** with these section types. New section types are possible but cost real work.
- Every section's content is **content files**, not text hard-coded in the design. Each case study or journey step has the same
  fields: title, role, organization, dates, a one-line outcome, categories, tools, a list of pictures and videos, optional files
  and links, and a write-up. Designs should work for **short and long** text and for **0, 1 or many** pictures and videos.
- Pictures are shown whole by default (not cropped); a case can choose to fill the frame instead.
- Videos are **YouTube links** only, shown as a thumbnail first.
- Order of cards and journey steps is set by drag and drop in the editor, so designs shouldn't depend on a particular item
  being first.
- Everything must meet **accessibility** standards (AA contrast, keyboard use, reduced motion, readable on a phone).
- The editor `/edit` is a separate, plain utility page. It is not part of the visual design, though it follows the site's dark theme.

## What I need from this thread

Work through the design decisions below with me, then give me a **design brief** I can paste into a build thread:

1. Her goal, audience and the one thing a visitor should do.
2. Look and feel: mood words, palette (with AA-contrast text colors), fonts, light and dark behavior.
3. A hero concept: layout, tagline voice, photo treatment.
4. How the journey and case study sections look, and what the tags and filter categories are.
5. Which sections to keep, drop or rename.
6. A small set of reference images or sketches or mockups I can hand to the builder.

When we finish, write the brief as: a short summary, the decisions above, the palette and fonts as exact values, the section list in
order, the list of filter categories, and any open questions.
