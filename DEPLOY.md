# Deploy: Taco Bell AI Drive-Through — Turso + Cloudflare Workers

This document explains how to deploy the backend (Cloudflare Worker + Turso) and connect it to the Cloudflare Pages frontend.

---

## Architecture

```
Frontend (Cloudflare Pages — static export)
    → API (Cloudflare Worker — edge)
    → Database (Turso — libSQL/SQLite)
    → SMS (CallMeBot free API)
```

---

## STEP 1 — Create Turso Database

### 1a. Install Turso CLI

```bash
# macOS
brew install turso

# Or via install script
curl -sSfL https://get.tur.so/install.sh | bash
```

### 1b. Sign up (free — no credit card)
Visit https://console.turso.tech and create an account.

### 1c. Create database

```bash
turso db create taco-bell-orders
```

### 1d. Get database URL

```bash
turso db show taco-bell-orders --url
# → libsql://taco-bell-orders-xxxxx.turso.io
```

### 1e. Get auth token

```bash
turso db tokens taco-bell-orders
# → Copy this — you won't see it again
```

### 1f. Create the `orders` table

```bash
turso db shell taco-bell-orders << 'EOF'
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number INTEGER NOT NULL,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  special_instructions TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
EOF
```

Or use Drizzle migrations (see STEP 2 below).

---

## STEP 2 — Configure Secrets for the Worker

### 2a. Set secrets in Cloudflare Workers

```bash
npx wrangler secret put TURSO_DATABASE_URL
# → paste: libsql://taco-bell-orders-xxxxx.turso.io

npx wrangler secret put TURSO_AUTH_TOKEN
# → paste: your auth token from STEP 1e
```

### 2b. (Optional) Run Drizzle migrations

```bash
# Update drizzle.config.ts with your real URL first, then:
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## STEP 3 — Deploy the Cloudflare Worker

```bash
# From project root:
npx wrangler deploy
# → Returns: https://taco-bell-api.<your-subdomain>.workers.dev
```

Copy the Worker URL — you'll need it for STEP 4.

---

## STEP 4 — Connect Worker to Cloudflare Pages

### 4a. In Cloudflare Dashboard:

1. Go to **Pages** → your project → **Settings** → **Functions**
2. Under **Worker**, click **Bind Worker**
3. Select your `taco-bell-api` Worker
4. This makes the Worker available at the same origin as your Pages site

### 4b. Update environment variable for frontend

In Cloudflare Pages dashboard → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL = https://taco-bell-api.<your-subdomain>.workers.dev
```

### 4c. For local development

Create `.env.local` in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

And in `.env.local` (for wrangler dev):

```env
TURSO_DATABASE_URL=libsql://taco-bell-orders-xxxxx.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

---

## STEP 5 — Run Locally

### Frontend (Next.js dev)
```bash
pnpm dev
# → http://localhost:3000
```

### Backend Worker (wrangler dev)
```bash
npx wrangler dev --remote
# → http://localhost:8787
```

The frontend calls `/api/orders` etc. When deployed, the Cloudflare Pages Function proxies to the Worker. For local dev, set `NEXT_PUBLIC_API_URL=http://localhost:8787` in `.env.local`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders` | List active orders (pending + in-progress) |
| `GET` | `/api/orders/history` | List completed orders |
| `PATCH` | `/api/orders/{id}` | Update order status |
| `GET` | `/api/orders/stream` | SSE real-time stream (kitchen display) |
| `GET` | `/api/analytics` | Order stats (orders, revenue, top items) |

### Example: Create Order

```bash
curl -X POST https://taco-bell-api.<subdomain>.workers.dev/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "crunchy-taco", "name": "Crunchy Taco", "price": 1.99, "quantity": 2}],
    "total": 4.30,
    "specialInstructions": "Extra cheese",
    "customerPhone": "+15551234567"
  }'
```

---

## SMS Setup (CallMeBot — Free)

1. Register your phone number once: https://api.callmebot.com/sms.php?phone=YOURPHONE&text=hello&user=anonymous
2. After registration, SMS works automatically when a phone number is provided with an order.

> **Note:** CallMeBot is free but requires one-time registration. If it fails, orders still complete — SMS is optional.

---

## Troubleshooting

### "CORS error" in dev
The Worker includes CORS headers for all origins. Make sure `NEXT_PUBLIC_API_URL` points to `http://localhost:8787` during local dev.

### "Database not found"
Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set as Worker secrets: `npx wrangler secret list`

### SSE not working
SSE requires the Worker to be bound to Cloudflare Pages Functions (STEP 4a). Without this, the Worker runs on a separate domain and CORS blocks the stream.

### Build fails
Make sure `workers/` is excluded from `tsconfig.json`:
```json
"exclude": ["node_modules", "workers"]
```
