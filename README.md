# Askbefore.AI website

Static marketing site (Dutch). No framework and no build step: everything Vercel needs to serve lives in `public/`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Any static file server pointed at `public/` works as well (`python3 -m http.server -d public 3000`).
Do not open `index.html` via `file://`: pages are loaded with `fetch()` and asset paths are root-relative.

## Structure

```
public/                     <- deploy root (Vercel outputDirectory)
├── index.html              entry point: head, #app mount, scripts
├── pages/                  one HTML fragment per route (the <main> content)
│   ├── over-ons.html       #/over-ons/wat-we-doen  (home)
│   ├── aanbod.html         #/aanbod
│   ├── contact.html        #/contact
│   ├── privacy.html        #/privacy   (placeholder text)
│   └── terms.html          #/terms     (placeholder text)
├── partials/               shared chrome: header, footer, legal bar
└── assets/
    ├── css/
    │   ├── fonts.css       @font-face for the Alaska family
    │   ├── vendor/swiper.css
    │   └── styles.css      all site styles (design tokens at the top)
    ├── js/
    │   ├── site.js         carousel, scroll-reveal, sticky header state
    │   └── router.js       hash router (#/route) -> loads pages + partials
    ├── fonts/              woff2 files
    └── images/             logos, photos, diagrams
vercel.json                 output dir, security + cache headers
package.json                dev server only (`serve`)
```

## How routing works

The site is a hash-routed SPA (`#/aanbod`, `#/contact`, ...), so Vercel needs no rewrites. Routes are
declared in `public/assets/js/router.js` (`ROUTES`). To add a page:

1. create `public/pages/<name>.html` containing the `<main>` content,
2. add an entry to `ROUTES` in `router.js`,
3. link to it with `href="#/<route>"`.

## Third-party

- [Swiper 14.3.0](https://swiperjs.com) JS is loaded from cdnjs (`index.html`); its CSS is vendored in `assets/css/vendor/swiper.css`.

## Deploy (Vercel)

`vercel.json` already sets `outputDirectory: "public"` with no build/install command, so importing the GitHub repo
in Vercel (framework preset: *Other*) works without further settings. Pushes to `main` deploy to production;
other branches get preview URLs.

## Notes

- Privacy Policy and Terms & Conditions are still placeholder text.
- The LinkedIn link in `partials/footer.html` currently points to `#`.
- Hash routing means each page shares one URL for crawlers. If SEO per page matters later, migrate to real paths
  (add rewrites in `vercel.json`) or a static-site generator.
