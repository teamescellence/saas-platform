# Project Rules & Guidelines for ReviewFlow SaaS Platform

## Core Architectural Memory

- **Database Architecture**: Multi-tenant SaaS structure separating Platform (`users`, `plans`, `subscriptions`), Tenant (`organizations`, `businesses`, `branches`), ReviewFlow (`qr_codes`, `feedbacks`, `review_drafts`, `review_events`), and Usage/Billing (`usage_records`, `payments`).
- **Dynamic Subdomains**: Subdomain routing via wildcard DNS (`*.reviewflow.in`). Next.js extracts subdomains dynamically and queries `api.reviewflow.in/api/v1/public/business/{slug}` without requiring individual DNS API calls per business.
- **UI Architecture**: Centralized shadcn UI component library hosted in `packages/ui` (`@repo/ui`). Import UI components from `@repo/ui/components/ui/*` and utilities from `@repo/ui/lib/utils`.

For complete database schema and domain specifications, refer to [ARCHITECTURE_SPEC.md](file:///c:/Users/nayan/Documents/GitHub/saas-platform/ARCHITECTURE_SPEC.md).
