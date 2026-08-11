// ─── Platform ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: "super_admin" | "owner" | "manager" | "staff";
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_period: "monthly" | "yearly";
  max_branches: number;
  max_qr_codes: number;
  feedback_limit: number;
  ai_generation_limit: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  plan?: Plan;
  status: "trial" | "active" | "past_due" | "cancelled" | "suspended";
  starts_at: string;
  ends_at?: string;
  trial_ends_at?: string;
  created_at: string;
}

// ─── Tenant ─────────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  owner?: User;
  subscription?: Subscription;
  created_at: string;
}

export interface Business {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  logo_url?: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  google_review_url?: string;
  default_language: string;
  ai_tone: "professional" | "friendly" | "casual" | "formal";
  review_length: "short" | "medium" | "long";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  user: User;
  role: "owner" | "manager" | "staff";
  status: "active" | "invited" | "inactive";
  joined_at?: string;
  last_active_at?: string;
}

// ─── Business Categories ────────────────────────────────────────────────────

export type BusinessCategory =
  | "cafe"
  | "restaurant"
  | "hotel"
  | "salon_spa"
  | "clinic_healthcare"
  | "retail_store"
  | "furniture_store"
  | "gym_fitness"
  | "auto_service"
  | "jewellery_store"
  | "fashion_boutique"
  | "beauty_cosmetics"
  | "education_coaching"
  | "home_services"
  | "professional_services";

export interface CategoryInfo {
  id: BusinessCategory;
  label: string;
  icon: string;
  dimensions: string[];
  parentGroup: string;
}

// ─── ReviewFlow Engine ──────────────────────────────────────────────────────

export interface QRCode {
  id: string;
  business_id: string;
  branch_id?: string;
  branch?: Branch;
  name: string;
  token: string;
  url: string;
  total_scans: number;
  is_active: boolean;
  created_at: string;
}

export interface QRScan {
  id: string;
  qr_code_id: string;
  scanned_at: string;
  user_agent?: string;
  ip_address?: string;
}

export interface Feedback {
  id: string;
  business_id: string;
  branch_id?: string;
  branch?: Branch;
  qr_code_id?: string;
  qr_code?: QRCode;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  status: FeedbackStatus;
  review_draft?: ReviewDraft;
  created_at: string;
}

export type FeedbackStatus =
  | "feedback_received"
  | "draft_generated"
  | "draft_approved"
  | "google_opened";

export interface ReviewDraft {
  id: string;
  feedback_id: string;
  original_text: string;
  ai_draft: string;
  is_edited: boolean;
  edited_text?: string;
  status: "generated" | "approved" | "rejected";
  created_at: string;
}

export interface ReviewEvent {
  id: string;
  feedback_id: string;
  event_type: "draft_generated" | "draft_approved" | "draft_rejected" | "google_opened" | "review_copied";
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── Usage & Billing ────────────────────────────────────────────────────────

export interface UsageRecord {
  id: string;
  organization_id: string;
  metric: "ai_generation" | "feedback" | "qr_scan" | "review_action";
  count: number;
  period_start: string;
  period_end: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  organization?: Organization;
  amount: number;
  currency: string;
  plan_id: string;
  plan?: Plan;
  status: "paid" | "pending" | "failed" | "refunded";
  invoice_number?: string;
  paid_at?: string;
  created_at: string;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_reviews: number;
  reviews_trend: number;
  average_rating: number;
  total_feedback: number;
  feedback_this_week: number;
  google_actions: number;
  conversion_rate: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface TopicCount {
  topic: string;
  count: number;
  sentiment: "positive" | "negative";
}

export interface FunnelStep {
  label: string;
  value: number;
}

export interface ChartDataPoint {
  date: string;
  feedback: number;
  ai_drafts: number;
  google_actions: number;
}

export interface QRPerformance {
  qr_name: string;
  scans: number;
  feedback: number;
  conversions: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  total_businesses: number;
  active_subscriptions: number;
  mrr: number;
  total_ai_generations: number;
  total_feedback: number;
}

export interface AdminBusinessView extends Business {
  organization?: Organization;
  owner?: User;
  plan?: Plan;
  review_count: number;
  feedback_count: number;
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
