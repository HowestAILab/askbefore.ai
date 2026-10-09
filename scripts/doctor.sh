#!/usr/bin/env bash
# Read-only environment check for working on the askbefore.ai website.
# Prints what is OK, what is missing and the exact command to fix it. Changes nothing.
# Usage: npm run doctor    (or: bash scripts/doctor.sh)

REPO_SLUG="HowestAILab/askbefore.ai"
VERCEL_TEAM="askbeforeai"
VERCEL_PROJECT="askbefore-ai"
VERCEL_PROJECT_ID="prj_MvvfXXkUde5zMJozvWkMjIzi9kL8"

req_fail=0
ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; }
bad()  { printf "  \033[31m✘\033[0m %s\n      → %s\n" "$1" "$2"; req_fail=$((req_fail + 1)); }
warn() { printf "  \033[33m!\033[0m %s\n      → %s\n" "$1" "$2"; }
note() { printf "    %s\n" "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

cd "$(dirname "$0")/.." || exit 1
echo "askbefore.ai doctor ($(pwd))"
echo

echo "Tools"
if have node; then
  v=$(node -p 'process.versions.node')
  major=${v%%.*}; rest=${v#*.}; minor=${rest%%.*}
  if [ "$major" -gt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -ge 12 ]; }; then ok "Node $v"; else bad "Node $v is too old (need 22.12+)" "install Node 22 LTS or newer (https://nodejs.org)"; fi
else
  bad "Node.js not found" "install Node 22 LTS or newer (https://nodejs.org)"
fi
if have git; then ok "git $(git --version | awk '{print $3}')"; else bad "git not found" "install git"; fi
if [ -d node_modules/astro ]; then ok "dependencies installed"; else bad "dependencies not installed" "npm install"; fi

echo
echo "Repository (this must be the ORIGINAL repo, never a fork or copy)"
origin=$(git remote get-url origin 2>/dev/null)
case "$origin" in
  *"$REPO_SLUG"*|*"${REPO_SLUG%.ai}"*) ok "origin = $origin" ;;
  "") bad "no git remote 'origin'" "re-clone: git clone git@github.com:$REPO_SLUG.git" ;;
  *)  bad "origin is $origin, not $REPO_SLUG (this looks like a fork or a wrong copy)" "do NOT work here. Clone the original: git clone git@github.com:$REPO_SLUG.git (ask the repo owner for write access if pushing fails)" ;;
esac
extra=$(git remote | grep -vx origin | tr '\n' ' ')
if [ -n "$extra" ]; then bad "extra git remote(s): $extra" "remove them: git remote remove <name>. Only 'origin' ($REPO_SLUG) may exist"; else ok "origin is the only remote"; fi

gname=$(git config user.name); gemail=$(git config user.email)
if [ -z "$gname" ] || [ -z "$gemail" ]; then
  bad "git user.name / user.email not set" "git config --global user.name 'Your Name' && git config --global user.email you@example.com"
elif echo "$gname $gemail" | grep -qiE "^claude |anthropic\.com"; then
  bad "git identity is '$gname <$gemail>' (that is Claude, not you)" "set your own: git config user.name 'Your Name' && git config user.email <verified email of your GitHub account>"
else
  ok "git identity: $gname <$gemail>"
  note "(this email must be a verified email on YOUR GitHub account: Settings → Emails)"
fi

echo
echo "GitHub login and permissions"
role="unknown"
if have gh; then
  if gh auth status >/dev/null 2>&1; then
    login=$(gh api user -q .login 2>/dev/null)
    ok "gh logged in as $login"
    perm=$(gh repo view "$REPO_SLUG" --json viewerPermission -q .viewerPermission 2>/dev/null)
    isfork=$(gh repo view "$REPO_SLUG" --json isFork -q .isFork 2>/dev/null)
    [ "$isfork" = "true" ] && bad "$REPO_SLUG is a fork" "use the original repository"
    case "$perm" in
      ADMIN|MAINTAIN) role="owner";       ok "you are an OWNER ($perm): you may merge to main and change settings" ;;
      WRITE)          role="contributor"; ok "you are a CONTRIBUTOR (WRITE): push branches and open pull requests; an owner merges to main" ;;
      READ|TRIAGE)    bad "you only have $perm access to $REPO_SLUG, so you cannot push" "ask a repo owner to give you write access. Do NOT fork the repository as a workaround" ;;
      *)              bad "cannot read your permission on $REPO_SLUG" "make sure the repo owner invited you AND you accepted the invitation (check your email / https://github.com/$REPO_SLUG/invitations)" ;;
    esac
  else
    bad "GitHub CLI is installed but you are not logged in" "type:  ! gh auth login   (Claude cannot log you in; it needs your browser)"
  fi
else
  warn "GitHub CLI (gh) not installed (needed to open pull requests)" "https://cli.github.com, then: ! gh auth login"
fi
if ssh -o BatchMode=yes -o ConnectTimeout=5 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  ok "SSH key works for GitHub"
elif [ "${origin#https}" != "$origin" ]; then
  ok "using an HTTPS remote (credentials come from gh / a credential helper)"
else
  bad "SSH to GitHub does not work and the remote uses SSH" "add an SSH key (https://github.com/settings/keys) or switch to HTTPS: git remote set-url origin https://github.com/$REPO_SLUG.git (then ! gh auth login)"
fi
if [ "$role" = "contributor" ] || [ "$role" = "unknown" ]; then
  note "Contributor rules: work on a branch, open a PR, never push/merge to main, never touch Vercel settings."
fi

echo
echo "Vercel (optional: deploys happen automatically on git push; this is only for inspecting them)"
vbin=""
if have vercel; then vbin=vercel; elif [ -x "$HOME/.npm-global/bin/vercel" ]; then vbin="$HOME/.npm-global/bin/vercel"; fi
if [ -n "$vbin" ]; then
  ok "Vercel CLI found"
  if who=$("$vbin" whoami 2>/dev/null | tail -1) && [ -n "$who" ] && ! echo "$who" | grep -qi "logged out\|not logged"; then
    ok "logged in as $who"
  else
    warn "Vercel CLI not logged in" "! vercel login"
  fi
  if [ -f .vercel/project.json ]; then
    pid=$(node -p 'try{require("./.vercel/project.json").projectId}catch(e){""}' 2>/dev/null)
    if [ "$pid" = "$VERCEL_PROJECT_ID" ]; then ok "linked to the right Vercel project ($VERCEL_PROJECT)"; else bad "linked to a DIFFERENT Vercel project ($pid)" "delete the .vercel folder and ask the owner. Never create or link another Vercel project for this site"; fi
  else
    warn "not linked to the Vercel project (only needed to inspect deployments)" "! vercel link --project $VERCEL_PROJECT --scope $VERCEL_TEAM"
  fi
else
  warn "Vercel CLI not installed (optional)" "npm install --global vercel   (or use the Vercel MCP: /mcp → vercel)"
fi

echo
echo "Guardrails"
if [ -f .claude/settings.json ] && [ -f scripts/guard.mjs ]; then ok "Claude guard hook is configured (.claude/settings.json + scripts/guard.mjs)"; else bad "guard hook files are missing" "git checkout origin/main -- .claude/settings.json scripts/guard.mjs"; fi

echo
if [ "$req_fail" -eq 0 ]; then
  echo "All required checks passed. Next: edit, then 'npm run verify', then commit and push (branch + PR unless you are an owner)."
else
  echo "$req_fail required check(s) failed. Fix the ✘ items above and run 'npm run doctor' again."
  echo "If you cannot fix one, STOP and ask the repo owner. Do not fork the repository or create another Vercel project."
  exit 1
fi
