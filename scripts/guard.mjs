#!/usr/bin/env node
// PreToolUse guard for Claude Code in this repository (wired up in .claude/settings.json).
//
// It stops the actions that must never happen when someone works on the site through Claude:
// forking the repo, adding/changing git remotes, pushing anywhere but `origin`, force-pushing,
// repointing or re-creating the Vercel project, deploying outside the Git flow, and (for people
// who are not repo owners) pushing to or merging into `main` or editing the guardrails themselves.
//
// Contract: reads the hook JSON on stdin; exit 0 = allow, exit 2 = block (stderr is shown to Claude).
// "Owner" = MAINTAIN/ADMIN permission on the GitHub repo. Unknown role (not logged in) = contributor.
// This is a safety net for the AI agent, not a security boundary against a determined human:
// the real lock is GitHub branch protection + CODEOWNERS (see .github/CODEOWNERS and the skill).

import { execFileSync } from "node:child_process";
import { basename } from "node:path";

export const REPO = "HowestAILab/askbefore.ai";

const PROTECTED_PATHS = [
  /(^|\/)\.claude\//,
  /(^|\/)scripts\/guard/,
  /(^|\/)CLAUDE\.md$/,
  /(^|\/)\.mcp\.json$/,
  /(^|\/)vercel\.json$/,
  /(^|\/)\.github\//,
];

const STOP =
  "Do NOT look for another way around this (no fork, no second repository or Vercel project, no other remote, no API call). " +
  "Stop, explain to the user what you were trying to do, and let them or the repo owner handle it.";

// ---------- shell-ish parsing ----------
function tokenize(segment) {
  const tokens = [];
  const re = /"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(segment))) tokens.push(m[1] ?? m[2] ?? m[3]);
  return tokens;
}

function splitSegments(command) {
  return command
    .replace(/\$\(|`/g, ";")
    .split(/&&|\|\||[;|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const WRAPPERS = new Set(["sudo", "command", "env", "time", "nohup", "exec", "builtin"]);

/** Returns the list of {bin, args} found in a command, unwrapping env vars, sudo, npx, bash -c ... */
export function parseCommands(command, depth = 0) {
  const out = [];
  if (depth > 3) return out;
  for (const seg of splitSegments(command)) {
    let t = tokenize(seg);
    while (t.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t[0]) || WRAPPERS.has(t[0]))) t.shift();
    if (!t.length) continue;
    let bin = basename(t[0]);
    let args = t.slice(1);
    if ((bin === "npx" || bin === "bunx") && args.length) {
      while (args[0]?.startsWith("-")) args.shift();
      bin = basename(args.shift() ?? "");
    } else if ((bin === "pnpm" || bin === "yarn") && (args[0] === "dlx" || args[0] === "exec")) {
      args.shift();
      bin = basename(args.shift() ?? "");
    } else if (bin === "npm" && args[0] === "exec") {
      args.shift();
      while (args[0]?.startsWith("-")) args.shift();
      bin = basename(args.shift() ?? "");
    }
    if (["bash", "sh", "zsh", "dash"].includes(bin)) {
      const i = args.findIndex((a) => /^-[a-z]*c$/.test(a));
      if (i >= 0 && args[i + 1]) out.push(...parseCommands(args[i + 1], depth + 1));
    }
    if (bin === "eval") out.push(...parseCommands(args.join(" "), depth + 1));
    out.push({ bin, args });
  }
  return out;
}

// ---------- role / context lookups (lazy) ----------
let cachedRole;
function role() {
  if (cachedRole) return cachedRole;
  try {
    const perm = execFileSync("gh", ["repo", "view", REPO, "--json", "viewerPermission", "-q", ".viewerPermission"], {
      encoding: "utf8",
      timeout: 8000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    cachedRole = perm === "ADMIN" || perm === "MAINTAIN" ? "owner" : "contributor";
  } catch {
    cachedRole = "contributor"; // not logged in / offline: fail closed
  }
  return cachedRole;
}

function currentBranch(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

// ---------- rules ----------
const flag = (args, ...names) => args.some((a) => names.includes(a));
const firstPositional = (args) => args.find((a) => !a.startsWith("-"));
/** Value following one of the option names (also handles --opt=value), or undefined if the option is absent. */
const valueOf = (args, ...names) => {
  for (let i = 0; i < args.length; i++) {
    if (names.includes(args[i])) return args[i + 1];
    for (const n of names) if (n.startsWith("--") && args[i].startsWith(n + "=")) return args[i].slice(n.length + 1);
  }
  return undefined;
};

/** @returns {string|null} a block message, or null to allow */
export function checkCommand(command, { cwd = process.cwd(), getRole = role, getBranch = currentBranch } = {}) {
  for (const { bin, args } of parseCommands(command)) {
    // ---- GitHub CLI ----
    if (bin === "gh") {
      const [a, b] = args;
      if (a === "repo" && ["fork", "create", "delete", "rename", "archive", "unarchive", "transfer"].includes(b))
        return `Blocked: \`gh repo ${b}\`. This project lives in ${REPO} only; forks and extra repositories are not allowed. ${STOP}`;
      if (a === "repo" && b === "edit" && getRole() !== "owner")
        return `Blocked: only repo owners may change repository settings. ${STOP}`;
      if (a === "auth" && (b === "token" || flag(args, "-t", "--show-token")))
        return `Blocked: do not read or print GitHub tokens. ${STOP}`;
      if (a === "pr" && b === "create") {
        const head = valueOf(args, "--head", "-H") ?? "";
        const repo = valueOf(args, "--repo", "-R");
        if (head.includes(":")) return `Blocked: pull requests must come from a branch in ${REPO}, not from a fork (--head ${head}). ${STOP}`;
        if (repo && repo !== REPO) return `Blocked: pull requests may only target ${REPO}. ${STOP}`;
      }
      if (a === "pr" && ["merge", "close", "ready"].includes(b) && getRole() !== "owner")
        return `Blocked: only a repo owner merges pull requests into main (it deploys to production). Ask the owner to review and merge. ${STOP}`;
      if (a === "pr" && b === "review" && flag(args, "--approve") && getRole() !== "owner")
        return `Blocked: approvals come from a repo owner. ${STOP}`;
      if (a === "api" && getRole() !== "owner") {
        const method = valueOf(args, "--method", "-X")?.toUpperCase();
        const mutating = (method && method !== "GET") || flag(args, "-f", "-F", "--field", "--raw-field", "--input");
        if (mutating) return `Blocked: write calls through \`gh api\` are for repo owners only. ${STOP}`;
      }
      continue;
    }

    // ---- git ----
    if (bin === "git") {
      let i = 0;
      while (args[i]?.startsWith("-")) i += args[i] === "-C" || args[i] === "-c" ? 2 : 1;
      const sub = args[i];
      const rest = args.slice(i + 1);
      if (sub === "remote" && ["add", "set-url", "rename", "remove", "rm", "set-head"].includes(rest[0]))
        return `Blocked: do not change git remotes. \`origin\` must stay ${REPO}; pushing to a fork or another repository is not allowed. ${STOP}`;
      if (sub === "config" && /remote\.|url\./.test(rest.join(" ")) && !flag(rest, "--get", "--get-all", "--list", "-l"))
        return `Blocked: do not edit remote/url git config. ${STOP}`;
      if (sub === "push") {
        if (flag(rest, "--force", "-f", "--force-with-lease", "--delete", "-d", "--mirror", "--prune") || rest.some((a) => /^--force/.test(a) || /^\+/.test(a)))
          return `Blocked: no force-pushes, deletes or mirrors; published history must not be rewritten. ${STOP}`;
        const pos = rest.filter((a) => !a.startsWith("-"));
        const remote = pos[0];
        if (remote && remote !== "origin")
          return `Blocked: push only to \`origin\` (${REPO}); "${remote}" is not allowed. ${STOP}`;
        if (getRole() !== "owner") {
          const refspecs = pos.slice(1);
          const toMain = refspecs.some((r) => /(^|:)(refs\/heads\/)?main$/.test(r));
          const implicit = refspecs.length === 0 && getBranch(cwd) === "main";
          if (toMain || implicit)
            return `Blocked: contributors never push to main (it deploys to production). Push a branch instead: \`git switch -c <topic> && git push -u origin <topic>\`, open a pull request, and let a repo owner review and merge. ${STOP}`;
        }
      }
      continue;
    }

    // ---- Vercel CLI ----
    if (bin === "vercel" || bin === "vc") {
      const sub = firstPositional(args);
      const safe = new Set(["ls", "list", "inspect", "logs", "whoami", "help", undefined]);
      if (flag(args, "--prod", "--prebuilt") || !safe.has(sub)) {
        if (sub === "login" || sub === "logout") return `Blocked: logging in/out is done by the person themselves (\`! vercel login\`). ${STOP}`;
        if (flag(args, "--version", "-v", "--help", "-h") && !sub) continue;
        if (getRole() !== "owner")
          return `Blocked: \`vercel ${sub ?? ""}\` changes Vercel configuration or deployments. Production deploys happen only through git (push to main by a repo owner). Never link, create, repoint or deploy Vercel projects from here. ${STOP}`;
      }
      continue;
    }

    // ---- raw API calls that could repoint things ----
    if (bin === "curl" || bin === "wget") {
      const joined = args.join(" ");
      if (/(api\.vercel\.com|api\.github\.com)/.test(joined) && /(-X|--request|-d|--data|--json|--upload-file|--post)/.test(joined) && getRole() !== "owner")
        return `Blocked: write calls to the GitHub/Vercel APIs are for repo owners only. ${STOP}`;
      continue;
    }

    // ---- reading credential stores ----
    if (["cat", "less", "more", "head", "tail", "grep", "cp", "base64", "xxd", "strings"].includes(bin)) {
      if (args.some((a) => /(com\.vercel\.cli|\.config\/gh\/hosts|\.ssh\/id_|\.git-credentials|\.npmrc|\.env($|\.(?!example)))/.test(a)))
        return `Blocked: do not read credential files or tokens. ${STOP}`;
    }
  }
  return null;
}

/** File edits: contributors may not edit the guardrails, the skill, deploy config or CODEOWNERS. */
export function checkEdit(filePath, { getRole = role } = {}) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, "/");
  if (PROTECTED_PATHS.some((re) => re.test(normalized)) && getRole() !== "owner")
    return `Blocked: ${filePath} is a guardrail / deployment file that only a repo owner may change (it controls what Claude and Vercel are allowed to do). Describe the change you need to the repo owner instead. ${STOP}`;
  return null;
}

// ---------- entry point ----------
async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // never break the session on malformed input
  }
  const tool = input.tool_name;
  const ti = input.tool_input ?? {};
  let msg = null;
  if (tool === "Bash") msg = checkCommand(String(ti.command ?? ""), { cwd: input.cwd ?? process.cwd() });
  else if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) msg = checkEdit(ti.file_path ?? ti.notebook_path);
  if (msg) {
    process.stderr.write(`askbefore guard: ${msg}\n`);
    process.exit(2);
  }
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
