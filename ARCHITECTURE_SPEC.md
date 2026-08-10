# ReviewFlow SaaS - Platform Architecture Specification

## 1. High-Level DB Architecture (Multi-Tenant SaaS Foundation)

```text
                         PLATFORM
                            │
             ┌──────────────┼──────────────┐
             │              │              │
           users          plans       subscriptions
             │              │              │
             │              └──────┬───────┘
             │                     │
             ▼                     ▼
       organizations ───── organization_subscriptions
             │
       organization_users
             │
       ┌─────┴──────┐
       │            │
   businesses     branches
       │            │
       └─────┬──────┘
             │
          QR codes
             │
         feedbacks
             │
       review_drafts
             │
       review_events
             │
       usage_records
```

### Key Entity Layers
1. **Platform Layer**: `users`, `plans`, `subscriptions`
2. **Tenant Layer**: `organizations`, `organization_users`, `businesses`, `branches`
3. **ReviewFlow Layer**: `qr_codes`, `qr_scans`, `review_sessions`, `feedbacks`, `feedback_analysis`, `review_drafts`, `review_events`
4. **Usage & Billing Layer**: `plans`, `subscriptions`, `payments`, `usage_records`
5. **Intelligence & Customization Layer**: `business_categories`, `review_questions`, `ai_prompt_templates`, `business_settings`

---

## 2. Dynamic Subdomain Architecture (`*.reviewflow.in`)

### Subdomain Layout
- `reviewflow.in` → Marketing & Public landing page
- `app.reviewflow.in` → Business Owner/Manager Dashboard
- `admin.reviewflow.in` → Super Admin Operations Dashboard
- `api.reviewflow.in` → Laravel Backend API
- `{slug}.reviewflow.in` → Public customer review page (e.g., `brewbliss.reviewflow.in`)

---

## 3. UI & Frontend Architecture

### Shared UI Library (`packages/ui`)
- Hosted as `@repo/ui`. All shadcn/ui components (`Button`, `Dialog`, `DropdownMenu`, `Input`, `Table`) live in `packages/ui/src/components/ui/`.
- Styling: OKLCH design variables and Tailwind CSS v4 `@theme` configuration.
- Icons: `lucide-react` used across components.

### TanStack Query Setup
- Package: `@tanstack/react-query` v5.
- Provider: `apps/reviewflow/app/providers.tsx` wraps `RootLayout` in `layout.tsx` to handle client-side caching and server-side re-hydration.

### Customer Review Writing Experience
- **Location**: `apps/reviewflow/components/customer-review-screen.tsx`.
- **Routes**: `/` (home) and `/q/[token]` (QR scan endpoint).
- **Features**: Velvet Glassmorphism design, star rating bar, Lucide icon chips, real-time AI review generator, copy toast, and Google Review CTA.
