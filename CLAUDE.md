# GardenMind — Claude Code context

## What this is
AI-powered garden planning app. Next.js 15, TypeScript, Tailwind, Auth0, Anthropic API, Vercel.

## Design system
- Fonts: Lora (headings, serif), DM Sans (body)
- Colors: sage (primary), earth (accent), cream (background) — all defined in tailwind.config.ts
- Components: src/components/ui/ — always use these, don't create inline styles

## UX Principles
- **User awareness first**: Never delete, modify, or move user data without explicit confirmation
- **Show don't hide**: When actions affect user data, show exactly what will change before it happens
- **Clear choices**: Provide obvious cancel/proceed options with context about consequences
- **No surprises**: Alert users to destructive actions (dimension changes removing plants, deleting beds, etc.)
- **Friendly defaults**: Make the app extremely user-friendly while respecting user control

## Deployment (Vercel)
Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string (use Vercel Postgres or external)
- `AUTH0_SECRET` — Generate with: `openssl rand -hex 32`
- `AUTH0_BASE_URL` — Your Vercel deployment URL (e.g., https://gardenmind.vercel.app)
- `AUTH0_ISSUER_BASE_URL` — Your Auth0 tenant URL
- `AUTH0_CLIENT_ID` — From Auth0 application settings
- `AUTH0_CLIENT_SECRET` — From Auth0 application settings

The `postinstall` script automatically runs `prisma generate` during deployment.

## Rules
- All Claude API calls go through src/app/api/ai/ — never client-side
- Auth is Auth0 via @auth0/nextjs-auth0 — middleware protects (app) routes
- One feature per PR, branch naming: pr/NN-feature-name
- Commits: feat:, fix:, chore: prefixes
- Always run `npm run lint && npm run type-check` before marking a PR ready

## PR status
- PR #1 base scaffold ✅ merged
- PR #2 Auth0 login/session ✅ merged
- PR #3 Planner — bed creation + grid ✅ merged
- PR #4 Journal — entries, filters, tags
- PR #5 AI Advisor — Claude plant lookup + recommendations
- PR #6 Calendar — seasonal planting view
- PR #7 Plant care tracking — watering, fertilizing, pruning schedules