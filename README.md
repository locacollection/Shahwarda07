# Somewhere in the Archive

The public archive is a static GitHub Pages site. Its private editor lives at /manage/ and uses Supabase Auth, Database, and Storage.

## Public site
- index.html and assets/css/styles.css define the public shell and visual style.
- content/sections/ contains the original static fallback sections.
- assets/js/archive-data.js defines the editable content model and safe public renderer.
- assets/js/site.js loads published content from Supabase, falling back to the static section files if the service is unavailable.

## Private editor
- Open https://locacollection.github.io/Shahwarda07/manage/.
- Sign in with the one authorized administrator account.
- Edit the hero, memory cards, timeline, notes, optional interaction, and closing text.
- Upload photos to the public archive-media bucket, then choose Save and publish.
- The public site reads the saved content directly from Supabase. No GitHub commit is needed for ordinary content edits.

## Security
- assets/js/supabase-config.js contains only the public Supabase URL and publishable key. These are designed for browser use.
- The Supabase database keeps the administrator UUID in a private schema. A database trigger only permits creation of the configured administrator email and registers that account.
- Row Level Security protects content updates and media uploads. The public site can read published content and public media, but cannot edit either.
- The editor has no sign-up form and is not linked from the public navigation. The database also rejects account creation for any other email.
- Do not upload private conversations, personal information, or photographs unless you have permission to publish them.

## First-time setup still required
1. In Supabase Authentication, invite the configured administrator email and accept the invitation to set a password.
2. In Project Settings > API / Data API, ensure public.archive_content is exposed to the Data API. Its SQL grants and Row Level Security policies are already configured.
3. Add https://locacollection.github.io and https://locacollection.github.io/Shahwarda07/manage/ to the Auth redirect URL allowlist if you use password recovery.
