# Project Rules & Comprehensive Memory for ReviewFlow SaaS Platform

## Core Architectural Memory

### 1. Database Architecture
- **Multi-Tenant SaaS Foundation**: Separates Platform (`users`, `plans`, `subscriptions`), Tenant (`organizations`, `businesses`, `branches`), ReviewFlow Engine (`qr_codes`, `qr_scans`, `review_sessions`, `feedbacks`, `feedback_analysis`, `review_drafts`, `review_events`), and Usage/Billing Metering (`usage_records`, `payments`).
- Refer to [ARCHITECTURE_SPEC.md](file:///c:/Users/nayan/Documents/GitHub/saas-platform/ARCHITECTURE_SPEC.md) for full schema definitions.

### 2. Dynamic Subdomain Architecture
- **Wildcard DNS (`*.reviewflow.in`)**: All business subdomains (e.g. `brewbliss.reviewflow.in`) resolve dynamically. Next.js extracts the hostname slug and queries `api.reviewflow.in/api/v1/public/business/{slug}`. No manual or API-based DNS record creation per business onboarding.

### 3. Centralized UI & Design System (`packages/ui`)
- **Shared UI Components (`@repo/ui`)**: All shadcn UI primitives (`Button`, `Dialog`, `DropdownMenu`, `Input`, `Table`) are hosted centrally in `packages/ui/src/components/ui/`.
- **Utilities & Styles**: Import `cn` from `@repo/ui/lib/utils` and styles from `@repo/ui/styles.css`.
- **Icon Policy**: Use `lucide-react` icons exclusively for all UI components and customer screens (do NOT use emojis).

### 4. Data Fetching & State Management
- **TanStack Query v5**: Configured `@tanstack/react-query` with a production-ready `<Providers>` wrapper in `apps/reviewflow/app/providers.tsx` handling Next.js App Router SSR re-hydration safely.

### 5. Customer Review Writing Screen
- **Component**: `CustomerReviewScreen` located at `apps/reviewflow/components/customer-review-screen.tsx`.
- **Routes**: Rendered at `/` (root) and `/q/[token]` (QR customer route).
- **Features**: Interactive star ratings, Lucide icon chip tags, real-time AI review generation, clipboard copy toast, and direct Google Review redirect.
