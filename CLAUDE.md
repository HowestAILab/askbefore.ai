# askbefore.ai website

Dutch marketing site for Askbefore.AI (a Howest service). Astro (static output) on Vercel, code on GitHub
`HowestAILab/askbefore.ai`. **Pushing to `main` deploys to production at https://askbefore.ai.**

For any task that edits, previews, publishes, checks or rolls back the site, use the **askbefore-website** skill
(`.claude/skills/askbefore-website/SKILL.md`). On a fresh machine start with `npm run doctor`.

## Hard rules (enforced by `scripts/guard.mjs`; details in the skill)

- **Never fork** the repo and never add or change git remotes: `origin` = `HowestAILab/askbefore.ai` is the only place code lives.
- **Never create, link, repoint or deploy another Vercel project.** Production changes only by merging into `main`.
- **If a push or login fails, stop and tell the user.** Do not work around it (no fork, no other account, no API calls). Logins are done by the person: `! gh auth login`.
- **Contributors** (write access) work on a branch and open a pull request; **only owners merge to `main`** (it deploys to production). Never merge or approve your own PR, never force-push.
- Don't edit the guardrails (`.claude/`, `scripts/guard*`, `CLAUDE.md`, `.mcp.json`, `vercel.json`, `.github/`) unless you are an owner.

## Commands

- `npm install`: install dependencies (Node 22.12+)
- `npm run dev`: dev server on http://localhost:4321
- `npm run verify`: type check + production build + guard tests; must pass before every push
- `npm run doctor`: read-only check of Node, git, GitHub access and Vercel login

## Rules

- Site copy is Dutch. Match the tone of the existing pages.
- Edit `src/`; never edit `dist/` or `.astro/` (generated, git-ignored).
- Contact details, booking link, LinkedIn and nav live in `src/data/site.ts`; testimonials in `src/data/testimonials.ts`.
- Colours: only the client palette tokens at the top of `src/styles/global.css`. Purple text uses `--purple-deep` (same value as `--purple`); contrast on cream is low, so keep it to large text.
- Fonts live in `src/assets/fonts/alaska/` (woff2 + woff, see the README there) and are wired up in `src/styles/fonts.css`; keep both formats and the file names when replacing one.
- Every image needs a meaningful `alt`; use `<Image>` from `astro:assets` with images from `src/assets/images/`.
- No third-party CDNs and no secrets in the repo. `.env*` and `.vercel/` are git-ignored; keep it that way.
- Owners: ask the user for an explicit go-ahead before anything reaches `main` (it goes live within a minute).
