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

## User flow

- **Public home page** (`/`) — Landing page with features overview
- **Login** → Redirects to dashboard after authentication
- **Dashboard** (`/dashboard`) — Overview with garden stats and bed cards
- **Planner** (`/planner`) — Bed list view; click a bed to edit (`/planner?bed=ID`)
- All authenticated routes protected by Auth0 middleware

## Project structure

```
src/
├── app/
│   ├── page.tsx           # Public landing page
│   ├── (app)/             # Authenticated app shell
│   │   ├── dashboard/     # Garden overview & stats
│   │   ├── planner/       # Bed list + grid editor
│   │   ├── library/       # Plant catalog browser
│   │   ├── journal/       # Observation log
│   │   ├── calendar/      # Seasonal calendar (planned)
│   │   └── ai-advisor/    # AI chat interface (planned)
│   ├── (auth)/            # Login / signup pages
│   └── api/
│       ├── auth/          # Auth0 handler
│       ├── beds/          # Bed CRUD API
│       └── ai/            # Claude API proxy (planned)
├── components/
│   ├── layout/            # Nav, Sidebar
│   ├── ui/                # Button, Input, Modal, Card, Badge
│   ├── planner/           # Garden grid components
│   └── library/           # Plant catalog components
├── lib/
│   ├── utils.ts           # cn() helper
│   ├── plants.ts          # Static plant library
│   └── bedUtils.ts        # Grid calculations
├── hooks/
│   └── useBeds.ts         # Bed data management
├── prisma/
│   └── schema.prisma      # Database schema
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

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Vercel deployment instructions including:
- Database setup (Vercel Postgres)
- Environment variables configuration
- Auth0 callback URL setup
- Running database migrations