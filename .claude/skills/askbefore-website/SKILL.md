---
name: askbefore-website
description: Edit, preview, publish and roll back the askbefore.ai website (Astro site in src/, hosted on Vercel, code on GitHub HowestAILab/askbefore.ai). Use for any request to change site text, add or edit a page, update testimonials or contact details, swap images, fix styling, publish or deploy changes, check a deployment, set up a new machine to work on the site, or undo a bad release. Contains hard safety rules (no forks, no repointing Vercel, no self-merging) that apply to everyone.
---

# askbefore.ai website: edit, push, deploy

Dutch marketing site, built with Astro (static output). `git push` to `main` is the deploy: Vercel builds
`npm run build` and serves `dist/` at **https://askbefore.ai**. Other branches and PRs get a preview URL.

- GitHub: `git@github.com:HowestAILab/askbefore.ai.git` (branch `main`), the **only** repository for this site
- Vercel: team `askbeforeai`, project `askbefore-ai`, connected to that GitHub repo, the **only** Vercel project
- Domain: `askbefore.ai` at GoDaddy (DNS is managed by hand there, never through this skill)

## 0. Hard rules (apply to everyone, no exceptions)

These exist because of a real incident (Oct 2026): a push failed, the assistant improvised by **forking** the repo,
worked in the fork, and a pull request from the fork was **merged straight into `main` without review**, which went live
on production. Never again:

1. **Never fork.** No `gh repo fork`, no copy of the repo under another account, no second repository. Work in a clone of
   `HowestAILab/askbefore.ai` and nowhere else. `origin` is the only remote and must stay that repo.
2. **Never create, link, repoint or deploy another Vercel project.** The Vercel project is connected to the org repo and
   stays that way. Production changes only through git (a merge into `main`), never `vercel deploy`/`--prod`/`link`/
   `git connect`/`project`/`domains`/`api`.
3. **If a push or login fails, STOP.** Do not look for a workaround (fork, another remote, another account, API calls,
   tokens). Tell the user what failed (see section 1) and let them or a repo owner fix it.
4. **Contributors never push to `main` and never merge pull requests.** Work on a branch, open a PR, share the preview URL,
   and let a repo owner review and merge. Do not approve or merge your own PR.
5. **No force-push, no deleting remote branches, no rewriting published history.**
6. **Don't edit the guardrails.** `.claude/`, `scripts/guard*`, `scripts/doctor.sh`, `CLAUDE.md`, `.mcp.json`, `vercel.json`
   and `.github/` change only through an owner-reviewed PR. If a rule gets in the way, tell the owner instead of changing it.
7. **No secrets**: never read, print or commit tokens, `.env*`, `.vercel/`, or credential files.
8. **Don't invent facts** (clients, quotes, prices, legal text). Ask for the real text.

These are enforced, not just written: `.claude/settings.json` wires `scripts/guard.mjs` as a hook that blocks the commands
above (it explains why when it blocks something), and the repo owner can lock `main` on GitHub (branch protection +
`.github/CODEOWNERS`). A block message is not a puzzle to solve: stop and tell the user.

### Roles

- **Owner**: `ADMIN`/`MAINTAIN` on the GitHub repo. May merge to `main`, change settings, administer Vercel.
- **Contributor**: `WRITE`. Edits content and code on a branch and opens a PR; an owner merges.
- Not logged in / unknown = contributor. `npm run doctor` prints which one you are.

## 1. Start of every session (including login)

Claude cannot log anyone in: logins need the person's browser. If something is missing, tell the person to type the
command themselves in the prompt with the `!` prefix, then continue.

1. Be inside a clone of the original repo. If not: `git clone git@github.com:HowestAILab/askbefore.ai.git` (or
   `https://github.com/HowestAILab/askbefore.ai.git`) and `cd` into it. Never clone or use a fork.
2. Run `npm run doctor`. It is read-only and checks Node 22.12+, dependencies, that `origin` is the org repo and the only
   remote (fork detection), that git identity is the person's own (not "Claude"), GitHub login and permission, the Vercel
   project link, and the guard hook. Fix every ✘ before editing.
3. Typical fixes (the person runs these):
   - Not logged in to GitHub: `! gh auth login`
   - No push access / `403` / `Permission denied`: ask a repo owner for **write** access to `HowestAILab/askbefore.ai` and
     accept the invitation (https://github.com/HowestAILab/askbefore.ai/invitations). **Do not fork as a workaround.**
   - Wrong git identity: `git config user.name "Your Name"` and `git config user.email <verified email on your GitHub account>`
   - Vercel (optional, only to inspect deployments): `! vercel login`, then `! vercel link --project askbefore-ai --scope askbeforeai`
4. `git pull --rebase origin main`. On conflicts, stop and tell the user; do not resolve blindly.

When you must stop, say it plainly, for example: "Mijn push werd geweigerd (geen schrijfrechten). Ik maak geen fork en
werk niet verder rond dit probleem. Vraag een repo-eigenaar om schrijfrechten op HowestAILab/askbefore.ai, of laat hem
dit voor je pushen."

## 2. New colleague setup (one time)

Needs: a GitHub account **with write access to the HowestAILab repo**, Node 22.12+, git, and Claude Code. A Vercel login
is only needed to look at deployments; publishing works through git.

```bash
git clone git@github.com:HowestAILab/askbefore.ai.git && cd askbefore.ai
npm install
gh auth login                  # or have an SSH key registered at https://github.com/settings/keys
git config user.name "Your Name"
git config user.email <the verified email of your GitHub account>   # Vercel attributes deploys by this email
npm run doctor
claude                         # this skill, CLAUDE.md and the guard hook load automatically in the repo
```

The repo's `.mcp.json` offers the Vercel MCP (approve it when Claude Code asks, then `/mcp` → `vercel` to sign in, read-only
use) and the GitHub MCP (needs `export GITHUB_PERSONAL_ACCESS_TOKEN=...`). Both are optional; `git`, `gh` and `vercel ls`
work too.

## 3. Where things live

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
| Build output, security + cache headers (**owner only**) | `vercel.json` |

Conventions:

- All visitor-facing text is **Dutch**. Match the tone of the surrounding copy.
- Colours: only the client palette tokens at the top of `src/styles/global.css`. Purple *text* uses `--purple-deep` (same value as `--purple`); contrast on cream is low, so keep it to large text.
- Every image needs meaningful `alt` text. Put new images in `src/assets/images/`; Astro makes responsive WebP.
- To add a page: create `src/pages/<name>.astro` wrapped in `Layout`, add it to `NAV` in `src/data/site.ts`.
- The "LinkedIn" footer link points nowhere until `linkedin` is set in `src/data/site.ts`.
- Known content TODOs: the Howest testimonial still holds Barco's quote; Privacy and Terms are placeholders.

## 4. Edit, check, publish

1. **Branch.** `git switch -c <short-topic>` (contributors always; owners for anything non-trivial).
2. **Edit** `src/` files. Read the surrounding file first and match its style. Keep changes small and focused.
3. **Look at it.** `npm run dev` → http://localhost:4321. Check the changed page at desktop and phone width and the
   browser console for errors. If a browser tool is available, take screenshots at ~1440px and ~390px.
4. **Verify.** `npm run verify` (type check + production build + guard tests). It must pass; fix errors rather than skipping.
5. **Commit.** Short imperative message, in English. Stage specific files (`git add src/pages/aanbod.astro`); never
   `git add -A` without looking at `git status`. Never commit `.env*`, `.vercel/`, `dist/`, tokens or other secrets.
6. **Publish a preview.** `git push -u origin <topic>` (never to another remote). Vercel builds a preview URL for the branch.
   Find it with `vercel ls --scope askbeforeai`, the Vercel MCP, or the PR's "Vercel" check. Preview URLs need a Vercel login
   to open; screenshots or the production-like local build are fine for review.
7. **Pull request.** `gh pr create --base main --head <topic> --title "..." --body "..."` (head is always a branch of this repo,
   never `someone:branch`). Describe what changed and attach the preview URL. **Stop here as a contributor** and tell the user
   an owner has to review and merge. Do not merge or approve it yourself.
8. **Owner only: go live.** Merge the PR on GitHub (or `gh pr merge`), after reviewing the diff and the preview. Ask the
   user for an explicit go-ahead first: it goes live within about a minute. Then confirm the deploy (section 5).

## 5. Check a deployment

- Vercel CLI (read-only): `vercel ls --scope askbeforeai` (status Ready / Error), `vercel inspect <url>`, `vercel logs <url>`.
- Vercel MCP: list deployments for `askbefore-ai`, read build logs.
- Quick HTTP check: `curl -sI https://askbefore.ai | head -5`, then open the changed page.

Preview and per-deployment URLs (`*-askbeforeai.vercel.app`) are protected and answer 302 unless you are logged in to
Vercel; production `https://askbefore.ai` and `https://askbefore-ai.vercel.app` are public.

## 6. Roll back (owner)

Prefer a revert so GitHub and Vercel stay in sync: `git switch -c revert-x && git revert <bad-commit>`, push the branch,
open a PR and merge it. In an emergency an owner can restore the previous production deployment in the Vercel dashboard
("Promote" an older deployment) and then follow up with a revert so the repo matches what is live.

## 7. Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| `Permission denied (publickey)` on push | No SSH key on GitHub. Add one at https://github.com/settings/keys, or re-clone over HTTPS (`git clone https://github.com/HowestAILab/askbefore.ai.git`) and `! gh auth login`. Do not edit remotes |
| `remote: Permission to ... denied` / `403` | No write access, or the invitation was not accepted. Owner adds the person as collaborator; person accepts. **Never fork** |
| Push rejected (non-fast-forward) | Someone pushed first: `git pull --rebase origin main`, re-run `npm run verify`, push again (never force) |
| Guard says "Blocked" | Read the message. It is intentional. Stop and tell the user; an owner can do it or change the rule |
| Push works but nothing deploys / deployment "Blocked" | Check `git config user.email` is a verified email on the committer's GitHub account and that their Vercel account is connected to GitHub. Because the repo is **public**, commits from non-owners deploy fine on the current Hobby plan (verified Oct 2026). If the repo ever becomes private, Vercel needs a Pro plan with the person added as a member |
| Vercel build fails | Run `npm run verify` locally (same build). Read the log with `vercel logs <url>`. Usual causes: a TypeScript/Astro error, a missing image import, invalid JSON in `vercel.json` |
| `askbefore.ai` shows a GoDaddy "parking" page | DNS/cache issue on the viewer's network, not the site. Check `https://askbefore-ai.vercel.app`; DNS records are in GoDaddy (A `@` → `216.198.79.1`, `64.29.17.1`; CNAME `www`) |
| Port 4321 busy | `npm run dev -- --port 4322` |

## 8. Owner checklist: lock it down for real

The guard protects against the AI improvising; GitHub is what protects against everything else. Owners should enable (once):

- Branch protection / ruleset on `main`: require a pull request, at least 1 approval, require review from Code Owners
  (`.github/CODEOWNERS`), block force pushes and deletions, and do not allow the PR author to approve their own PR.
- Keep Vercel "Git fork protection" on (it is) and the project connected to `HowestAILab/askbefore.ai` only.
- Give colleagues **Write**, not Admin; never share a Vercel or GitHub login between people.
