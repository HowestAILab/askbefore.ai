---
name: askbefore-website
description: Edit, preview, publish and roll back the askbefore.ai website (Astro site in src/, hosted on Vercel, code on GitHub HowestAILab/askbefore.ai). Use for any request to change site text, add or edit a page, update testimonials or contact details, swap images, fix styling, publish or deploy changes, check a deployment, set up a new machine to work on the site, or undo a bad release.
---

# askbefore.ai website: edit, push, deploy

Dutch marketing site, built with Astro (static output). `git push` to `main` is the deploy: Vercel builds
`npm run build` and serves `dist/` at **https://askbefore.ai**. Other branches and PRs get a preview URL.

- GitHub: `git@github.com:HowestAILab/askbefore.ai.git` (branch `main`)
- Vercel: team `askbeforeai`, project `askbefore-ai`
- Domain: `askbefore.ai` at GoDaddy (DNS is managed by hand there, never through this skill)

## 0. Start of every session

1. Make sure you are inside a clone of the repo. If not, `git clone git@github.com:HowestAILab/askbefore.ai.git`
   (or the `https://github.com/...` URL) and `cd` into it.
2. Run `npm run doctor`. It is read-only and prints each missing prerequisite with the exact command that fixes it
   (Node 22.12+, dependencies, git identity, GitHub write access, optional Vercel login). Fix every ✘ before editing.
3. `git pull --rebase origin main`. If there are conflicts, stop and tell the user; do not resolve blindly.

## 1. New colleague setup (one time)

What the person needs: a GitHub account **with write access to the HowestAILab repo** (ask a repo owner to add them),
Node 22.12+, git, and Claude Code. A Vercel login is only needed to look at deployments; publishing works through git.

```bash
git clone git@github.com:HowestAILab/askbefore.ai.git && cd askbefore.ai
npm install
gh auth login                  # or have an SSH key registered at https://github.com/settings/keys
git config user.email <the verified email of your GitHub account>   # Vercel attributes deploys by this email
npm run doctor
claude                         # this skill and CLAUDE.md load automatically in the repo
```

Optional, to inspect deployments:

```bash
npm install --global vercel && vercel login
vercel link --project askbefore-ai --scope askbeforeai     # creates a git-ignored .vercel/ folder
```

The repo's `.mcp.json` offers the Vercel MCP (approve it when Claude Code asks, then `/mcp` → `vercel` to sign in) and
the GitHub MCP (needs `export GITHUB_PERSONAL_ACCESS_TOKEN=...`). Both are optional; `git`, `gh` and `vercel` work too.

## 2. Where things live

| Want to change | File |
| --- | --- |
| Page text | `src/pages/` (`index` = Over ons, `aanbod`, `contact`, `privacy`, `terms`, `404`) |
| Email, booking link, LinkedIn, address, nav | `src/data/site.ts` |
| Testimonials (carousel, dots, arrows follow automatically) | `src/data/testimonials.ts` |
| Header, footer, buttons, hero, cards | `src/components/*.astro` |
| `<head>`, SEO, favicon links, page transitions | `src/layouts/Layout.astro` |
| Colours, spacing, type sizes (design tokens at the top) | `src/styles/global.css` |
| Webfonts (Alaska, `.woff2` + `.woff`) and their `@font-face` | `src/assets/fonts/alaska/` (read its README), `src/styles/fonts.css`; preloads in `src/layouts/Layout.astro` |
| Carousel / nav behaviour | `src/scripts/carousel.ts`, `src/scripts/site.ts` |
| Images (use `<Image>` from `astro:assets`) | `src/assets/images/` |
| Favicon, robots.txt (served as-is) | `public/` |
| Build output, security + cache headers | `vercel.json` |

Conventions:

- All visitor-facing text is **Dutch**. Match the tone of the surrounding copy.
- Colours: only the client palette tokens at the top of `src/styles/global.css`. Purple *text* uses `--purple-deep` (same value as `--purple`); contrast on cream is low, so keep it to large text.
- Every image needs meaningful `alt` text. Put new images in `src/assets/images/`; Astro makes responsive WebP.
- To add a page: create `src/pages/<name>.astro` wrapped in `Layout`, add it to `NAV` in `src/data/site.ts`.
- The "LinkedIn" footer column appears only when `linkedin` is set in `src/data/site.ts`.
- Known content TODOs: the Howest testimonial still holds Barco's quote; Privacy and Terms are placeholders.

## 3. Edit, check, publish

1. **Edit** `src/` files. Read the surrounding file first and match its style. Keep changes small and focused.
2. **Look at it.** `npm run dev` → http://localhost:4321. Check the changed page at desktop and phone width and the
   browser console for errors. If a browser tool is available, take screenshots at ~1440px and ~390px.
3. **Verify.** `npm run verify` (type check + production build). It must pass; fix errors rather than skipping.
4. **Commit.** Short imperative message, in English. Stage specific files (`git add src/pages/aanbod.astro`); never
   `git add -A` without looking at `git status`. Never commit `.env*`, `.vercel/`, `dist/`, tokens or other secrets.
5. **Publish.** Pushing to `main` goes live within about a minute, so **ask the user for a go-ahead first**.
   - Safe default for anything non-trivial: `git switch -c <topic>` → `git push -u origin <topic>`. Vercel builds a
     preview URL; the user reviews it; then merge into `main` (PR on GitHub, or
     `git switch main && git merge --ff-only <topic> && git push`).
   - Small, approved edits: `git push origin main`.
6. **Confirm the deploy** (below) and tell the user the URL and what changed.

## 4. Check a deployment

- Vercel CLI: `vercel ls --scope askbeforeai` (status Ready / Error), `vercel inspect <url>`, `vercel logs <url>`.
- Vercel MCP: list deployments for `askbefore-ai`, read build logs.
- Quick HTTP check: `curl -sI https://askbefore.ai | head -5`, then open the changed page.

Preview and per-deployment URLs (`*-askbeforeai.vercel.app`) are protected and answer 302 unless you are logged in to
Vercel; production `https://askbefore.ai` and `https://askbefore-ai.vercel.app` are public.

## 5. Roll back

Prefer a revert so GitHub and Vercel stay in sync:

```bash
git revert <bad-commit> && git push origin main
```

Emergency: `vercel rollback --scope askbeforeai` (or "Promote" an older deployment in the Vercel dashboard) restores the
previous production deployment immediately. Follow up with a revert so the repo matches what is live.

## 6. Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| `Permission denied (publickey)` on push | No SSH key on GitHub. Add one, or use HTTPS: `git remote set-url origin https://github.com/HowestAILab/askbefore.ai.git` and `gh auth login` |
| `remote: Permission to ... denied` / `403` | No write access to the repo. A HowestAILab owner must add the person |
| Push rejected (non-fast-forward) | Someone pushed first: `git pull --rebase origin main`, re-run `npm run verify`, push again |
| Push works but nothing deploys / deployment "Blocked" | Vercel only deploys commits whose author it can match to an allowed account. Check `git config user.email` is a verified email on the committer's GitHub account and that their Vercel account is connected to GitHub (https://vercel.com/account/settings/authentication). The Vercel team is on the **Hobby** plan, so if it stays blocked the team owner must add the person (may need a Pro plan) or merge/push the change from the owner's account |
| Vercel build fails | Run `npm run verify` locally (same build). Read the log with `vercel logs <url>`. Usual causes: a TypeScript/Astro error, a missing image import, invalid JSON in `vercel.json` |
| `askbefore.ai` shows a GoDaddy "parking" page | DNS/cache issue on the viewer's network, not the site. Check `https://askbefore-ai.vercel.app`; DNS records are in GoDaddy (A `@` → `216.198.79.1`, `64.29.17.1`; CNAME `www`) |
| Port 4321 busy | `npm run dev -- --port 4322` |

## 7. Don'ts

- Don't push to `main` without the user's go-ahead. Don't force-push or rewrite published history.
- Don't change DNS, domains, Vercel project settings or GitHub org settings from this skill.
- Don't add third-party CDNs, trackers or heavy dependencies; don't swap the framework without asking.
- Don't paste tokens or credentials into files, commits or chat. Never commit `.env*` or `.vercel/`.
- Don't invent factual content (clients, quotes, prices, legal text). Ask for the real text.
