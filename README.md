# 🌮 Taco Bell AI Drive-Through

**Live:** https://2ee803ac.taco-bell-ai-drive-through.pages.dev

AI-powered voice ordering system for a Taco Bell drive-through. Customers place orders by speaking naturally to an AI — orders appear instantly on the kitchen display, SMS confirmations fire automatically.

---

## Screens

| Route | Screen | Description |
|---|---|---|
| `/` | Customer Landing | Voice AI hero, speech bubble, rewards card |
| `/menu` | Menu + Cart | Category tabs, item grid, add-ons, cart sidebar |
| `/checkout` | Order Review | 3-step tracker, AI waveform, "Confirm & Fire" |
| `/order-status` | Pickup Status | 4-step progress rail, ETA, lane info |
| `/kitchen` | Kitchen Display | Per-station ticket queue, bump routing |
| `/kds` | KDS Command Center | 4-column dashboard — NEW/IN KITCHEN/BAGGING/READY |
| `/analytics` | Analytics | Order volume, revenue, top items |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (static export), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Backend | Cloudflare Workers (edge) + Turso (libSQL/SQLite) + Drizzle ORM |
| Real-time | Server-Sent Events (SSE) |
| SMS | CallMeBot (free, no account) |
| Design | Stitch "Nocturnal Drive-Through" — Space Grotesk + Manrope |
| Hosting | Cloudflare Pages + Cloudflare Workers |

---

## Design System — Nocturnal Drive-Through

**Stitch Project ID:** `6883950520556782876`

| Color | Hex | Use |
|---|---|---|
| Night Plum | `#151022` | Base canvas |
| Electric Grape | `#6D28FF` | Brand / CTAs |
| Fire Orange | `#FF6A1F` | Urgency |
| Crunch Gold | `#FFC247` | Pricing / rewards |
| Baja Cyan | `#12D7F2` | AI / voice state |

Full design tokens in [`.stitch/DESIGN.md`](.stitch/DESIGN.md).

---

## Getting Started

```bash
# Install
pnpm install

# Build static export
pnpm build

# Dev
pnpm dev
```

---

## Deployment

```bash
# Frontend → Cloudflare Pages
npx wrangler pages deploy dist --project-name=taco-bell-ai-drive-through

# API → Cloudflare Workers
cd workers && npx wrangler deploy

# Env vars (set via wrangler secret put)
# TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
```

Full deployment guide in [`DEPLOY.md`](DEPLOY.md).

---

## Stitch Design

All 10 Stitch screen designs are mapped in [`.stitch/DESIGN.md`](.stitch/DESIGN.md) and documented in [`docs/redesign/REDESIGN-HANDOFF.md`](docs/redesign/REDESIGN-HANDOFF.md).

Screen screenshots are in [`.stitch/screens/`](.stitch/screens/).

---

## Repo

https://github.com/404kidwiz/taco-bell-ai-drive-through
