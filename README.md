# Somewhere in the Archive

A single-file, static GitHub Pages experience. The site is intentionally built in one file: `index.html` contains its content, styling, and puzzle interactions.

## What is included
- A quiet archive-style entrance and memory fragments.
- A poetry section and an apology letter section with editable placeholders.
- A hidden-word puzzle that reveals the next page.
- An optional, secret-survey-style set of reflection questions.
- A closing page with a gentle invitation that makes clear no reply is owed.

## Editing the site
Open `index.html` on GitHub and choose the pencil icon to edit the words. Replace the bracketed prompts with your own writing. Keep a copy of your text before making large edits.

## Privacy
The public archive uses Supabase for a small set of clearly disclosed functions:
- A visitor counter records one anonymous browser ID per browser, not names, IP addresses, or location.
- Notes and survey answers are sent only when the visitor explicitly checks the consent box and submits the form.
- Submissions are private and can only be read through the authenticated archive manager.
- The visitor counter is approximate. It cannot identify a person and may be affected by cleared browser storage, multiple devices, or automated requests.

The private manager is available at `/manage/`. It uses a one-time email sign-in link for the administrator address configured in `assets/js/supabase-config.js`. Do not expose Supabase secret or service-role keys in this repository. The publishable key is intended for browser use, with database permissions enforced by RLS and server-side authorization.

## Publishing
GitHub Pages serves the repository's `index.html`. Changes committed to the Pages source branch are published by GitHub Pages.

The older modular assets and Supabase-related files may remain in the repository for now, but the new `index.html` does not load or depend on them.
