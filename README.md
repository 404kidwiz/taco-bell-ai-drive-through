# 🌮 Taco Bell AI Drive-Through

**Live:** https://2ee803ac.taco-bell-ai-drive-through.pages.dev

AI-powered voice ordering system for a Taco Bell drive-through. Customers place orders by speaking naturally to an AI — orders appear instantly on the kitchen display, SMS confirmations fire automatically.

Now unified with the **OrderFlow AI backend** (Hono + Twilio voice webhooks, order management, analytics).

---

## Screens

| Route | Screen | Description |
|---|---|---|
| `/` | Customer Landing | Voice AI hero, speech bubble, rewards card |
| `/pizza` | Pizza Phone Demo | AI phone ordering simulation for OrderFlow Pizza |
| `/menu` | Menu + Cart | Category tabs, item grid, add-ons, cart sidebar |
| `/checkout` | Order Review | 3-step tracker, AI waveform, "Confirm & Fire" |
| `/order-status` | Pickup Status | 4-step progress rail, ETA, lane info |
| `/kitchen` | Kitchen Display | Per-station ticket queue, bump routing |
| `/kds` | KDS Command Center | 4-column dashboard — NEW/IN KITCHEN/BAGGING/READY |
| `/analytics` | Analytics | Order volume, revenue, top items |

---

## Architecture

```
taco-bell-ai-drive-through/
├── app/                    # Next.js frontend (port 3000)
│   ├── api/
│   │   ├── pizza-chat/     # Streaming OpenAI chat (Pizza)
│   │   └── tacobell-chat/  # Streaming OpenAI chat (Taco Bell)
│   ├── lib/
│   │   ├── stream.ts       # Client streaming utilities
│   │   └── response-cache.ts # In-memory query cache
│   ├── hooks/
│   │   └── useVoiceAI.ts   # Voice AI with streaming + early TTS
│   └── ...
├── backend/                # Hono backend (port 3001)
│   ├── src/
│   │   ├── routes/         # voice, orders, analytics, restaurant, webhooks
│   │   ├── services/       # voice-agent, llm-service, order-service
│   │   ├── middleware/      # rate-limit, security, twilio-auth
│   │   ├── db/             # Drizzle schema + client
│   │   └── lib/            # Redis client
│   ├── drizzle.config.ts
│   ├── tsconfig.json
│   └── package.json
├── workers/                # Cloudflare Workers (edge API)
└── package.json            # Root — runs both frontend + backend
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| Chat AI | OpenAI GPT-4o-mini (streaming responses) |
| Backend | Hono (Node.js), Twilio Voice, Groq LLM |
| Database | Turso/Neon + Drizzle ORM |
| Cache/Queue | Redis (rate limiting, call sessions) |
| Real-time | Server-Sent Events (SSE) |
| SMS | CallMeBot (free, no account) |
| Design | Nocturnal Drive-Through — Space Grotesk + Manrope |
| Hosting | Cloudflare Pages + Workers / Vercel |

---

## Latency Optimizations

- **Streaming responses** — Both chat APIs stream tokens as they arrive, no waiting for full completion
- **Sentence-level TTS** — Voice mode starts speaking as soon as the first sentence completes
- **Natural typing indicator** — 250ms pause before streaming starts
- **In-memory response cache** — Common queries ("what's popular?") return instantly
- **Keep-alive connections** — `keepalive: true` on fetch for connection reuse

---

## Getting Started

```bash
# Install frontend deps
pnpm install

# Install backend deps
cd backend && pnpm install && cd ..

# Dev (frontend only)
pnpm dev

# Dev (frontend + backend)
pnpm dev:all

# Build
pnpm build
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
OPENAI_API_KEY=sk-...          # Required for chat AI
DATABASE_URL=postgresql://...   # Required for backend
REDIS_URL=redis://localhost:6379 # Required for backend
```

---

## Deployment

```bash
# Frontend → Cloudflare Pages
npx wrangler pages deploy dist --project-name=taco-bell-ai-drive-through

# Backend → any Node.js host
cd backend && pnpm build && pnpm start
```

---

## Design System — Nocturnal Drive-Through

| Color | Hex | Use |
|---|---|---|
| Night Plum | `#151022` | Base canvas |
| Electric Grape | `#6D28FF` | Brand / CTAs |
| Fire Orange | `#FF6A1F` | Urgency |
| Crunch Gold | `#FFC247` | Pricing / rewards |
| Baja Cyan | `#12D7F2` | AI / voice state |

---

## Repo

https://github.com/404kidwiz/taco-bell-ai-drive-through
