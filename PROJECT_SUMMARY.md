# 🍔 OrderFlow AI — Unified Restaurant Demo Platform

> **Last Updated:** 2026-04-01
> **Status:** Full-stack SaaS platform with dual demos, admin dashboard, payment processing
> **Company:** 404 Technologies (in collaboration with Cool Vibe Coding)

---

## What It Is

AI-powered restaurant ordering platform with two demo experiences:
1. **Taco Bell Drive-Through** — kiosk-style voice/text AI ordering
2. **OrderFlow Pizza** — phone call-in AI ordering simulation

Now a full SaaS product with auth, admin dashboard, menu management, Stripe payments, multi-language support, embeddable widget, session recording, and conversation analytics.

---

## Live URLs

| Surface | URL |
|---|---|
| **Frontend** | https://taco-bell-ai-drive-through.netlify.app |
| **Backend API** | https://orderflow-ai.up.railway.app |
| **Demo Phone** | +1 (770) 525-5393 |

**Repo:** https://github.com/404kidwiz/taco-bell-ai-drive-through

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, GSAP, Zustand |
| **Backend** | Hono (Node.js) + Turso (libSQL) + Redis (Upstash) + Drizzle ORM |
| **AI/LLM** | OpenAI GPT-4o-mini (chat), Groq Llama 3.3 70B (voice agent) |
| **Voice** | Twilio (phone calls), Web Speech API (browser STT/TTS) |
| **Payments** | Stripe Checkout + Customer Portal |
| **Auth** | NextAuth.js v5 (Google OAuth + Credentials) |
| **Real-time** | Server-Sent Events (SSE) |
| **SMS** | CallMeBot API + Twilio SMS |
| **Hosting** | Netlify/Cloudflare Pages (frontend), Railway (backend) |
| **Database** | Turso (SQLite edge) + Redis (rate limiting, sessions) |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js Frontend (:3000)        │
│  ┌─────┐ ┌──────────┐ ┌────────┐ ┌───────┐ │
│  │  /  │ │/taco-bell│ │ /pizza │ │/admin │ │
│  │Landing│ │Drive-Thru│ │ Phone  │ │Dashbd │ │
│  └─────┘ └──────────┘ └────────┘ └───────┘ │
│  ┌────────────────────────────────────────┐  │
│  │ /api/tacobell-chat  (streaming GPT)    │  │
│  │ /api/pizza-chat     (streaming GPT)    │  │
│  │ /api/auth/*         (NextAuth)         │  │
│  │ /api/checkout       (Stripe sessions)  │  │
│  │ /api/recordings     (session replay)   │  │
│  └────────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│           Hono Backend (:3001)               │
│  ┌──────────┐ ┌────────┐ ┌───────────────┐  │
│  │ /voice/* │ │/orders │ │/menu (CRUD)   │  │
│  │ (Twilio) │ │        │ │               │  │
│  └──────────┘ └────────┘ └───────────────┘  │
│  ┌──────────┐ ┌────────┐ ┌───────────────┐  │
│  │/analytics│ │/health │ │/conversations │  │
│  └──────────┘ └────────┘ └───────────────┘  │
│         Turso DB │ Redis │ Drizzle ORM       │
└─────────────────────────────────────────────┘
```

---

## Routes

### Public (Demo)
| Route | Description |
|---|---|
| `/` | Landing page — two demo cards (Taco Bell + Pizza) |
| `/taco-bell` | Drive-through kiosk — voice + chat AI ordering |
| `/pizza` | Phone ordering demo — call simulation + menu |
| `/menu` | Taco Bell menu browser |
| `/checkout` | Order review + Stripe payment |
| `/order-status` | Real-time order tracking with animated progress |
| `/widget-demo` | Embeddable widget documentation + preview |
| `/recordings` | Session recording dashboard |
| `/replay/[id]` | Recorded session playback |

### Auth
| Route | Description |
|---|---|
| `/login` | Sign in (Google OAuth + email/password) |
| `/register` | Create account |
| `/setup` | 5-step restaurant onboarding wizard |

### Admin (Protected)
| Route | Description |
|---|---|
| `/admin` | Dashboard home — today's stats |
| `/admin/orders` | Order management + CSV export |
| `/admin/menu` | Visual menu editor (CRUD) |
| `/admin/ai-settings` | AI personality + prompt config |
| `/admin/analytics` | Revenue, orders, performance charts |
| `/admin/ai-performance` | Conversation quality dashboard |
| `/admin/conversations` | Full conversation logs + transcripts |
| `/admin/settings` | Restaurant profile, hours, integrations |
| `/admin/leads` | Lead capture pipeline |

### Staff
| Route | Description |
|---|---|
| `/kitchen` | Kitchen display — per-station ticket queue |
| `/kds` | KDS command center — 4-column dashboard |
| `/analytics` | Order volume + revenue analytics |

---

## Features (as of April 2026)

### 🤖 AI & Conversation
- **Streaming LLM responses** — GPT-4o-mini with real-time token streaming, no waiting
- **Voice AI** — browser STT → LLM → TTS pipeline with early sentence-level speech
- **Bilingual** — English + Spanish detection, AI responds naturally in either language
- **Situational awareness** — AI tracks cart state, suggests pairings, upsells contextually
- **Custom personalities** — Friendly / Efficient / Upsell-heavy / Custom per restaurant
- **Response caching** — common queries answered instantly from in-memory cache

### 🧑‍💼 SaaS Platform
- **Authentication** — Google OAuth + email/password via NextAuth.js v5
- **Multi-tenant** — `restaurantId` isolation on all data, per-restaurant config
- **Restaurant Setup Wizard** — 5-step onboarding with AI menu extraction from URL
- **Menu Management API** — full CRUD, reorder, import, dynamic prompt building
- **Stripe Payments** — Checkout sessions, webhooks, Customer Portal
- **Lead Capture** — email capture on landing, mid-demo popups, post-order CTAs
- **Twilio Provisioning** — programmatic phone number assignment per restaurant

### 📊 Analytics & Insights
- **Conversation Quality Dashboard** — misunderstanding rate, upsell success, sentiment, latency
- **Session Recording** — full demo session capture with replay at 1x/2x/4x speed
- **Order Analytics** — revenue, volume, top items, avg ticket size, time-based trends
- **AI Performance** — response latency, completion rate, language breakdown

### 🎨 UX & Design
- **Sound Design** — 12 Web Audio API sounds (drive-through ding, phone ring, kitchen bell)
- **Dark/Light Mode** — system preference detection + manual toggle
- **Order Tracking UI** — animated 4-stage progress with ETA countdown
- **Page Transitions** — Framer Motion AnimatePresence
- **Embeddable Widget** — `<script>` tag, Intercom-style floating chat, self-contained
- **Uptime Badge** — live 🟢/🟡/🔴 status on landing page
- **PWA** — service worker, offline fallback, KDS priority caching
- **WCAG AA** — ARIA labels, keyboard nav, screen reader, contrast compliance
- **Branded Error Boundaries** — restaurant-themed error recovery UI

### 🏗️ Infrastructure
- **Merged monorepo** — frontend + backend in one repo
- **Rate limiting** — 100 req/min on API endpoints
- **Twilio signature validation** — webhook security
- **Security headers** — CSP, X-Frame-Options, CORS locked to known origins
- **Input sanitization** — LLM injection protection, path traversal prevention
- **Shared Redis client** — single instance, imported everywhere

---

## Database Schema (Turso)

### Core Tables
| Table | Purpose |
|---|---|
| `users` | Auth — id, email, name, role (owner/admin), restaurantId |
| `restaurants` | Tenant — id, name, slug, phone, config, AI personality, Stripe ID |
| `orders` | Orders — id, restaurantId, items (JSON), total, status, transcript |
| `menu_items` | Menu — id, restaurantId, name, description, price, category, enabled |
| `menu_categories` | Categories — id, restaurantId, name, sortOrder, enabled |
| `leads` | Pipeline — id, email, restaurantName, source, createdAt |

### Analytics Tables
| Table | Purpose |
|---|---|
| `conversation_analytics` | AI performance — duration, sentiment, upsell metrics, response times |
| `call_sessions` | Twilio calls — callSid, transcript, order, duration |

---

## Environment Variables

```bash
# AI
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...

# Auth
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Database
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Redis
REDIS_URL=redis://...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Backend
BACKEND_URL=http://localhost:3001
```

---

## Quick Start

```bash
# Install
pnpm install

# Run frontend + backend together
pnpm dev:all

# Or separately
pnpm dev           # Next.js on :3000
pnpm dev:backend   # Hono on :3001

# Build
pnpm build
```

---

## Git History (April 2026 sprint)

| Commit | Description |
|---|---|
| `3a6392f` | feat: multi-language (EN/ES) + embeddable widget |
| `1905347` | feat: pizza session recording + replay |
| `28d40a0` | feat: uptime/SLA status badge |
| `1d2eb31` | feat: real-time order tracking UI |
| `9701ead` | feat: Web Audio API sound design |
| `a0b2eee` | feat: merge OrderFlow backend + streaming responses |
| `fc0d483` | feat: Taco Bell chat interface |
| `a9f1ba2` | feat: LLM-powered voice AI hook |
| `ad0ecff` | feat: dual-demo landing page |
| `d2afb3d` | security: remove exposed API key |
| `4bd5d6a` | security: input sanitization |
| `5bf0bab` | security: .env gitignored |

---

## Revenue Model

| Tier | Price | Features |
|---|---|---|
| **Starter** | $497/mo | 1 location, AI voice agent, basic analytics |
| **Growth** | $997/mo | 3 locations, drive-through + phone, custom menu, priority support |
| **Enterprise** | $2,497/mo | Unlimited locations, white-label, custom integrations, dedicated AM |

---

## Design System — "Nocturnal Drive-Through"

### Color Palette
| Token | Hex | Role |
|---|---|---|
| Night Plum | `#151022` | Base canvas |
| Electric Grape | `#6D28FF` | Primary brand |
| Fire Orange | `#FF6A1F` | Urgency, conversion |
| Crunch Gold | `#FFC247` | Pricing, highlights |
| Baja Cyan | `#12D7F2` | AI/voice state |
| Pizza Red | `#E63946` | OrderFlow Pizza accent |

### Typography
- **Headlines:** Space Grotesk — illuminated roadside signage feel
- **Body:** Manrope — clean, low-light readable

---

*This document is the single source of truth for the OrderFlow AI platform. Update it whenever architecture, features, or deployment changes.*
