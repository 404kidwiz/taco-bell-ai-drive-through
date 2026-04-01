# Production Readiness Roadmap

> Taco Bell AI Drive-Through — Next.js + Cloudflare Workers + Turso
> 
> **Current State:** All critical bugs fixed, API wired end-to-end, CI/CD configured, performance optimized.
> **Target:** Production-ready for live drive-through deployment.

---

## Phase 1 — Deploy & Verify (Week 1)

### 1.1 Deploy to Production
**Priority:** 🔴 Critical | **Effort:** 10 min

The CI/CD pipeline is already configured (`.github/workflows/deploy.yml`). You need to add 4 GitHub repository secrets:

| Secret | Where to Get It |
|--------|-----------------|
| `CLOUDFLARE_API_TOKEN` | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) → Create token with "Edit Cloudflare Workers" + "Cloudflare Pages Edit" |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Right sidebar |
| `TURSO_DATABASE_URL` | `turso db show taco-bell-orders --url` |
| `TURSO_AUTH_TOKEN` | `turso db tokens create taco-bell-orders` |

Then push to `main` — the workflow deploys both the Worker and Pages automatically.

**Verification checklist:**
- [ ] Worker responds at `https://taco-bell-api.<subdomain>.workers.dev/api/orders`
- [ ] Pages loads at `https://taco-bell-ai-drive-through.pages.dev`
- [ ] POST to `/api/orders` creates an order in Turso
- [ ] SSE stream at `/api/orders/stream` delivers real-time updates
- [ ] Order status page loads order data and receives SSE updates

### 1.2 Add Security Headers
**Priority:** 🔴 Critical | **Effort:** 15 min

Add a `_headers` file for Cloudflare Pages:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(self), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://taco-bell-api.404kidwiz.workers.dev;
```

Place at `dist/_headers` or configure in Cloudflare Pages dashboard → Custom domains → Headers.

### 1.3 Configure Environment-Specific API URLs
**Priority:** 🔴 Critical | **Effort:** 5 min

Update `app/lib/api.ts` to support environment switching:

```ts
export const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL || 
  "https://taco-bell-api.404kidwiz.workers.dev";
```

Set `NEXT_PUBLIC_API_URL` in Cloudflare Pages dashboard → Settings → Environment Variables.

---

## Phase 2 — Testing (Week 1-2)

### 2.1 Set Up Vitest + React Testing Library
**Priority:** 🔴 Critical | **Effort:** 1 hour

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**`vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 70, branches: 60, functions: 70 },
    },
  },
});
```

**`tests/setup.ts`:**
```ts
import '@testing-library/jest-dom/vitest';
```

**Add to `package.json`:**
```json
"scripts": {
  "test": "vitest",
  "test:ci": "vitest run --coverage"
}
```

### 2.2 Critical Tests to Write (Priority Order)

| # | Test Target | Why | File |
|---|-------------|-----|------|
| 1 | **Cart store** — add, remove, clear, persistence | Core revenue flow | `app/hooks/useCartStore.ts` |
| 2 | **Order tracking** — createOrder, updateStatus, mapOrder | Checkout → KDS pipeline | `app/hooks/useOrderTracking.ts` |
| 3 | **API wrapper** — retry logic, timeout, error parsing | All data flows through this | `app/lib/api.ts` |
| 4 | **Customization hook** — toggle, price calc, clear | Menu UX | `app/hooks/useCustomization.ts` |
| 5 | **Error Boundary** — catches errors, renders fallback | Crash resilience | `app/components/ErrorBoundary.tsx` |
| 6 | **Checkout flow** — empty cart redirect, submit success/failure | Revenue-critical | `app/checkout/page.tsx` |
| 7 | **Order status** — loading state, no-order fallback, SSE update | Customer-facing | `app/order-status/page.tsx` |

### 2.3 Add Tests to CI Pipeline
**Effort:** 5 min

Add to `.github/workflows/deploy.yml` in the `build` job:

```yaml
      - name: Run tests
        run: npm run test:ci
```

---

## Phase 3 — Accessibility (Week 2)

### 3.1 WCAG 2.1 AA Audit — Critical Issues

| Component | Issue | Fix | Priority |
|-----------|-------|-----|----------|
| **KDS Board** | No keyboard navigation between order cards | Add `tabIndex={0}`, `onKeyDown` handlers for bump actions | 🔴 |
| **KDS Board** | Color-only status indicators (red/yellow/green) | Add text labels + icons with `aria-label` | 🔴 |
| **Voice UI** | No visual feedback for screen readers | Add `aria-live="polite"` region for AI messages | 🔴 |
| **Checkout** | "Confirm & Fire" button has no `aria-busy` state | Add `aria-busy={isSubmitting}` | 🟡 |
| **Menu** | Customization modal has no `role="dialog"` | Add `role="dialog" aria-modal="true" aria-label="Customize {item}"` | 🟡 |
| **All pages** | Missing skip-to-content link | Add hidden link at top of layout | 🟡 |
| **Analytics** | Charts are images with no text alternative | Add `aria-label` with data summary | 🟢 |

### 3.2 Implementation — KDS Accessibility

Add to each KDS order card:

```tsx
<div
  role="region"
  aria-label={`Order ${order.orderNumber}, ${order.items.length} items, status: ${order.status}`}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBump();
    }
  }}
>
```

Add status badges with text:

```tsx
<span className="sr-only">Status: {order.status}</span>
<span aria-hidden="true" className="...">{statusIcon}</span>
```

### 3.3 Implementation — Voice AI Accessibility

Add to `VoicePanel` and `MobileVoiceUI`:

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {lastMessage}
</div>
```

### 3.4 Automated A11y Testing

Add `eslint-plugin-jsx-a11y` (already included with Next.js):

```bash
npm run lint
```

Add `axe-core` for runtime testing:

```bash
npm install -D @axe-core/react
```

**`tests/a11y.test.tsx`:**
```ts
import { render } from '@testing-library/react';
import { injectAxe, checkA11y } from 'axe-playwright';

describe('Accessibility', () => {
  it('menu page has no violations', async () => {
    const { container } = render(<MenuPage />);
    await injectAxe(container);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});
```

---

## Phase 4 — Monitoring & Observability (Week 2-3)

### 4.1 Error Tracking — Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

This auto-configures `next.config.js` and creates `sentry.client.config.ts` + `sentry.server.config.ts`.

**What to monitor:**
- All `ApiError` instances (network failures, timeouts)
- Error Boundary catches (component crashes)
- SSE disconnection events
- Voice AI speech recognition errors

### 4.2 Real-User Monitoring — Cloudflare Web Analytics

Enable in Cloudflare Dashboard → Analytics → Web Analytics. Free, privacy-first, no cookies.

### 4.3 Custom Health Check Endpoint

Add to Worker (`workers/api.ts`):

```ts
// GET /api/health
if (path === "/api/health" && method === "GET") {
  return json({
    status: "ok",
    timestamp: Date.now(),
    uptime: process.uptime?.() ?? 0,
  });
}
```

Add to CI/CD as a post-deploy verification step.

### 4.4 SSE Connection Monitoring

Add a counter in the Worker to track active SSE clients:

```ts
// GET /api/health/sse
if (path === "/api/health/sse" && method === "GET") {
  return json({ activeClients: sseClients.size });
}
```

---

## Phase 5 — Security Hardening (Week 3)

### 5.1 API Rate Limiting

Add to Worker (`workers/api.ts`):

```ts
// Simple in-memory rate limiter (per-IP)
const rateLimit = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
```

For production, use Cloudflare's built-in rate limiting rules in the dashboard.

### 5.2 Input Validation

Add Zod for request body validation:

```bash
npm install zod
```

```ts
import { z } from 'zod';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1),
  total: z.number().positive(),
  specialInstructions: z.string().max(500).optional(),
  customerPhone: z.string().regex(/^\+?\d{10,15}$/).optional(),
});
```

### 5.3 CORS Restriction

Currently `Access-Control-Allow-Origin: *`. Tighten to your Pages domain:

```ts
const CORS = {
  "Access-Control-Allow-Origin": "https://taco-bell-ai-drive-through.pages.dev",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};
```

### 5.4 Secret Rotation

Set up a quarterly reminder to rotate:
- `TURSO_AUTH_TOKEN`
- `CLOUDFLARE_API_TOKEN`

Add to your calendar with the command:
```bash
npx wrangler secret put TURSO_AUTH_TOKEN
```

---

## Phase 6 — Code Quality Standards (Ongoing)

### 6.1 Pre-Commit Hooks

```bash
npm install -D husky lint-staged
npx husky init
```

**`.husky/pre-commit`:**
```bash
npx lint-staged
```

**`package.json`:**
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "tsc --noEmit"],
  "*.{js,css,md}": ["prettier --write"]
}
```

### 6.2 ESLint Rules

Add to `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/exhaustive-deps": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 6.3 PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What does this change?

## Why is it needed?

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No new TypeScript errors

## Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient

## Performance
- [ ] No new large bundle imports
- [ ] Lighthouse score maintained
```

### 6.4 Branch Protection Rules

In GitHub → Settings → Branches → `main`:
- [x] Require pull request reviews before merging (1 reviewer minimum)
- [x] Require status checks to pass (`Build & Test`)
- [x] Require branches to be up to date
- [x] Include administrators
- [x] Require conversation resolution before merging

---

## Phase 7 — Performance (Ongoing)

### 7.1 Current Bundle Status

| Page | Size | First Load JS |
|------|------|---------------|
| `/menu` | 8.27 kB | 113 kB |
| `/` | 7.13 kB | 112 kB |
| `/checkout` | 6.81 kB | 112 kB |
| `/kds` | 5.47 kB | 106 kB |
| `/order-status` | 7.63 kB | 112 kB |
| `/kitchen` | 6.26 kB | 147 kB |
| `/analytics` | 6.88 kB | 147 kB |

### 7.2 Next Optimization Targets

| Target | Current | Goal | How |
|--------|---------|------|-----|
| `/kitchen` First Load | 147 kB | < 120 kB | Replace framer-motion with CSS animations |
| `/analytics` First Load | 147 kB | < 120 kB | Replace framer-motion with CSS animations |
| Shared chunk | 101 kB | < 80 kB | Remove unused lucide-react icons, split React runtime |
| TTI (mobile) | TBD | < 3s | Code-split KDS columns, defer non-critical JS |

### 7.3 Lighthouse Budget

Add `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.8 }]
      }
    }
  }
}
```

---

## Summary — Priority Order

```
Week 1:  Deploy → Security Headers → Vitest Setup → Cart/Order Tests
Week 2:  Accessibility (KDS, Voice, Menu) → Sentry Integration → Health Checks
Week 3:  Rate Limiting → Input Validation → CORS Restriction → Code Quality
Ongoing: Performance tuning → Lighthouse monitoring → PR template enforcement
```

### Quick Wins (Do These First)

1. **Add 4 GitHub secrets** → Push to `main` → Deploy (10 min)
2. **Add `_headers` file** → Security headers (5 min)
3. **Run `npm run lint`** → Fix any existing warnings (15 min)
4. **Write cart store tests** → Protect the revenue flow (1 hour)
5. **Add `aria-label` to KDS cards** → Keyboard navigation (30 min)
