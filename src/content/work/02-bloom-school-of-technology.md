---
title: "Bloom School of Technology"
outcome: "Built the company-wide Canvas attendance and guided-projects system, and moved the Advanced React sprint challenge to automated grading in CodeGrade."
role: "Lead Instructor"
org: "Bloom School of Technology"
dates: "2020–2022"
tools: []
tracks: [learning-design, engineering]
order: 2
links:
  - label: "Advanced React sprint challenge (CodeGrade version)"
    url: "https://github.com/wlongmireBloomTech/web-sprint-challenge-advanced-react-solution"
  - label: "Original version, for comparison"
    url: "https://github.com/wlongmireBloomTech/sprint1-codegrade"
  - label: "CodeGrade–GitHub automation script"
    url: "https://github.com/wlongmireBloomTech/codegrade_github"
images:                      # one image = single view, several = gallery
  - src: "../../assets/work/02-bloom-school-of-technology.jpg"
    alt: "bloomtech logo"
    fit: cover             # or cover, to crop to a wide banner
# artifacts:                   # samples and files, e.g. url: "/artifacts/example.pdf" (put files in public/artifacts/)
#   - label: "TODO: name of the artifact"
#     url: ""
---

### Context

Bloom School of Technology (formerly Lambda School) ran fully remote full stack web development cohorts of up to 50 adult learners. Sprint challenges were graded by hand: learners forked a repo, added their team lead as a collaborator, and waited on a pull-request review. At that scale, feedback was slow and uneven.

### Approach

I redesigned the Advanced React sprint challenge around automated feedback, and integrated CodeGrade into Canvas through its plugin, which required setting up Canvas API access. Learners submit with a normal git push, baseline tests run instantly, and human reviewers add written feedback afterward. Interview-prep questions moved into the repo itself so learners practiced explaining their code, not just writing it. I treated adoption as part of the design, so documentation and instructor training shipped alongside the Canvas system.

### What I built

- A company-wide attendance and guided-projects system in Canvas, built on the Canvas API
- A CodeGrade integration in Canvas, set up through its plugin with Canvas API access, so automated scores flowed straight into the Canvas gradebook
- A rebuilt Advanced React sprint challenge with automated tests and CodeGrade submission on every push
- Automated GitHub-to-CodeGrade submission, linking learner repos through the CodeGrade and GitHub APIs
- Documentation and training so instructors could adopt all of it

### Outcome

The system rolled out immediately across three cohorts of 20 to 30 learners each, with sprint challenge scores landing in the Canvas gradebook automatically instead of being entered by hand. It outlasted my time at Bloom and, to my knowledge, is still in use.
