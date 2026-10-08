#!/usr/bin/env bash
# Read-only environment check for working on the askbefore.ai website.
# Prints what is OK, what is missing and the exact command to fix it. Changes nothing.
# Usage: npm run doctor    (or: bash scripts/doctor.sh)

REPO_SLUG="HowestAILab/askbefore.ai"
VERCEL_TEAM="askbeforeai"
VERCEL_PROJECT="askbefore-ai"

req_fail=0
ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; }
bad()  { printf "  \033[31m✘\033[0m %s\n      → %s\n" "$1" "$2"; req_fail=$((req_fail + 1)); }
warn() { printf "  \033[33m!\033[0m %s\n      → %s\n" "$1" "$2"; }
have() { command -v "$1" >/dev/null 2>&1; }

cd "$(dirname "$0")/.." || exit 1
echo "askbefore.ai doctor ($(pwd))"
echo

echo "Required"
if have node; then
  v=$(node -p 'process.versions.node')
  major=${v%%.*}; rest=${v#*.}; minor=${rest%%.*}
  if [ "$major" -gt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -ge 12 ]; }; then ok "Node $v"; else bad "Node $v is too old (need 22.12+)" "install Node 22 LTS or newer (https://nodejs.org)"; fi
else
  bad "Node.js not found" "install Node 22 LTS or newer (https://nodejs.org)"
fi

if have git; then ok "git $(git --version | awk '{print $3}')"; else bad "git not found" "install git"; fi

if [ -d node_modules/astro ]; then ok "dependencies installed"; else bad "dependencies not installed" "npm install"; fi

origin=$(git remote get-url origin 2>/dev/null)
case "$origin" in
  *"$REPO_SLUG"*) ok "git remote origin = $origin" ;;
  "")             bad "no git remote 'origin'" "git remote add origin git@github.com:$REPO_SLUG.git" ;;
  *)              warn "origin is $origin (expected $REPO_SLUG)" "check you cloned the right repository" ;;
esac

gname=$(git config user.name); gemail=$(git config user.email)
if [ -n "$gname" ] && [ -n "$gemail" ]; then
  ok "git identity: $gname <$gemail>"
  warn "commit email must be a verified email on YOUR GitHub account (Vercel uses it to attribute deploys)" "GitHub → Settings → Emails; fix with: git config user.email you@example.com"
else
  bad "git user.name / user.email not set" "git config --global user.name 'Your Name' && git config --global user.email you@example.com"
fi

echo
echo "GitHub access"
if have gh; then
  if gh auth status >/dev/null 2>&1; then
    ok "gh logged in as $(gh api user -q .login 2>/dev/null)"
    perm=$(gh repo view "$REPO_SLUG" --json viewerPermission -q .viewerPermission 2>/dev/null)
    case "$perm" in
      WRITE|MAINTAIN|ADMIN) ok "you have $perm access to $REPO_SLUG" ;;
      READ|TRIAGE)          bad "you only have $perm access to $REPO_SLUG (cannot push)" "ask the owner to add you to the HowestAILab organisation / repo with write access" ;;
      *)                    warn "could not read your permission on $REPO_SLUG" "make sure you are a member of the HowestAILab organisation" ;;
    esac
  else
    warn "gh is installed but not logged in" "gh auth login"
  fi
else
  warn "GitHub CLI (gh) not installed (optional, but handy)" "https://cli.github.com, then: gh auth login"
fi
if ssh -o BatchMode=yes -o ConnectTimeout=5 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  ok "SSH key works for GitHub"
elif [ "${origin#https}" != "$origin" ]; then
  ok "using HTTPS remote (credentials come from gh / credential helper)"
else
  bad "SSH to GitHub does not work and the remote uses SSH" "add an SSH key (https://github.com/settings/keys) or switch to HTTPS: git remote set-url origin https://github.com/$REPO_SLUG.git"
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
    warn "Vercel CLI not logged in" "vercel login"
  fi
  if [ -f .vercel/project.json ]; then ok "linked to a Vercel project"; else warn "not linked to the Vercel project" "vercel link --project $VERCEL_PROJECT --scope $VERCEL_TEAM"; fi
else
  warn "Vercel CLI not installed" "npm install --global vercel   (or use the Vercel MCP: /mcp → vercel)"
fi

echo
if [ "$req_fail" -eq 0 ]; then
  echo "All required checks passed. Next: edit, then 'npm run verify', then commit and push."
else
  echo "$req_fail required check(s) failed. Fix the ✘ items above and run 'npm run doctor' again."
  exit 1
fi
