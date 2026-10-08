---
name: askbefore-website
description: Edit, preview, push and deploy the askbefore.ai website (Astro-based static Dutch site in src/, hosted on Vercel, code on GitHub HowestAILab/askbefore.ai). Use when asked to change site content, add/edit a page, swap images, fix styling, publish changes, check a deployment, or roll back askbefore.ai.
---

# askbefore.ai website: edit, push, deploy

Marketing site (Dutch) built with Astro (static output, components, optimised images). Vercel runs
`npm run build` and serves `dist/` (see `vercel.json`). Code lives on GitHub
(`git@github.com:HowestAILab/askbefore.ai.git`, branch `main`). The Vercel project (`askbefore-ai`, team `askbeforeai`)
is connected to that repo:

- push to `main` → **production** deploy (live on https://askbefore.ai)
- push to any other branch / open a PR → **preview** deploy with its own URL

So "deploying" is just `git push`. You never need to run `vercel deploy` for normal work.

## Site layout (what to edit)

| Want to change | File |
| --- | --- |
| Page content | `src/pages/<name>.astro` (index = Over ons, aanbod, contact, privacy, terms) |
| Email, booking link, LinkedIn, address, nav items | `src/data/site.ts` |
| Testimonials (carousel) | `src/data/testimonials.ts` |
| Header / footer / CTA buttons / hero / cards | `src/components/*.astro` |
| <head>, SEO, favicon links, page transitions | `src/layouts/Layout.astro` |
| Styles (design tokens at top) | `src/styles/global.css` |
| Carousel and nav behaviour | `src/scripts/carousel.ts`, `src/scripts/site.ts` |
| Images | `src/assets/images/` (use `<Image>` from `astro:assets`) |
| Fonts, favicon, robots.txt | `public/` |
| Build output, headers, caching | `vercel.json` |

To add a page: create `src/pages/<name>.astro` wrapped in `Layout`, then add it to `NAV` in `src/data/site.ts`.
Site copy is Dutch: keep new text in Dutch and match the tone of the existing pages. Use `--purple-ink` or
`--purple-strong` for purple text (the bright `--purple` fails contrast on light backgrounds). Always give images
meaningful `alt` text.

## Workflow

1. **Sync first.** `git pull --rebase origin main`. Stop and tell the user if there are conflicts.
2. **Edit** files in `src/` (read the surrounding file first and match its style).
3. **Check locally.** `npm install` once, then `npm run dev` → http://localhost:4321. Before pushing run
   `npm run check && npm run build`; both must pass. Look at the changed page on desktop and phone width, and check the
   browser console for errors.
4. **Commit** with a short imperative message. Stage specific files, not `git add -A` blindly; never commit `.env*`,
   `.vercel/`, `node_modules/`, tokens or other secrets.
5. **Publish.**
   - Ask the user before pushing to `main`: it goes live immediately.
   - For anything risky or that the user wants reviewed first, push a branch (`git push -u origin <branch>`);
     Vercel posts a preview URL. Merge to `main` when approved.
   - `git push origin main` for approved changes.
6. **Verify the deploy** (see below) and report the result and URL to the user.

## Check a deployment

Any of these (prefer what is available):

- Vercel MCP (`/mcp` → `vercel`): list deployments / get deployment status and build logs for the `askbefore-ai` project.
- Vercel CLI: `vercel ls` (recent deployments), `vercel inspect <url>`, `vercel logs <url>`.
- Plain HTTP: `curl -sI https://askbefore.ai | head -5` and open the changed page.

A deploy of this static site normally takes under a minute. If it fails, read the build log before retrying;
the most common causes are a failing `npm run build` (reproduce it locally) and invalid JSON in `vercel.json`.

## Roll back

Prefer a git revert so GitHub and Vercel stay consistent:

```bash
git revert <bad-commit>
git push origin main
```

For an emergency, `vercel rollback` (or "Promote" an older deployment in the Vercel dashboard) restores the previous
production deployment instantly. Follow up with a revert so the repo matches what is live.

## First-time setup for a new contributor

1. `git clone git@github.com:HowestAILab/askbefore.ai.git && cd askbefore.ai && npm install` (Node 22.12+)
2. You need push access to the `HowestAILab` GitHub org. Check with `ssh -T git@github.com`.
3. Optional, only for inspecting deployments: `npm i -g vercel`, `vercel login`, `vercel link`
   (choose team `askbeforeai` and the existing `askbefore-ai` project; this creates a git-ignored `.vercel/` folder), and
   `claude mcp add --transport http vercel https://mcp.vercel.com` then `/mcp` → `vercel`.

## Domain

`askbefore.ai` is registered at GoDaddy and points to Vercel via DNS (A `@` → `216.198.79.1` and `64.29.17.1`,
CNAME `www` → `77e428be04ca90db.vercel-dns-017.com`; always prefer the exact values shown in the Vercel project's Domains settings or by `vercel domains verify askbefore.ai`).
Changing DNS is done manually in GoDaddy, not through this skill.

## Don'ts

- Don't push to `main` without the user's go-ahead.
- Don't force-push, and don't rewrite published history.
- Don't swap the framework or add heavy dependencies without asking.
- Don't point the site at third-party CDNs; assets are bundled so pages load without extra requests.
- Don't paste secrets into files, commit messages or chat.
