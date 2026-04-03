# GardenMind — Claude Code context

## What this is
AI-powered garden planning app. Next.js 15, TypeScript, Tailwind, Auth0, Anthropic API, Vercel.

## App Structure
- **Public home** (`/`) — Landing page with features showcase
- **Dashboard** (`/dashboard`) — Authenticated landing, shows garden overview & bed cards
- **Planner** (`/planner`) — Bed list view; `/planner?bed=ID` opens bed editor
- **Library** (`/library`) — Plant catalog with search/filters
- **Journal, Calendar, AI Advisor** — Coming soon pages
- Protected routes: dashboard, planner, library, journal, calendar, ai-advisor

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
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**Quick reference:**
- `postinstall` script runs `prisma generate` automatically
- Run `prisma migrate deploy` to create tables in production DB
- Set 6 environment variables (DATABASE_URL + 5 Auth0 vars)
- Update Auth0 callback URLs to match Vercel domain

## Rules
- All Claude API calls go through src/app/api/ai/ — never client-side
- Auth is Auth0 via @auth0/nextjs-auth0 — middleware protects (app) routes
- One feature per PR, branch naming: pr/NN-feature-name
- Commits: feat:, fix:, chore: prefixes
- Always run `npm run lint && npm run type-check` before marking a PR ready

## Feature Status
- ✅ Base scaffold — routing, layout, design system
- ✅ Auth0 login/session — middleware protects (app) routes
- ✅ Public home page — landing page with features
- ✅ Dashboard — garden overview with stats & bed cards
- ✅ Planner — bed creation, grid editor, plant placement, drag-drop
- ✅ Library — plant catalog with search, filters, companion planting
- 🚧 Journal — entries, filters, tags (coming soon)
- 🚧 AI Advisor — Claude plant lookup + recommendations (coming soon)
- 🚧 Calendar — seasonal planting view (coming soon)
- 🚧 Care tracking — watering, fertilizing, pruning schedules (coming soon)