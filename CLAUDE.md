# askbefore.ai website

Dutch marketing site for Askbefore.AI (a Howest service). Astro (static output) on Vercel, code on GitHub
`HowestAILab/askbefore.ai`. **Pushing to `main` deploys to production at https://askbefore.ai.**

For any task that edits, previews, publishes, checks or rolls back the site, use the **askbefore-website** skill
(`.claude/skills/askbefore-website/SKILL.md`). On a fresh machine start with `npm run doctor`.

## Commands

- `npm install`: install dependencies (Node 22.12+)
- `npm run dev`: dev server on http://localhost:4321
- `npm run verify`: type check + production build; must pass before every push
- `npm run doctor`: read-only check of Node, git, GitHub access and Vercel login

## Rules

- Site copy is Dutch. Match the tone of the existing pages.
- Edit `src/`; never edit `dist/` or `.astro/` (generated, git-ignored).
- Contact details, booking link, LinkedIn and nav live in `src/data/site.ts`; testimonials in `src/data/testimonials.ts`.
- Purple text uses `--purple-ink` / `--purple-strong` (the bright `--purple` is background only; contrast).
- Every image needs a meaningful `alt`; use `<Image>` from `astro:assets` with images from `src/assets/images/`.
- No third-party CDNs and no secrets in the repo. `.env*` and `.vercel/` are git-ignored; keep it that way.
- Ask the user before pushing to `main` (it goes live immediately). Never force-push.
