# 🌮 Taco Bell AI Drive-Through — Project Summary

> **Last Updated:** 2026-03-31
> **Status:** Production-ready — All critical bugs fixed, CI/CD configured, live deployment verified

---

## Live Deployment

| Surface | URL |
|---|---|
| **Customer Kiosk** | https://c29792b2.taco-bell-ai-drive-through.pages.dev |
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

## 🛠️ Implementation Backlog

> All items below have been analyzed against the current codebase. Each task includes exact file targets, what to change, and acceptance criteria. Items are ordered by priority — **Critical → UX Gaps → Polish → Architecture**.

---

### 🔴 CRITICAL — Broken Core Flow

---

#### TASK-01 · Wire "Confirm & Fire" → Cloudflare Worker API

**Priority:** Critical
**Files to change:**
- `app/checkout/page.tsx`
- `app/hooks/useOrderTracking.ts`

**Problem:**
The "Confirm & Fire" button in both `DesktopCheckout` and `MobileCheckout` is a `<Link href="/order-status">`. It navigates directly without ever calling the Worker API. No order is created in Turso. No SMS fires. Kitchen display never updates.

**What to implement:**

1. In `app/hooks/useOrderTracking.ts`, change line:
   ```ts
   const API_BASE = "/api";
   ```
   to:
   ```ts
   const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://taco-bell-api.404kidwiz.workers.dev";
   ```

2. In `app/checkout/page.tsx`, convert the "Confirm & Fire" `<Link>` into a `<button>` in both `DesktopCheckout` and `MobileCheckout`. Add a loading/submitting state. On click:
   - Call `useOrderTracking().createOrder({ items: cart, total, specialInstructions, customerPhone: "" })`
   - On success: call `useRewards().addPoints(earnedPoints)`, call `useCartStore().clearCart()`, then `router.push("/order-status?order=" + order.id)`
   - On error: show an inline error message (do not navigate)
   - Show a spinner/loading state on the button while submitting

3. Import `useRouter` from `next/navigation` in checkout page.

4. The button should be disabled if `cart.length === 0`.

**Acceptance criteria:**
- Clicking "Confirm & Fire" POSTs to the Worker, returns an order object
- Cart is cleared after successful submission
- User is routed to `/order-status?order=<id>`
- Rewards points increment after a successful order
- If API is down, an error message shows inline (no broken navigation)

---

#### TASK-02 · Fix API Base URL Across All Pages

**Priority:** Critical
**Files to change:**
- `app/hooks/useOrderTracking.ts` (see TASK-01)
- `app/analytics/page.tsx`
- `app/kitchen/page.tsx`

**Problem:**
`app/analytics/page.tsx` fetches from `/api/analytics` and `/api/orders/history`. `app/kitchen/page.tsx` fetches from `/api/orders`. These are relative paths that work in a Node.js server environment but this project uses `output: 'export'` (static). On Cloudflare Pages there is no `/api` route — all requests 404.

**What to implement:**

1. Create a shared constant at `app/lib/api.ts`:
   ```ts
   export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://taco-bell-api.404kidwiz.workers.dev";
   ```

2. In `app/analytics/page.tsx`, replace all `fetch('/api/...')` calls with `fetch(\`${API_BASE}/...\`)`.

3. In `app/kitchen/page.tsx`, do the same for any `fetch('/api/...')` calls.

4. In `app/hooks/useOrderTracking.ts`, import from `app/lib/api.ts` instead of the local constant.

**Acceptance criteria:**
- Analytics page loads real data from Turso (or gracefully shows zeros if no orders exist)
- Kitchen page fetches real orders from the Worker
- No 404s in the network tab for API calls

---

#### TASK-03 · Wire KDS Page to Live SSE Stream

**Priority:** Critical
**Files to change:**
- `app/kds/page.tsx`

**Problem:**
`app/kds/page.tsx` uses `MOCK_ORDERS` — a hardcoded static object defined at the top of the file. There is no `useEffect` that connects to the SSE stream or polls the API. The KDS shows the same fake orders regardless of what customers actually order.

**What to implement:**

1. Remove `MOCK_ORDERS` constant entirely.

2. Add state: `const [orders, setOrders] = useState<{ new: Order[]; kitchen: Order[]; bagging: Order[]; ready: Order[] }>({ new: [], kitchen: [], bagging: [], ready: [] })`.

3. On mount, fetch current orders from the Worker:
   ```ts
   const res = await fetch(`${API_BASE}/orders`);
   const data = await res.json();
   // partition data.orders by status into the 4 buckets
   ```
   Map status values: `pending` → `new`, `in-progress` → `kitchen`, `bagging` → `bagging`, `ready/completed` → `ready`.

4. Open an SSE connection to `${API_BASE}/events` (the Worker's SSE endpoint). On each `message` event, parse the JSON and update the relevant order bucket. The event payload shape from the Worker is `{ type: "order_created" | "order_updated", data: OrderRow }`.

5. On unmount, close the SSE connection (`eventSource.close()`).

6. The "Bump" button on each card should call `PATCH ${API_BASE}/orders/:id` with the next status, and update local state optimistically.

7. Wrap the SSE connection in a reconnect loop: if the connection drops, retry after 3 seconds.

**Acceptance criteria:**
- KDS shows orders submitted from the checkout page within 2 seconds
- Bumping an order moves it to the next column
- Page gracefully handles SSE disconnect with auto-reconnect

---

#### TASK-04 · Wire Order Status Page to Real Order + SSE

**Priority:** Critical
**Files to change:**
- `app/order-status/page.tsx`

**Problem:**
Both `DesktopOrderStatus` and `MobileOrderStatus` display hardcoded values: order number `#DRV-7742`, ETA `4-6 MINS`, lane `WINDOW 2`, items `Crunchwrap Supreme` + `Large Baja Blast`. Nothing is read from the actual confirmed order.

**What to implement:**

1. Read `?order=<id>` from the URL using `useSearchParams()` from `next/navigation`.

2. On mount, fetch the order: `GET ${API_BASE}/orders/:id`. Store it in state.

3. Replace all hardcoded values with data from the fetched order:
   - Order number: `order.orderNumber`
   - Items list: render `order.items` instead of the hardcoded array
   - Total: computed from `order.items`

4. Open an SSE connection to `${API_BASE}/events`. When an `order_updated` event arrives matching this order's ID, update the local `order.status` state. This drives the progress rail step.

5. Map `order.status` to step number: `pending` → 1, `in-progress` → 2, `bagging` → 3, `ready/completed` → 4.

6. ETA: start a countdown timer from 6 minutes (360 seconds) when the page mounts. Format as `X-Y MINS`. This can be static for now — real ETA would require kitchen data.

7. If no `?order` param is present (user navigated directly), show a "No active order" state with a link back to `/menu`.

**Acceptance criteria:**
- After "Confirm & Fire", order status page shows the correct order number, items, and total
- Progress rail advances in real-time as kitchen staff bump the order
- Page handles direct navigation gracefully

---

### 🟡 UX GAPS — Visible to Users

---

#### TASK-05 · Add Customization Modal to Menu Items

**Priority:** High
**Files to change:**
- `app/menu/page.tsx`

**Problem:**
`app/hooks/useCustomization.ts` is fully implemented with per-item customization options (extra cheese, no lettuce, substitutions, etc.) but is never used anywhere. `MenuItemCard` has no "Customize" affordance.

**What to implement:**

1. In `app/menu/page.tsx`, import and call `useCustomization()` inside both `DesktopMenu` and `MobileMenu`.

2. Add a "Customize" button to `MenuItemCard` (below the price, next to the `+` add button). Only render it if `getCustomizations(item.id).length > 0`.

3. Build a modal/sheet component inline in `menu/page.tsx`. It should:
   - Show the item name and base price
   - List all customization options from `getCustomizations(item.id)`, each as a toggleable chip
   - Show a running "modifier total" (e.g., `+$1.50`)
   - Have a "Add to Order" CTA that calls `addItem` with the modified price (base + customization sum)
   - Have a close/dismiss button

4. Trigger the modal via `openCustomization(item.id, item.price)`. Check `activeCustomization === item.id` to show/hide.

5. When adding a customized item, pass the customization names as the `options` array so they render as chips in `OrderItemRow` on the checkout page. Since `CartItem` doesn't have an `options` field, either extend the type in `app/types.ts` or store customization strings in a `description` field.

**Design spec:**
Modal background: `bg-surface-container-low`, rounded-xl, with a backdrop blur overlay. Customization chips: `bg-surface-container rounded-full px-3 py-1.5`, active state adds `bg-primary-container` and a checkmark icon. Matches the existing Nocturnal design system.

**Acceptance criteria:**
- Tapping "Customize" opens the modal for items that have customization options
- Selecting options adjusts the displayed price
- "Add to Order" closes the modal and adds the correctly-priced item to cart

---

#### TASK-06 · Mobile Cart Sticky Footer

**Priority:** High
**Files to change:**
- `app/menu/page.tsx` (`MobileMenu` component)

**Problem:**
On mobile, users can add items to the cart but there is no visible indication of cart state while browsing. The only way to get to checkout is to tap the nav bar. There is no sticky cart summary bar.

**What to implement:**

1. In `MobileMenu`, add a sticky bottom bar that only renders when `cart.length > 0`. It should sit above `MobileBottomBar` (so give it `bottom-[88px]` approximately, above the voice bar).

2. Bar content:
   - Left: cart icon + item count badge
   - Center: `{cartCount} ITEM{cartCount !== 1 ? 'S' : ''} · ${cartTotal.toFixed(2)}`
   - Right: `<Link href="/checkout">` styled as a pill CTA — "Review Order →"

3. Use `framer-motion` `AnimatePresence` + slide-up animation (`y: 80 → y: 0`) so it smoothly appears when the first item is added.

4. Style: `bg-secondary-container`, full-width, `rounded-t-2xl`, `shadow-[0_-8px_20px_rgba(244,98,22,0.3)]`.

**Acceptance criteria:**
- Bar is invisible when cart is empty
- Animates in from the bottom when first item is added
- Shows correct item count and running total
- Links to `/checkout`

---

#### TASK-07 · "Added to Cart" Toast Notification

**Priority:** Medium
**Files to change:**
- `app/menu/page.tsx`
- `app/providers.tsx`

**Problem:**
Tapping "Add to Order" on a menu item gives no visual feedback beyond a +1 to the nav badge. Users don't know if their tap registered.

**What to implement:**

1. In `app/providers.tsx`, add a simple toast state provider (no external library needed):
   ```tsx
   const ToastContext = createContext<(msg: string) => void>(() => {});
   export const useToast = () => useContext(ToastContext);
   ```
   Render a fixed toast element at `bottom-28 right-4` with `AnimatePresence`. Auto-dismiss after 1.8 seconds.

2. In `app/menu/page.tsx`, call `useToast()` and invoke it inside the `onAdd` handler of `MenuItemCard`:
   ```ts
   onAdd={() => {
     addItem({ ... });
     showToast(`${item.name} added`);
   }}
   ```

3. Toast style: `bg-surface-container-highest`, `text-white`, `rounded-full`, `px-4 py-2`, small checkmark icon prefix. Keep it minimal.

4. Do the same for `AddOnChip` add handlers.

**Acceptance criteria:**
- Tapping "Add to Order" shows a brief toast with the item name
- Toast auto-dismisses after ~2 seconds
- Multiple rapid adds queue and show in sequence (or latest replaces previous — either is fine)

---

#### TASK-08 · Empty Cart Guard on Checkout

**Priority:** Medium
**Files to change:**
- `app/checkout/page.tsx`

**Problem:**
Navigating directly to `/checkout` with an empty cart shows the empty state UI but has no redirect. Users can still click "Confirm & Fire" (which after TASK-01 would be disabled if cart is empty, but the page itself is confusing).

**What to implement:**

1. At the top of both `DesktopCheckout` and `MobileCheckout`, add:
   ```ts
   const router = useRouter();
   useEffect(() => {
     if (cart.length === 0) router.replace("/menu");
   }, [cart]);
   ```
   This redirects to `/menu` if the cart is empty on mount.

2. Keep the `cart.length === 0` empty-state UI in the render as a fallback for the brief flash before redirect.

**Acceptance criteria:**
- `/checkout` with an empty cart immediately redirects to `/menu`
- No redirect if cart has items

---

#### TASK-09 · Voice AI Browser Compatibility Warning

**Priority:** Medium
**Files to change:**
- `app/hooks/useVoiceAI.ts`
- `app/page.tsx`

**Problem:**
Web Speech API (`SpeechRecognition`) only works in Chromium browsers (Chrome, Edge, Arc). It does not work in Firefox or Safari (without flags). Currently if `SpeechRecognition` is undefined, the user gets a generic microphone error or nothing at all.

**What to implement:**

1. In `useVoiceAI.ts`, inside the `connect` function, before calling `recognitionRef.current.start()`, check:
   ```ts
   const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
   if (!SpeechRecognition) {
     setError("Voice ordering requires Chrome or Edge. Please switch browsers.");
     return;
   }
   ```

2. In `app/page.tsx`, when `error` is set and contains "Chrome or Edge", render the speech bubble with a link: `"Voice ordering works best in Chrome. <a href='https://www.google.com/chrome'>Download Chrome →</a>"`. Style the link in `text-baja-cyan underline`.

3. Also guard the mic button: if `error` includes browser incompatibility text, disable the button and change its icon to `mic_off`.

**Acceptance criteria:**
- Firefox/Safari users see a clear message explaining the browser requirement
- Mic button is visually disabled for unsupported browsers
- Chrome/Edge users are unaffected

---

### 🟢 POLISH — Design & Micro-interactions

---

#### TASK-10 · Real Voice Waveform Animation

**Priority:** Medium
**Files to change:**
- `app/globals.css`
- `app/page.tsx`

**Problem:**
The voice waveform bars in `VoicePanel` and `MobileVoiceUI` use `animate-pulse` with a stagger delay. All bars pulse with the same height — they don't look like a real audio visualizer.

**What to implement:**

1. `app/globals.css` already defines `@keyframes voice-bar` with `scaleY(0.25) → scaleY(1)`. Add a Tailwind utility class for it:
   ```css
   .animate-voice-bar {
     animation: voice-bar 0.8s ease-in-out infinite alternate;
     transform-origin: bottom;
   }
   ```

2. In `VoicePanel` and `MobileVoiceUI`, replace the static height array `[4, 8, 12, 9, 14, 11, 6, 10]` with a rendered bar set that uses `animate-voice-bar` and varies `animation-duration` per bar (between `0.5s` and `1.2s`) and `animation-delay` per bar. Set a fixed `height` of `40px` on each bar and let `scaleY` drive the visual height.

3. When `isSpeaking` is true (AI is speaking TTS), change bar color from `bg-baja-cyan` to `bg-secondary-container` (orange) to visually differentiate "AI speaking" from "user listening".

**Acceptance criteria:**
- Voice bars animate with varied timing, creating a natural audio-visualizer feel
- Bar color changes based on whether the AI is speaking vs. listening
- Animation respects `prefers-reduced-motion` (already handled in globals.css)

---

#### TASK-11 · Category Color-Coded Icons on Menu Cards

**Priority:** Low
**Files to change:**
- `app/menu/page.tsx` (`MenuItemCard` component)

**Problem:**
Every `MenuItemCard` shows the same `fastfood` Material Symbols icon in the placeholder image area. There is no visual differentiation between a taco card and a drink card.

**What to implement:**

1. Create a mapping of category → icon + color inside `MenuItemCard`:
   ```ts
   const CATEGORY_STYLE: Record<string, { icon: string; color: string }> = {
     tacos:    { icon: "lunch_dining",    color: "text-secondary-container" },
     burritos: { icon: "kebab_dining",    color: "text-tertiary" },
     nachos:   { icon: "egg_alt",         color: "text-primary" },
     drinks:   { icon: "local_drink",     color: "text-baja-cyan" },
     combos:   { icon: "layers",          color: "text-secondary" },
     cravings: { icon: "local_fire_department", color: "text-error" },
     featured: { icon: "stars",           color: "text-tertiary" },
   };
   ```

2. Pass `category` as a prop to `MenuItemCard`. Use the mapped icon and color in the placeholder div instead of the hardcoded `fastfood` icon.

3. Also add a subtle radial gradient background tint matching the category color (`opacity-10`) behind the icon.

**Acceptance criteria:**
- Each category has a distinct icon and color
- Drinks are cyan, tacos are orange, nachos are purple, etc.
- Visual change only — no functional impact

---

#### TASK-12 · Dynamic Checkout Ticket Number

**Priority:** Low
**Files to change:**
- `app/checkout/page.tsx`

**Problem:**
Both `DesktopCheckout` and `MobileCheckout` display `Ticket #4029` hardcoded.

**What to implement:**

1. Generate a stable ticket number using `useMemo`:
   ```ts
   const ticketNumber = useMemo(() => Math.floor(1000 + Math.random() * 9000), []);
   ```
   This generates a random 4-digit number that stays stable for the session.

2. After TASK-01 is done, replace this with the actual `order.orderNumber` returned from the API.

3. Replace both instances of `Ticket #4029` with `Ticket #${ticketNumber}`.

**Acceptance criteria:**
- Each checkout session shows a different ticket number
- Number is stable (doesn't re-randomize on re-render)

---

### 🔵 ARCHITECTURE — Technical Debt

---

#### TASK-13 · Unify Rewards Points — Single Source of Truth

**Priority:** Medium
**Files to change:**
- `app/hooks/useUser.ts`
- `app/hooks/useRewards.ts`

**Problem:**
Both `useRewards` and `useUser` store rewards points independently (`useRewards` in its own localStorage key `tacoRewards`, `useUser` in `tacoUser.rewardsPoints`). They can drift out of sync. `useUser.rewardsPoints` is never updated after the initial mock login.

**What to implement:**

1. Remove `rewardsPoints` from `UserProfile` interface in `useUser.ts` entirely. The single source of truth for points is `useRewards`.

2. In `useUser.addOrder()`, remove the line that increments `rewardsPoints`. Instead, callers should invoke `useRewards().addPoints()` directly (already done after TASK-01).

3. Anywhere the UI needs to display rewards points, import from `useRewards`, not from `useUser`.

**Acceptance criteria:**
- Points only live in `useRewards` state and `tacoRewards` localStorage key
- `useUser` has no points-related state
- No drift between the two systems

---

#### TASK-14 · Add Toaster and React Query to Providers

**Priority:** Medium
**Files to change:**
- `app/providers.tsx`

**Problem:**
`app/providers.tsx` currently just returns `<>{children}</>`. There's no global query cache (every component that fetches data does so independently with local `useEffect` + `useState`) and no toast system (needed for TASK-07).

**What to implement:**

1. Install `@tanstack/react-query`: `pnpm add @tanstack/react-query`

2. In `providers.tsx`:
   ```tsx
   import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
   const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, retry: 1 } } });

   export function Providers({ children }) {
     return (
       <QueryClientProvider client={queryClient}>
         <ToastProvider>
           {children}
         </ToastProvider>
       </QueryClientProvider>
     );
   }
   ```

3. `ToastProvider` is the one built in TASK-07.

4. Convert the `useEffect`/`useState` fetch patterns in `analytics/page.tsx` and `kitchen/page.tsx` to `useQuery` hooks using the shared `API_BASE` from TASK-02.

**Acceptance criteria:**
- Analytics and Kitchen pages use `useQuery` for data fetching
- Loading and error states handled by React Query
- Toast context available globally

---

#### TASK-15 · Add Error Boundary to Kitchen / KDS Pages

**Priority:** Medium
**Files to change:**
- `app/kitchen/page.tsx`
- `app/kds/page.tsx`

**Problem:**
Kitchen display and KDS are staff-facing screens that run continuously on tablets. If the SSE connection throws an unhandled error, the whole React tree unmounts silently. Staff would see a blank screen with no indication of what happened.

**What to implement:**

1. Create `app/components/ErrorBoundary.tsx` — a standard React class component error boundary that renders a fallback UI with a "Reconnect" button (which calls `window.location.reload()`).

2. Wrap the default export in both `kitchen/page.tsx` and `kds/page.tsx`:
   ```tsx
   export default function KitchenPage() {
     return (
       <ErrorBoundary fallback={<KitchenErrorFallback />}>
         <KitchenDisplay />
       </ErrorBoundary>
     );
   }
   ```

3. `KitchenErrorFallback`: dark background, centered `"Connection lost — tap to reconnect"` message, and a `onClick={() => window.location.reload()}` button styled with `bg-secondary-container`.

**Acceptance criteria:**
- A thrown error in the kitchen/KDS component tree shows the fallback UI instead of a blank screen
- "Reconnect" button reloads the page

---

#### TASK-16 · Protect OpenAI Key — Proxy Through Worker

**Priority:** Medium (future-proofing)
**Files to change:**
- `next.config.js`
- `workers/api.ts`
- `app/hooks/useVoiceAI.ts`

**Problem:**
`next.config.js` exposes `NEXT_PUBLIC_OPENAI_API_KEY` to the browser bundle. Any `NEXT_PUBLIC_` variable is visible in the compiled JS. If GPT-based intent parsing is added to voice ordering, the key would be publicly readable.

**What to implement:**

1. Remove `NEXT_PUBLIC_OPENAI_API_KEY` from `next.config.js` env block.

2. In `workers/api.ts`, add a new route `POST /api/voice-intent` that accepts `{ transcript: string }`, calls the OpenAI API server-side using the `OPENAI_API_KEY` Worker secret, and returns `{ intent: "order" | "remove" | "checkout" | "unknown", items: string[] }`.

3. Set the key as a Worker secret: `wrangler secret put OPENAI_API_KEY`.

4. In `useVoiceAI.ts`, when processing a final transcript, call `POST ${API_BASE}/voice-intent` with the transcript instead of doing local string matching. Use the returned intent to drive cart actions.

5. Keep the existing local fuzzy matching as a fallback if the API is unreachable.

**Acceptance criteria:**
- No AI API key exists in the browser bundle
- Voice intent is processed server-side
- Local fuzzy matching still works as fallback when Worker is unreachable

---

## 📋 Implementation Checklist

| # | Task | Priority | Complexity | Dependencies |
|---|---|---|---|---|
| TASK-01 | Wire "Confirm & Fire" → API | 🔴 Critical | Low | — |
| TASK-02 | Fix API base URL everywhere | 🔴 Critical | Low | — |
| TASK-03 | Wire KDS to live SSE | 🔴 Critical | Medium | TASK-02 |
| TASK-04 | Wire Order Status to real order + SSE | 🔴 Critical | Medium | TASK-01, TASK-02 |
| TASK-05 | Customization modal on menu items | 🟡 High | Medium | — |
| TASK-06 | Mobile cart sticky footer | 🟡 High | Low | — |
| TASK-07 | "Added to Cart" toast | 🟡 Medium | Low | — |
| TASK-08 | Empty cart guard on checkout | 🟡 Medium | Low | — |
| TASK-09 | Voice AI browser compatibility warning | 🟡 Medium | Low | — |
| TASK-10 | Real voice waveform animation | 🟢 Medium | Low | — |
| TASK-11 | Category color-coded icons on menu cards | 🟢 Low | Low | — |
| TASK-12 | Dynamic checkout ticket number | 🟢 Low | Low | — |
| TASK-13 | Unify rewards points — single source of truth | 🔵 Medium | Low | TASK-01 |
| TASK-14 | Add React Query + Toaster to Providers | 🔵 Medium | Medium | TASK-07 |
| TASK-15 | Error boundary on Kitchen/KDS | 🔵 Medium | Low | — |
| TASK-16 | Proxy OpenAI key through Worker | 🔵 Medium | Medium | — |

---

---

## 🚀 Recent Changes (2026-03-31)

### Critical Bug Fixes
- **Order-status page restored** — Full implementation with real order fetching via `?order=<id>` param, SSE-based real-time status updates, and proper empty-state handling
- **KDS `qty`/`quantity` mismatch fixed** — `mapApiOrderToKdsOrder` now uses `qty` to match the `OrderItem` interface
- **SSE reconnection memory leak fixed** — Both `DesktopKDS` and `TabletKDS` now use `useRef` + reconnect timer guard for proper cleanup
- **Toast dismiss loop fixed** — Replaced `onAnimationComplete` + `setTimeout` with `useEffect`-based auto-dismiss
- **Empty-cart redirect race condition fixed** — Added `hasAttemptedSubmit` ref guard in checkout
- **Defensive JSON parsing added** — `useOrderTracking.mapOrder` now has try/catch around `JSON.parse` and `Array.isArray` guard
- **SSE endpoint corrected** — All pages now use `/api/orders/stream` instead of non-existent `/events`
- **SSE event types aligned** — KDS now listens for `new`/`update` (matching Worker broadcast format)
- **API route ordering fixed** — `/api/orders/stream` now checked before `:id` catch-all regex

### Production Enhancements
- **Error Boundary** — Created `app/components/ErrorBoundary.tsx`, integrated into root layout — eliminates white-screen crashes
- **Cart persistence** — Zustand `persist` middleware with localStorage, state versioning (`version: 1`), and migration system
- **API fetch wrapper** — Centralized `app/lib/api.ts` with 5s timeout, 3-retry exponential backoff, typed errors (`ApiError` class)
- **SSE reconnection** — Exponential backoff (1s→30s, max 10 attempts) in order-status page
- **Static export fix** — `<Suspense>` boundary for `useSearchParams()` in order-status page
- **API migration** — All pages migrated to centralized `apiFetch` wrapper
- **Worker route fix** — Added missing `GET /api/orders/:id` endpoint
- **Security headers** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via `public/_headers`
- **ESLint** — Zero warnings/errors
- **KDS accessibility** — `aria-label`, keyboard navigation (Enter/Space), `role="region"` on all order cards
- **Performance** — `/menu` page reduced from 149 kB → 113 kB (24% reduction via framer-motion lazy-loading)

### Backend Enhancements (Inspired by OrderFlow AI)
- **Smart AI upselling** — Worker suggests complementary items (Baja Blast, Nacho Fries, Cinnamon Twists, Gordita Crunch) after every order
- **Real ETA prediction** — Load-based calculation replaces hardcoded "4-6 MINS"; scales with active order count
- **Voice transcript logging** — Orders now accept `transcript` field for AI accuracy tracking and quality assurance

### CI/CD
- **GitHub Actions workflow** — `.github/workflows/deploy.yml` with build checks, production deploy, and PR preview
- **Secrets documentation** — `.github/SECRETS.md` with setup instructions
- **Production roadmap** — `docs/PRODUCTION-ROADMAP.md` with 7-phase plan

---

## 💡 Future Enhancement Suggestions

### 🔴 High Priority — Revenue & UX Impact

#### 1. OpenAI NLU Integration
**Inspired by:** OrderFlow AI's natural language understanding
**Current state:** Voice AI uses fuzzy keyword matching (`includes("taco")`)
**Proposal:** Add `POST /api/voice/parse` endpoint in Worker that calls OpenAI to parse voice transcripts into structured orders:
```json
// Input: { "transcript": "i want two crunchy tacos and a baja blast" }
// Output: { "items": [{"id": "crunchy-taco", "qty": 2}, {"id": "baja-blast", "qty": 1}] }
```
**Impact:** Major accuracy improvement, handles complex modifications naturally

#### 2. Phone-Based Voice Ordering
**Inspired by:** OrderFlow's core phone ordering feature
**Current state:** Voice AI only works in-browser via Web Speech API
**Proposal:** Add Twilio integration to Worker — customer calls a phone number, Twilio streams audio to Worker, Worker processes via OpenAI Whisper + GPT, order created in Turso
**Impact:** True drive-through experience — no app/website needed

#### 3. Order Accuracy Dashboard
**Inspired by:** OrderFlow's AI accuracy tracking
**Proposal:** New DB table `order_accuracy` — stores transcript, parsed items, confirmed items, accuracy score. Analytics endpoint shows AI accuracy over time.
**Impact:** Quality metric for ops team, identifies menu items that confuse the AI

#### 4. Multi-Location Support
**Inspired by:** OrderFlow's multi-location dashboard
**Current state:** Single restaurant, single kitchen display
**Proposal:** Add `location_id` to orders table, Worker routes orders to correct kitchen SSE stream, Pages filters by location
**Impact:** Franchise scaling — one codebase, infinite locations

### 🟡 Medium Priority — Operational Efficiency

#### 5. Self-Improving AI (Weekly Reflection)
**Inspired by:** OrderFlow's "weekly reflection sessions"
**Proposal:** Weekly cron job in Worker that:
- Analyzes all transcripts from the past week
- Identifies common misinterpretations
- Updates a prompt template or keyword mapping stored in KV
**Impact:** AI gets smarter over time without code changes

#### 6. Real-Time Kitchen Load Balancing
**Current state:** KDS shows all orders in one queue
**Proposal:** Add station assignment logic — orders auto-routed to Grill, Fryer, or Assembly stations based on items. Each station gets its own SSE filter.
**Impact:** Faster prep, parallel cooking, reduced bottlenecks

#### 7. Customer Vehicle Recognition
**Inspired by:** Order-status page copy ("Our AI sensors will recognize your vehicle")
**Proposal:** Integrate with a license plate reader or Bluetooth beacon at the drive-through lane. When a known customer approaches, auto-load their order on the KDS.
**Impact:** Premium experience, repeat customer recognition

#### 8. Dynamic Menu Pricing
**Proposal:** Add time-based pricing to Worker — happy hour discounts, surge pricing during peak hours, combo deals
**Impact:** Revenue optimization, demand management

### 🟢 Low Priority — Polish & Scale

#### 9. Push Notifications (Web Push API)
**Current state:** Order status requires page open
**Proposal:** Subscribe to push notifications on order confirmation. When order status changes to "ready", fire a push notification.
**Impact:** Customer can browse elsewhere, gets notified when ready

#### 10. Offline Mode for Kitchen
**Current state:** Kitchen display requires live SSE connection
**Proposal:** Cache last-known orders in IndexedDB. If SSE disconnects, show cached data with "reconnecting" banner.
**Impact:** Resilient to network blips during rush hours

#### 11. Voice AI Personality Customization
**Proposal:** Add configurable AI personality — friendly, professional, humorous. Stored per-location in Worker KV.
**Impact:** Brand differentiation, location-specific voice

#### 12. Loyalty Program Integration
**Current state:** Rewards points are client-side only
**Proposal:** Sync rewards with Worker — points stored in Turso, redeemable at checkout, tier benefits applied automatically
**Impact:** Real loyalty program, cross-device persistence

---

*This document is the single source of truth for the Taco Bell AI Drive-Through. Update it whenever architecture, tech stack, or deployment changes.*
