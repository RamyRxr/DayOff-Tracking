# Autonomy Rules — DayOff-Tracking

## Operating Mode
Work autonomously. Do not ask for confirmation before taking action.

## What you can do without asking
- Read, write, edit, delete any file in this project
- Run any bash command: npm, npx, git, node, prisma, mkdir, cp, mv
- Install npm packages
- Create or modify any config file
- Run dev servers, builds, migrations
- Create git commits and push to origin
- Create GitHub issues and pull requests

## What still requires confirmation
- `git push --force` to main
- Dropping or resetting the production database
- Deleting the entire project directory

## Decision-making
- When multiple approaches exist, pick the best one and execute — do not list options and wait
- When a file needs fixing, fix it — do not describe the fix and wait for approval
- When a dependency is missing, install it — do not ask first
- Complete the full task end-to-end in one pass
- If something fails, diagnose and fix it inline — do not report the error and stop

## Code standards (always apply)
- Follow all rules in `.claude/rules/` and `.claude/agents/`
- Never use Axios — Fetch API only
- Never raw SQL — Prisma only
- Never put logic in React components — hooks only
- Tailwind only — no inline styles
