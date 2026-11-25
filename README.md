# Somewhere in the Archive

This website is intentionally modular. Edit most of it directly in GitHub without touching the code.

## Where to edit
- Homepage/title and navigation: `index.html`
- Visual style, fonts, spacing, colors: `assets/css/styles.css`
- Interaction behavior and section loader: `assets/js/site.js`
- Hero/intro: `content/sections/hero.html`
- Memory cards: `content/sections/fragments.html`
- Timeline: `content/sections/timeline.html`
- Quote and reflection: `content/sections/notes.html`
- Small interactive clue: `content/sections/clue.html`
- Closing note: `content/sections/closing.html`

## Editing a section
1. Open this repository on GitHub.
2. Open the file listed above.
3. Press the pencil icon (Edit).
4. Make your changes and click **Commit changes**.

Each section is separate. Editing one section doesn't require editing the others.

## Adding photographs
Upload images to `assets/images/`. In the relevant section file, replace the `media-slot` placeholder with an image element:
```html
<img class="archive-photo" src="assets/images/village.jpg" alt="A quiet village road">
```
Use descriptive alt text and avoid publishing private details or images without permission.

## Publishing
A commit automatically starts GitHub Pages deployment. It may take a few minutes for changes to appear online.