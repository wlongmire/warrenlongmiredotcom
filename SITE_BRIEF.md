# Personal Site Brief: Warren Longmire (v1)

Drafted from a UX interview, Sept 29, 2026. Google Doc version: https://docs.google.com/document/d/1wIjnCyJoJsSLn_c7JrBnK7JPOIflcJAJGTn2_v_uAfo/edit

## 1. Goal
A portfolio-first hub that convinces L&D and instructional design hiring managers to look at real work samples, while also serving technical-teaching and engineering audiences. The writing/performance life gets its own lighter site at alongmirewriter.com, linked from the hub.

- Primary action: click into a case study
- Secondary: download the right resume, then get in touch

## 2. Audiences
| Audience | Priority | Needs to see fast |
|---|---|---|
| L&D / ID hiring managers | Primary | Case studies with process (analysis, design, build, outcome), tools, clean resume |
| Technical teaching / enterprise training | Secondary | Teaching range, p5 lessons, talks, stack |
| Software engineering | Secondary | GitHub, engineering history, tooling projects |
| Arts and literary | Routed away | One clear link to alongmirewriter.com |

## 3. Site map (v1)
- `/` Home: straight to the work (case study cards), short identity line, filters: All / Learning Design / Teaching / Engineering
- `/work/[slug]` one page per case study
- `/resume` track-specific PDFs (Instructional Design, Technical Teaching, Engineering)
- `/about` bio, headshot, testimonials, link to author site
- `/now` what I'm working on this month
- Contact: email link in header and footer (no form in v1)

## 4. Homepage
1. Header: name, nav (Work, Resume, About, Now), Contact button
2. One identity line with a noticeable poetic voice. Draft: "I design learning for people who build things, and I build the things that help them learn."
3. Filter chips
4. Case study grid: title, one-line outcome, role, tags
5. Small signature interactive touch that nods to creative coding (see Visuals)
6. Footer: email, LinkedIn, GitHub, "Also: poet and performer at alongmirewriter.com"

## 5. Case study template
Front matter: title, outcome, role, dates, org, audience, tools, tracks, cover, confidential.
Sections: Context / Approach / What I built / Outcome / Reflection.
Confidential work is described in words with recreated or excerpted samples.

## 6. Content inventory
| Item | Track | Status |
|---|---|---|
| Galvanize AI-integrated TypeScript/Next.js program | Learning Design | Check shareability; likely description + recreated sample |
| NVHA six-week haiku curriculum (51 students, 2 NJ schools) | Learning Design | Have materials; **v1 launch case study** |
| Bloom Canvas attendance & guided-projects system | Learning Design / Engineering | Description + diagram |
| Iowa Canvas courses (logical fallacy checker, TouchDesigner) | Learning Design / Teaching | Have materials |
| Stanley writing course | Learning Design | Need details |
| p5.js creative coding lessons (YouTube: mQcwNxBqM-M, Y4_PvIIT2D8) | Teaching | Ready |
| Talks and workshop recordings | Teaching | Gather links |
| GitHub repos (incl. py-canvas) | Engineering | Pick 2–3 |
| Headshot, bio, testimonials, resume PDFs | All | Ready |

## 7. Voice
Crafted and distinctive, poet noticeable. Plain, specific language in case studies; more lyricism in the homepage line, About, and section intros.

## 8. Visual direction (pick one; mock all three first)
- **A. Ink and signal:** off-white paper, near-black text, signal-orange accent; serif headlines (Fraunces) + sans body (Inter); slow generative line pattern in the header.
- **B. Night studio:** deep navy, warm cream text, brass/amber accent; dark-first with light toggle; cursor-reactive constellation of case-study dots.
- **C. Workshop grid:** white with faint notebook grid, teal accent, monospace labels (JetBrains Mono) + humanist sans body; cards flip to show design process.
All: WCAG AA, fast, reduced-motion safe.

## 9. Build and upkeep
- Astro + Vercel from GitHub; launch on a vercel.app URL, attach warrenlongmire.com (or .online) later
- Later: rebuild the root of alongmirewriter.com as a lighter author site; existing Vercel project subdomains keep working
- Warren edits Markdown directly; CLAUDE.md documents conventions

## 10. v1 scope (this week)
- [ ] Mock A/B/C homepages, pick one
- [ ] Homepage with identity line and case study grid
- [ ] One finished case study (NVHA)
- [ ] 2–3 more as short versions or "coming soon"
- [ ] /resume with PDFs
- [ ] /about with headshot, bio, 1–2 testimonials
- [ ] Deploy to Vercel

## 11. Open questions
- Stanley writing course: audience, dates, format?
- Which Galvanize and Bloom materials are safe to show?
- Which testimonials to feature?