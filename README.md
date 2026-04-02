# 🌿 GardenMind

An AI-powered garden planning and management tool. Plan beds, track plants, log observations, and get intelligent planting advice — all in one place.

## Tech stack

- **Framework** — Next.js 15 (App Router)
- **Styling** — Tailwind CSS with a custom sage/earth palette
- **Auth** — Auth0 via `@auth0/nextjs-auth0`
- **AI** — Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Hosting** — Vercel

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/gardenmind.git
cd gardenmind
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `AUTH0_SECRET` | Run `openssl rand -hex 32` |
| `AUTH0_BASE_URL` | `http://localhost:3000` for local dev |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 domain, e.g. `https://dev-xxx.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 application settings |
| `AUTH0_CLIENT_SECRET` | Auth0 application settings |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

### 3. Auth0 setup

1. Create a **Regular Web Application** in [Auth0 dashboard](https://manage.auth0.com)
2. Add `http://localhost:3000/api/auth/callback` to **Allowed Callback URLs**
3. Add `http://localhost:3000` to **Allowed Logout URLs**
4. Add `http://localhost:3000` to **Allowed Web Origins**

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (app)/             # Authenticated app shell
│   │   ├── planner/       # Garden grid plotter
│   │   ├── journal/       # Observation log
│   │   ├── calendar/      # Seasonal calendar
│   │   └── ai-advisor/    # AI chat interface
│   ├── (auth)/            # Login / signup pages
│   └── api/
│       ├── auth/          # Auth0 handler
│       └── ai/            # Claude API proxy
├── components/
│   ├── layout/            # Nav, Sidebar
│   ├── ui/                # Button, Input, Modal, Badge
│   ├── planner/           # Garden grid components
│   └── journal/           # Journal entry components
├── lib/
│   ├── utils.ts           # cn() helper
│   └── plants.ts          # Static plant library
├── styles/
│   └── globals.css
└── types/
    └── index.ts           # Shared TypeScript types
```

## PR roadmap

| PR | Feature |
|---|---|
| #1 | Base scaffold — routing, layout, design system, types |
| #2 | Auth0 login / signup / session |
| #3 | Planner — bed creation + garden grid |
| #4 | Journal — entries, filters, tags |
| #5 | AI Advisor — Claude-powered plant lookup + recommendations |
| #6 | Calendar — seasonal planting view |

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in [Vercel dashboard](https://vercel.com)
3. Add all env vars from `.env.example` in Vercel project settings
4. Update `AUTH0_BASE_URL` to your Vercel URL
5. Add the Vercel URL to Auth0 callback/logout/origins settings
