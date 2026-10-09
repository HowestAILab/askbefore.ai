// Unit tests for scripts/guard.mjs. Run: npm run test:guard
import assert from "node:assert/strict";
import { checkCommand, checkEdit } from "./guard.mjs";

let failed = 0;
const run = (name, fn) => {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${name}\n      ${e.message.split("\n")[0]}`);
  }
};

const as = (role, branch = "feature-x") => ({ getRole: () => role, getBranch: () => branch, cwd: "/x" });
const contributor = as("contributor");
const owner = as("owner");
const blocked = (cmd, ctx) => assert.ok(checkCommand(cmd, ctx), `should BLOCK: ${cmd}`);
const allowed = (cmd, ctx) => assert.equal(checkCommand(cmd, ctx), null, `should ALLOW: ${cmd} -> ${checkCommand(cmd, ctx)}`);

// ---- the incident: forking, moving the deploy to a fork ----
for (const cmd of [
  "gh repo fork HowestAILab/askbefore.ai --clone",
  "gh repo fork --remote",
  "gh repo create askbefore-site --public",
  "gh repo rename askbefore-site",
  "gh repo delete HowestAILab/askbefore.ai --yes",
  "git remote add fork git@github.com:someone/askbefore-site.git",
  "git remote set-url origin git@github.com:someone/askbefore-site.git",
  "git remote remove origin",
  "git config remote.origin.url https://github.com/someone/x.git",
  "git push fork main",
  "git push git@github.com:someone/askbefore-site.git HEAD",
  "git push https://github.com/someone/x.git",
  "gh pr create --head someone:design --base main",
  "gh pr create --repo someone/askbefore-site",
  "vercel git connect https://github.com/someone/askbefore-site",
  "vercel link --project my-own --yes",
  "vercel project add askbefore-site",
  "vercel deploy --prod",
  "vercel --prod",
  "vercel domains rm askbefore.ai",
  "vercel env add SECRET",
  "vercel api /v9/projects/askbefore-ai -X PATCH",
  "vercel rollback",
  "npx vercel git connect x",
  "~/.npm-global/bin/vercel project rm askbefore-ai",
]) run(`contributor blocked: ${cmd}`, () => blocked(cmd, contributor));

// the universal bans also hold for owners
for (const cmd of [
  "gh repo fork HowestAILab/askbefore.ai",
  "git remote add fork git@github.com:someone/x.git",
  "git remote set-url origin git@github.com:someone/x.git",
  "git push fork main",
  "git push --force origin feature-x",
  "git push -f origin feature-x",
  "git push origin +feature-x",
  "git push origin --delete feature-x",
  "gh pr create --head someone:design",
  "gh auth token",
]) run(`owner blocked: ${cmd}`, () => blocked(cmd, owner));

// ---- bypass attempts ----
for (const cmd of [
  "cd /tmp && gh repo fork HowestAILab/askbefore.ai",
  "echo ok; git remote add fork x",
  "bash -c 'gh repo fork HowestAILab/askbefore.ai'",
  "sh -c \"git remote add fork x\"",
  "FOO=1 gh repo fork HowestAILab/askbefore.ai",
  "sudo git remote add fork x",
  "echo $(gh repo fork HowestAILab/askbefore.ai)",
  "true && vercel git connect x",
  "eval 'git remote set-url origin x'",
  "cat ~/.local/share/com.vercel.cli/auth.json",
  "cat ~/.config/gh/hosts.yml",
  "curl -X POST https://api.vercel.com/v9/projects -d '{}'",
]) run(`bypass blocked (contributor): ${cmd}`, () => blocked(cmd, contributor));

// ---- main protection ----
for (const cmd of ["git push origin main", "git push origin HEAD:main", "git push origin feature-x:main", "git push -u origin main", "gh pr merge 1 --squash", "gh pr merge 1 --admin", "gh pr review 1 --approve"])
  run(`contributor blocked: ${cmd}`, () => blocked(cmd, contributor));
run("contributor on main blocked from bare `git push`", () => blocked("git push", as("contributor", "main")));
run("owner may push main", () => allowed("git push origin main", owner));
run("owner may merge PRs", () => allowed("gh pr merge 1 --squash", owner));
run("owner may use vercel admin", () => allowed("vercel domains ls", owner));
run("owner may read vercel project via api (GET)", () => allowed("vercel api /v9/projects/askbefore-ai", owner));

// ---- normal contributor work must keep working ----
for (const cmd of [
  "git status",
  "git pull --rebase origin main",
  "git switch -c topic/footer-text",
  "git add src/pages/aanbod.astro",
  'git commit -m "Update aanbod text"',
  "git push -u origin topic/footer-text",
  "git push origin topic/footer-text",
  "git push",
  "git log --oneline -5",
  "git revert abc1234",
  "git remote -v",
  "git remote get-url origin",
  "git config user.email me@example.com",
  "gh auth status",
  "gh repo view HowestAILab/askbefore.ai --json viewerPermission",
  "gh pr create --base main --head topic/footer-text --title x --body y",
  "gh pr view 1",
  "gh pr list",
  "gh api repos/HowestAILab/askbefore.ai/pulls",
  "npm install",
  "npm run dev",
  "npm run verify && npm run doctor",
  "npx astro build",
  "vercel ls --scope askbeforeai",
  "vercel inspect https://askbefore-ai.vercel.app",
  "vercel logs https://askbefore-ai.vercel.app",
  "vercel whoami",
  "curl -sI https://askbefore.ai",
  "curl -s https://api.github.com/repos/HowestAILab/askbefore.ai",
  "cat src/data/site.ts",
  "cat .env.example",
]) run(`contributor allowed: ${cmd}`, () => allowed(cmd, contributor));
run("contributor on branch may `git push` without args", () => allowed("git push", as("contributor", "topic/x")));

// ---- file edits ----
for (const p of [".claude/settings.json", ".claude/skills/askbefore-website/SKILL.md", "scripts/guard.mjs", "scripts/guard.test.mjs", "CLAUDE.md", ".mcp.json", "vercel.json", ".github/CODEOWNERS", "/home/me/askbefore.ai/.claude/settings.json"])
  run(`contributor cannot edit ${p}`, () => assert.ok(checkEdit(p, { getRole: () => "contributor" }), "should block"));
for (const p of ["src/pages/aanbod.astro", "src/data/testimonials.ts", "src/styles/global.css", "README.md", "public/robots.txt", "package.json"])
  run(`contributor can edit ${p}`, () => assert.equal(checkEdit(p, { getRole: () => "contributor" }), null));
run("owner can edit guardrails", () => assert.equal(checkEdit(".claude/settings.json", { getRole: () => "owner" }), null));

console.log(failed ? `\n${failed} FAILED` : "\nALL GUARD TESTS PASSED");
process.exit(failed ? 1 : 0);
