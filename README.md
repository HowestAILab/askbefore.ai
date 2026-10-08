# Askbefore.AI website

Marketing site (Dutch) built with [Astro](https://astro.build): real pages, shared components and optimised
images, compiled to plain static files. Hosted on Vercel; pushing to `main` deploys to production.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321 (hot reload)
npm run build      # static site -> dist/
npm run preview    # serve the production build locally
npm run check      # type/template check
```

Requires Node 22.12 or newer.

## Structure

```
src/
├── pages/                 one file per URL: index (Over ons), aanbod, contact, privacy, terms, 404
├── layouts/Layout.astro   <head> (SEO, favicon, fonts), header/footer, page transitions
├── components/            Header, Footer, Hero, CtaBar/CtaRow/CtaBlock, BtnPill, TrajectCard, TestimonialCarousel
├── data/
│   ├── site.ts            email, booking link, LinkedIn, address, nav items  <- edit contact details here
│   └── testimonials.ts    testimonials shown in the carousel                 <- edit/add testimonials here
├── scripts/               carousel.ts (Swiper), site.ts (active nav, header state)
├── styles/                global.css (design tokens at the top), fonts.css
└── assets/images/         photos and logos (optimised at build time by Astro)
public/                    served as-is: fonts/, favicon.svg, favicon-32.png, apple-touch-icon.png, robots.txt
vercel.json                build/output settings, security + cache headers
```

## Common changes

- **Copy:** edit the page in `src/pages/`. Shared bits (footer, CTAs) live in `src/components/`.
- **Testimonials:** add an entry to `src/data/testimonials.ts`; the carousel, dots and arrows update themselves.
- **Contact details / booking link / LinkedIn:** `src/data/site.ts`. The footer's LinkedIn column only appears
  once `linkedin` is set.
- **New page:** add `src/pages/<name>.astro` (wrap it in `Layout`), add it to `NAV` in `src/data/site.ts`.
- **Images:** drop the file in `src/assets/images/` and use `<Image src={...} alt="..." />`; Astro creates
  responsive WebP variants and sets width/height so nothing jumps while loading.
- **Colours / spacing:** CSS variables at the top of `src/styles/global.css`. Use `--purple-ink` / `--purple-strong`
  for purple *text* (the bright `--purple` is for backgrounds only; it fails contrast on light surfaces).

## Behaviour notes

- Navigation uses Astro view transitions (soft fade, header stays put). Scripts re-run on `astro:page-load`.
- Scroll reveal is pure CSS (`animation-timeline: view()`), so nothing flashes on load; browsers without support just
  show everything.
- Old links such as `/#/aanbod` are redirected to the new paths by a tiny script in `Layout.astro`.
- Privacy Policy and Terms are still placeholder text (and set to `noindex`).

## Deploy (Vercel)

The Vercel project `askbefore-ai` (team `askbeforeai`) is connected to this repo. Pushes to `main` deploy to production
at https://askbefore.ai, other branches and PRs get preview URLs. `vercel.json` sets the Astro framework, `npm run build`
and `dist/` as output. Domain DNS (GoDaddy) points at Vercel: `A @ 216.198.79.1 / 64.29.17.1`, `CNAME www`.

## Third-party

- [Swiper](https://swiperjs.com) (testimonial carousel), bundled from npm; no external CDN at runtime.
