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

## 2. Detailed Database Tables Schema

### Users & Organization (Tenants)
- **`users`**: Platform user identity (name, email, password, role, status).
- **`organizations`**: Main account/tenant level (e.g. "Sharma Hospitality Group").
- **`organization_users`**: Pivot table connecting users to organizations with roles.

### Businesses & Branches
- **`businesses`**: Specific brand/business under an organization (name, slug, category_id, google_review_url, logo).
- **`branches`**: Physical locations under a business (address, city, lat, long, status).

### QR Codes & Sessions
- **`qr_codes`**: QR tokens mapped to a business and branch (token_hash, destination_type, scan_count).
- **`qr_scans`**: Analytics events for scans (device, browser, location, scanned_at).
- **`review_sessions`**: Anonymous customer interaction session tracking funnel conversion.

### Feedback & AI Review Intelligence
- **`feedbacks`**: Original customer rating & raw comments.
- **`feedback_analysis`**: AI sentiment score, topic tagging, and summarization.
- **`review_drafts`**: AI-generated polished review variations with token tracking.
- **`review_events`**: Funnel event tracking (`draft_generated`, `draft_edited`, `google_clicked`, `completed`).

### Billing & Usage Tracking
- **`plans`**: Pricing tiers, limits (max_branches, max_qr_codes, max_ai_generations).
- **`subscriptions`**: Active organization plan states.
- **`payments`**: Transaction records.
- **`usage_records`**: Metered usage tracking (`ai_generation`, `feedback_submitted`, `qr_scan`).

---

## 3. Dynamic Subdomain Architecture (`*.reviewflow.in`)

### Subdomain Layout
- `reviewflow.in` → Marketing & Public landing page
- `app.reviewflow.in` → Business Owner/Manager Dashboard
- `admin.reviewflow.in` → Super Admin Operations Dashboard
- `api.reviewflow.in` → Laravel Backend API
- `{slug}.reviewflow.in` → Public customer review page (e.g., `brewbliss.reviewflow.in`)

### Technical Implementation
1. **Wildcard DNS**: Single wildcard DNS A record (`*.reviewflow.in`) pointing to the application server (Cloudflare / Vercel).
2. **No Dynamic DNS Creation**: Subdomains are resolved dynamically at runtime by extracting the `hostname` slug in Next.js middleware and querying Laravel `GET /api/v1/public/business/{slug}`.
3. **Route Mapping**:
   - `brewbliss.reviewflow.in/q/{token}` → Resolves Business: *Brew & Bliss*, Branch: *Udaipur*, QR: *Table 01*.
4. **Local Development**: Modern browsers resolve `*.localhost` to local machine (e.g., `brewbliss.localhost:3000`).

---

## 4. Phased Implementation Strategy
- **Phase 1**: Auth & Multi-Tenancy (`users`, `organizations`, `organization_users`)
- **Phase 2**: Core Business (`business_categories`, `businesses`, `branches`)
- **Phase 3**: Review Engine (`qr_codes`, `qr_scans`, `review_sessions`, `feedbacks`, `review_drafts`, `review_events`)
- **Phase 4**: Billing & Usage Metering (`plans`, `subscriptions`, `payments`, `usage_records`)
- **Phase 5**: Intelligence (`feedback_analysis`, `review_questions`, `ai_prompt_templates`)
