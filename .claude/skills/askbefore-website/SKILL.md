---
name: askbefore-website
description: Edit, preview, push and deploy the askbefore.ai website (static Dutch site in public/, hosted on Vercel, code on GitHub HowestAILab/askbefore.ai). Use when asked to change site content, add/edit a page, swap images, fix styling, publish changes, check a deployment, or roll back askbefore.ai.
---

# askbefore.ai website: edit, push, deploy

Static marketing site (Dutch). No framework, no build step. Vercel serves `public/`
(`vercel.json` sets `outputDirectory: "public"`). Code lives on GitHub
(`git@github.com:HowestAILab/askbefore.ai.git`, branch `main`). The Vercel project is connected to that repo:

- push to `main` → **production** deploy (live on https://askbefore.ai)
- push to any other branch / open a PR → **preview** deploy with its own URL

So "deploying" is just `git push`. You never need to run `vercel deploy` for normal work.

## Site layout (what to edit)

| Want to change | File |
| --- | --- |
| Page content | `public/pages/<name>.html` (the `<main>` fragment only) |
| Header / footer / legal bar | `public/partials/*.html` |
| Styles (design tokens at top) | `public/assets/css/styles.css` |
| Carousel, scroll-reveal, sticky header | `public/assets/js/site.js` |
| Routes | `ROUTES` in `public/assets/js/router.js` |
| Images / fonts | `public/assets/images/`, `public/assets/fonts/` |
| Headers, caching, output dir | `vercel.json` |

Routing is hash-based (`#/aanbod`, `#/contact`). To add a page: create `public/pages/<name>.html`,
add it to `ROUTES` in `router.js`, link with `href="#/<route>"`. No rewrites needed.

Site copy is Dutch: keep new text in Dutch and match the tone of the existing pages.
Images are root-relative (`/assets/images/...`). Prefer descriptive file names and compress large photos before adding them.

## Workflow

1. **Sync first.** `git pull --rebase origin main`. Stop and tell the user if there are conflicts.
2. **Edit** files in `public/` (read the surrounding file first and match its style).
3. **Preview locally.** `npm install` once, then `npm run dev` → http://localhost:3000
   (or `python3 -m http.server -d public 3000`). Never open the HTML via `file://`: pages load with `fetch()`.
   Check the changed page, the browser console, and that no asset 404s.
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
the most common causes are invalid JSON in `vercel.json` and files outside `public/`.

## Roll back

Prefer a git revert so GitHub and Vercel stay consistent:

```bash
git revert <bad-commit>
git push origin main
```

For an emergency, `vercel rollback` (or "Promote" an older deployment in the Vercel dashboard) restores the previous
production deployment instantly. Follow up with a revert so the repo matches what is live.

## First-time setup for a new contributor

1. `git clone git@github.com:HowestAILab/askbefore.ai.git && cd askbefore.ai && npm install`
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
- Don't add a build step, framework or `package.json` dependencies without asking; the "no build" setup is deliberate.
- Don't paste secrets into files, commit messages or chat.
