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

## Rules
- All Claude API calls go through src/app/api/ai/ — never client-side
- Auth is Auth0 via @auth0/nextjs-auth0 — middleware protects (app) routes
- One feature per PR, branch naming: pr/NN-feature-name
- Commits: feat:, fix:, chore: prefixes
- Always run `npm run lint && npm run type-check` before marking a PR ready

## PR status
- PR #1 base scaffold ✅ merged
- PR #2 Auth0 login/session 🔄 up next
- PR #3 Planner — bed creation + grid
- PR #4 Journal — entries, filters, tags
- PR #5 AI Advisor — Claude plant lookup + recommendations
- PR #6 Calendar — seasonal planting view