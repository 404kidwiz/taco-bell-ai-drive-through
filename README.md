# 🌮 Taco Bell AI Drive-Through

**Live:** https://taco-bell-ai-drive-through.pages.dev

AI-powered voice ordering system for a Taco Bell drive-through. Customers place orders by speaking naturally to an AI — orders appear instantly on the kitchen display, SMS confirmations fire automatically.

---

## Screens

| Route | Screen |
|---|---|
| `/` | Customer landing — voice AI + rewards |
| `/menu` | Full menu with cart |
| `/checkout` | Order review + confirm |
| `/order-status` | Live pickup status tracker |
| `/kitchen` | Kitchen display — per-station |
| `/kds` | KDS Command Center — full dashboard |
| `/analytics` | Order analytics |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (static), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend | Cloudflare Workers (edge) + Turso (libSQL/SQLite) + Drizzle ORM |
| Real-time | Server-Sent Events (SSE) |
| SMS | CallMeBot (free) |
| Design | Stitch "Nocturnal Drive-Through" design system |
| Hosting | Cloudflare Pages + Cloudflare Workers |

---

## Getting Started

```bash
# Install
pnpm install

# Build
pnpm build

# Dev
pnpm dev
```

## Environment Variables

```env
TURSO_DATABASE_URL=libsql://taco-bell-orders-xxxx.turso.io
TURSO_AUTH_TOKEN=<from turso db tokens create>
NEXT_PUBLIC_API_URL=https://taco-bell-api.404kidwiz.workers.dev
```

## Deployment

```bash
# Frontend → Cloudflare Pages
npx wrangler pages deploy dist --project-name=taco-bell-ai-drive-through

# API Worker → Cloudflare Workers
npx wrangler deploy
```

---

## Features

- 🎙️ **Voice AI ordering** — speak naturally, AI matches items to menu
- ⚡ **Real-time kitchen sync** — orders appear on kitchen display in <2 seconds
- 📱 **SMS confirmations** — customer gets a text on order
- 🏆 **Rewards system** — Fire Points, tier badges
- 🎨 **Stitch design system** — Nocturnal Drive-Through aesthetic
- 📊 **Analytics dashboard** — daily revenue, top items, order volume

## Design System — "Nocturnal Drive-Through"

- Night Plum `#151022` base
- Electric Grape `#6D28FF` CTAs
- Fire Orange `#FF6A1F` urgency
- Crunch Gold `#FFC247` pricing
- Baja Cyan `#12D7F2` AI/voice states
- Typography: Space Grotesk + Manrope
- Icons: Material Symbols Outlined

---

## Repo

https://github.com/404kidwiz/taco-bell-ai-drive-through
