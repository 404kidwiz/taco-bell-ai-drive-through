# 🌮 Taco Bell AI Drive-Through — Project Summary

> **Last Updated:** 2026-03-29
> **Status:** Live — Stitch Nocturnal Drive-Through design implemented

---

## Live Deployment

| Surface | URL |
|---|---|
| **Customer Kiosk** | https://2ee803ac.taco-bell-ai-drive-through.pages.dev |
| **Kitchen Display** | `/kitchen` (on same domain) |
| **KDS Command Center** | `/kds` (on same domain) |
| **Analytics** | `/analytics` (on same domain) |
| **API Worker** | https://taco-bell-api.404kidwiz.workers.dev |

**Repo:** https://github.com/404kidwiz/taco-bell-ai-drive-through

---

## What It Is

AI-powered voice ordering system for a Taco Bell drive-through. Customers place orders by speaking naturally to an AI agent — orders appear instantly on the kitchen display, SMS confirmations fire automatically. Built with a cinematic "Nocturnal Drive-Through" dark-neon aesthetic.

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 15 (static export), TypeScript, Tailwind CSS, Framer Motion, Zustand |
| **Backend** | Cloudflare Workers (edge) + Turso (libSQL/SQLite) + Drizzle ORM |
| **Real-time** | Server-Sent Events (SSE) via Cloudflare Worker |
| **SMS** | CallMeBot free API (no account needed) |
| **Design** | Stitch "Nocturnal Drive-Through" — Space Grotesk + Manrope |
| **Hosting** | Cloudflare Pages (frontend) + Cloudflare Workers (API) |
| **Database** | Turso — 9GB free tier |

---

## Architecture

```
Customer (browser / kiosk)
    │
    ├──→ Next.js 15 (Cloudflare Pages — static)
    │         ├── Voice AI (Web Speech API — browser-native STT)
    │         ├── Zustand cart state
    │         └── SSE connection for live order updates
    │
    └──→ API (Cloudflare Worker — edge)
              ├── Turso (libSQL/SQLite) — orders table
              ├── SSE broadcast to all connected kitchen screens
              └── CallMeBot SMS on order confirmation

Kitchen (tablet / display)
    └──→ SSE stream → real-time ticket queue
```

---

## Screens / Routes

| Route | Screen | Description |
|---|---|---|
| `/` | Customer Landing | Split-screen voice hero (desktop) / full-screen voice (mobile). Mic button, speech bubble, rewards card |
| `/menu` | Menu | Category tabs, ULTIMATE CRAVINGS BOX banner, 2-col item grid, cart sidebar, add-ons |
| `/checkout` | Order Review | 3-step tracker, order summary, special instructions, AI voice waveform, "Confirm & Fire" |
| `/order-status` | Pickup Status | 4-step progress rail (Received → In Kitchen → Bagging → Ready), ETA, lane info |
| `/kitchen` | Kitchen Display | Per-station ticket queue, bump routing, timer color-shift (green→yellow→red) |
| `/kds` | KDS Command Center | Full dashboard — 4-column (NEW/IN KITCHEN/BAGGING/READY), sidebar nav, urgent alerts |
| `/analytics` | Analytics | Order volume, revenue, avg order value, top items |

---

## Features

- **Voice AI ordering** — Web Speech API (browser-native STT), fuzzy menu matching, TTS responses
- **Real-time kitchen sync** — SSE via Cloudflare Worker, orders appear on kitchen display in <2s
- **SMS confirmations** — CallMeBot fires on every order confirmation
- **Rewards system** — Fire Points, tier badges, points earned on every order
- **Order customization** — Add/remove/substitute options on menu items
- **Analytics dashboard** — Daily/weekly order volume and revenue tracking
- **KDS command center** — Multi-station routing, bump workflow, prep queue

---

## 🎨 Design System — "Nocturnal Drive-Through"

**Stitch Project ID:** `6883950520556782876`
**Design Direction:** `The Nocturnal Drive-Through`

### Color Palette

| Token | Hex | Role |
|---|---|---|
| Night Plum | `#151022` | Base canvas — entire app shell |
| Electric Grape | `#6D28FF` | Brand anchor, hero emphasis, primary interactions |
| Lavender Signal | `#CEBDFF` | Text-on-dark accent, neon glow ramps |
| Fire Orange | `#FF6A1F` | Appetite trigger, urgency, conversion heat |
| Crunch Gold | `#FFC247` | Pricing, add-to-cart, warm highlights, rewards |
| Baja Cyan | `#12D7F2` | AI/voice state, signal feedback, informational status |
| Surface Low | `#1E192B` | Section groupings, large content bands |
| Surface Mid | `#221D2F` | Default elevated container surface |
| Surface High | `#2C273A` | Interactive cards, active groupings |
| Surface Highest | `#373245` | Glass panels, floating order summaries, KDS tickets |
| Readable Body | `#CBC3DA` | Default body text on dark surfaces |
| Outline | `#948DA3` | Low-contrast outline / ghost-edge treatment |

### Typography
- **Display / Headlines:** `Space Grotesk` — feels like illuminated roadside signage
- **Body / Labels:** `Manrope` — clean, neutral, low-light readable

### Motion
- Customer flow: cinematic reveals, voice ring animations, speech bubble pop
- Kitchen flow: restrained — ticket bumps, timer color shifts, state changes
- All animations use `transform` + `opacity` only (no layout-triggering)

---

## 🖥️ Stitch Screen Inventory (10 screens)

### Desktop (5 screens)

| Label | Stitch Title | Screen ID | Target Route |
|---|---|---|---|
| `D1` | Taco Bell AI Drive-Through Arrival | `7c05b78988154c769ce7a878e9a247ef` | `/` (landing) |
| `D2` | Taco Bell AI Drive-Through Menu & Cart | `2a6f44d7433d4863a765303434728cb6` | `/menu` |
| `D3` | Order Review & Confirmation | `b9fa20f15695437a9d57aa91daea29ba` | `/checkout` |
| `D4` | Order Sent & Pickup Status | `2923285d0be14ed39e2a67ff9daa9f49` | `/order-status` |
| `D5` | Taco Bell KDS Command Center | `f38de9aeef0748fb90cf740f58f2bcd5` | `/kds` |

### Mobile (4 screens)

| Label | Stitch Title | Screen ID | Target Route |
|---|---|---|---|
| `M1` | Taco Bell AI Arrival (Mobile) | `25ccf3f5697a406eab1aa7ed2adc181b` | `/` (responsive) |
| `M2` | Taco Bell AI Mobile Menu & Cart | `ae9259d5b0da46f598aa5c4218d7b65e` | `/menu` (responsive) |
| `M3` | Order Review & Confirmation (Mobile) | `4e9119ec72da40408249a056e52b0fea` | `/checkout` (responsive) |
| `M4` | Mobile Order Status & Pickup | `6400f1e250b746058091dc353ea43681` | `/order-status` (responsive) |

### Tablet (1 screen)

| Label | Stitch Title | Screen ID | Target Route |
|---|---|---|---|
| `T1` | Taco Bell KDS Tablet Command Center | `7cbe99f202064c81aa9c2fd1c28b2713` | `/kitchen` (tablet) |

---

## 📁 Asset Locations

### Stitch Design Package
```
.stitch/
├── DESIGN.md                    # Full design system spec (Nocturnal Drive-Through)
└── screens/                     # 10 PNG screenshots from Stitch MCP
    ├── 25ccf3f5697a406eab1aa7ed2adc181b.png  # M1: Mobile Arrival
    ├── 2923285d0be14ed39e2a67ff9daa9f49.png  # D4: Pickup Status
    ├── 2a6f44d7433d4863a765303434728cb6.png  # D2: Menu & Cart
    ├── 4e9119ec72da40408249a056e52b0fea.png  # M3: Mobile Order Review
    ├── 6400f1e250b746058091dc353ea43681.png  # M4: Mobile Pickup Status
    ├── 7c05b78988154c769ce7a878e9a247ef.png  # D1: Desktop Arrival
    ├── 7cbe99f202064c81aa9c2fd1c28b2713.png  # T1: Tablet KDS
    ├── ae9259d5b0da46f598aa5c4218d7b65e.png  # M2: Mobile Menu
    ├── b9fa20f15695437a9d57aa91daea29ba.png  # D3: Order Review
    └── f38de9aeef0748fb90cf740f58f2bcd5.png  # D5: KDS Command Center
```

### Design Handoff Docs
```
docs/redesign/
└── REDESIGN-HANDOFF.md          # Full screen mapping + implementation notes
```

### Downloaded Stitch Assets (source)
```
/Users/404kidwiz/Downloads/stitch_taco_bell_drive_through_redesign/
├── taco_bell_nocturnal_neon/    # Neon design system reference
├── taco_bell_ai_drive_through_arrival/
├── taco_bell_ai_drive_through_menu_cart/
├── taco_bell_ai_arrival_mobile/
├── taco_bell_ai_mobile_menu_cart/
├── order_review_confirmation/
├── order_review_confirmation_mobile/
├── order_sent_pickup_status/
├── mobile_order_status_pickup/
├── taco_bell_kds_command_center/
└── taco_bell_kds_tablet_command_center/
```

### Cloudflare Worker API
```
workers/
├── api.ts       # Worker entrypoint — handles all routes
└── schema.ts    # Drizzle ORM schema
```

### Static Export Output
```
dist/
├── index.html        # /
├── menu.html         # /menu
├── checkout.html      # /checkout
├── order-status.html  # /order-status
├── kitchen.html       # /kitchen
├── kds.html           # /kds
└── analytics.html     # /analytics
```

---

## 🚀 Deployment

### Frontend (Cloudflare Pages)
```bash
cd /Users/404kidwiz/projects/taco-bell-ai-drive-through

# Build static export
pnpm build

# Deploy
npx wrangler pages deploy dist --project-name=taco-bell-ai-drive-through
```

### API Worker (Cloudflare Workers)
```bash
# Deploy/update the edge API
cd workers
npx wrangler deploy

# Push schema changes to Turso
TURSO_AUTH_TOKEN=x TURSO_DATABASE_URL=x npx drizzle-kit push
```

### Environment Variables (Cloudflare Workers — set via `wrangler secret put`)
```
TURSO_DATABASE_URL=libsql://taco-bell-orders-404kidwiz.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=<from: turso db tokens create taco-bell-orders>
```

### Frontend env var (`.env.local` for local dev)
```
NEXT_PUBLIC_API_URL=https://taco-bell-api.404kidwiz.workers.dev
```

---

## Database Schema (Turso)

**Table:** `orders`

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto-increment PK |
| order_number | TEXT | Display number (e.g., "101") |
| items | TEXT (JSON) | Array of order items |
| total | REAL | Total price |
| status | TEXT | pending/confirmed/preparing/bagging/ready/completed |
| customer_phone | TEXT | For SMS confirmation |
| special_instructions | TEXT | Any special requests |
| station | TEXT | grill/prep/double/expo |
| created_at | INTEGER | Unix timestamp |

---

## Git History (recent)

| Commit | Description |
|---|---|
| `37f5f62` | feat: implement exact Stitch designs — all screens, images, components |
| `dcc8dfb` | feat: implement Stitch Nocturnal Drive-Through exact design — all screens |
| `3aef723` | feat: implement Stitch Nocturnal Drive-Through design system |
| `3e7ebfa` | feat: Turso + Cloudflare Workers backend — real orders, SSE kitchen sync, SMS, analytics |
| `521b6f7` | feat: voice AI cart, customization modal, kitchen BroadcastChannel sync, rewards system, TTS guard |

---

## Non-Negotiables

- All animations use `transform` + `opacity` only (no layout-triggering)
- KDS timer color-shift: green → yellow → red as order ages
- SSE sync: orders appear on kitchen display in <2s
- SMS fires on every confirmed order (no silent failures)
- Static export must work without a running API (graceful degradation)

---

*This document is the single source of truth for the Taco Bell AI Drive-Through. Update it whenever architecture, tech stack, or deployment changes.*
