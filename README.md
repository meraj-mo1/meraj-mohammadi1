# Meraj Mohammadi — Personal Website

A premium, hand-built personal website for **Meraj Mohammadi** (Marketing & AI).
Single-page, fully static, zero dependencies, zero build step — designed to be
published on **GitHub Pages** exactly as-is.

## What's inside

```
.
├── index.html            ← the entire site (all content lives here)
├── .nojekyll             ← tells GitHub Pages to serve files as-is
└── assets
    ├── css/style.css     ← design system, theming, layout, motion
    ├── js/main.js        ← interactions (theme, reveals, modal, cursor light…)
    └── favicon.svg       ← gradient "M." mark
```

No frameworks. No npm. No external images — every visual (the sculptural hero,
gradient lighting, grain) is pure CSS. Fonts load from Google Fonts (Geist,
Geist Mono, Instrument Serif) with graceful system fallbacks.

## Publish on GitHub Pages

### Option A — through the GitHub web interface (easiest)

1. Create a new repository on GitHub (e.g. `meraj-website` or `username.github.io`).
2. Upload these files (the contents of this folder — `index.html` must sit at the
   repository root, not inside a subfolder).
   - Easiest path: on the repo page choose **Add file → Upload files** and drag
     everything in, or use GitHub Desktop / drag-and-drop.
3. Go to **Settings → Pages**.
4. Under *Build and deployment*, set **Source: Deploy from a branch**, choose
   `main` and `/ (root)`, then **Save**.
5. Wait 1–2 minutes. Your site is live at:
   - `https://<username>.github.io/<repo-name>/` — or
   - `https://<username>.github.io/` if you named the repo `username.github.io`.

### Option B — from the command line

```bash
cd meraj-website
git init
git add .
git commit -m "Personal website"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

Then enable Pages: **Settings → Pages → Deploy from a branch → main / root**.

### Custom domain (optional)

Add a `CNAME` file containing your domain (e.g. `meraj.dev`) and configure the
DNS records per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Editing content

| What | Where |
| --- | --- |
| Text, sections, links, stats | `index.html` |
| Colors, spacing, typography | `assets/css/style.css` (all tokens at the top in `:root[data-theme="…"]`) |
| Project modal details + preview colors | the `WORK` and `PREVIEW_BG` objects in `assets/js/main.js` |
| Rotating hero words | the `phrases` array in `assets/js/main.js` |

## Notes on behavior

- **Dark/light mode** — toggled from the header, remembered in `localStorage`,
  defaults to the visitor's system preference. Both themes are art-directed
  independently (not simple inversions).
- **Motion** — cursor light trail, click ripples and magnetic buttons run only
  on fine-pointer (mouse) devices, and everything respects
  `prefers-reduced-motion`.
- **Accessibility** — semantic landmarks, focus-visible styles, keyboard-navigable
  work modals (Esc / backdrop / focus trap), skip link, ARIA labels.
- **Performance** — one CSS file, one JS file, two IntersectionObservers, a
  single rAF loop, no images to download.

---

Crafted by hand. Set in Geist, Geist Mono & Instrument Serif.
