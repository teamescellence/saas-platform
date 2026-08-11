import type {
  User,
  Plan,
  Subscription,
  Organization,
  Business,
  Branch,
  TeamMember,
  QRCode,
  Feedback,
  ReviewDraft,
  Payment,
  DashboardStats,
  SentimentBreakdown,
  TopicCount,
  FunnelStep,
  ChartDataPoint,
  QRPerformance,
  RatingDistribution,
  AdminDashboardStats,
  AdminBusinessView,
  CategoryInfo,
  BusinessCategory,
} from "./types";

// ─── Categories ─────────────────────────────────────────────────────────────

export const BUSINESS_CATEGORIES: CategoryInfo[] = [
  { id: "cafe", label: "Cafe", icon: "Coffee", dimensions: ["Food", "Service", "Ambience"], parentGroup: "Food & Dining" },
  { id: "restaurant", label: "Restaurant", icon: "UtensilsCrossed", dimensions: ["Food", "Service", "Ambience"], parentGroup: "Food & Dining" },
  { id: "hotel", label: "Hotel", icon: "Hotel", dimensions: ["Room", "Cleanliness", "Staff"], parentGroup: "Hospitality" },
  { id: "salon_spa", label: "Salon & Spa", icon: "Scissors", dimensions: ["Service", "Staff", "Experience"], parentGroup: "Beauty & Wellness" },
  { id: "clinic_healthcare", label: "Clinic & Healthcare", icon: "Stethoscope", dimensions: ["Appointment", "Staff", "Cleanliness"], parentGroup: "Healthcare" },
  { id: "retail_store", label: "Retail Store", icon: "ShoppingBag", dimensions: ["Product", "Staff", "Shopping"], parentGroup: "Retail" },
  { id: "furniture_store", label: "Furniture Store", icon: "Armchair", dimensions: ["Quality", "Delivery", "Installation"], parentGroup: "Retail" },
  { id: "gym_fitness", label: "Gym & Fitness", icon: "Dumbbell", dimensions: ["Equipment", "Trainers", "Environment"], parentGroup: "Beauty & Wellness" },
  { id: "auto_service", label: "Auto Service", icon: "Car", dimensions: ["Service", "Time", "Vehicle"], parentGroup: "Services" },
  { id: "jewellery_store", label: "Jewellery Store", icon: "Gem", dimensions: ["Product", "Staff", "Trust"], parentGroup: "Retail" },
  { id: "fashion_boutique", label: "Fashion & Boutique", icon: "Shirt", dimensions: ["Product", "Staff", "Fit"], parentGroup: "Retail" },
  { id: "beauty_cosmetics", label: "Beauty & Cosmetics", icon: "Sparkles", dimensions: ["Product", "Service", "Staff"], parentGroup: "Beauty & Wellness" },
  { id: "education_coaching", label: "Education & Coaching", icon: "GraduationCap", dimensions: ["Teaching", "Staff", "Environment"], parentGroup: "Education" },
  { id: "home_services", label: "Home Services", icon: "Home", dimensions: ["Service", "Quality", "Timeliness"], parentGroup: "Services" },
  { id: "professional_services", label: "Professional Services", icon: "Briefcase", dimensions: ["Service", "Communication", "Result"], parentGroup: "Services" },
];

// ─── Users ──────────────────────────────────────────────────────────────────

export const MOCK_CURRENT_USER: User = {
  id: "usr_1",
  name: "Rahul Sharma",
  email: "rahul@brewbliss.in",
  phone: "+91 98290 12345",
  role: "owner",
  email_verified_at: "2026-01-15T10:00:00Z",
  created_at: "2026-01-15T09:30:00Z",
  updated_at: "2026-08-10T14:00:00Z",
};

export const MOCK_ADMIN_USER: User = {
  id: "usr_admin_1",
  name: "Arjun Patel",
  email: "arjun@reviewflow.in",
  role: "super_admin",
  email_verified_at: "2025-12-01T10:00:00Z",
  created_at: "2025-12-01T09:00:00Z",
  updated_at: "2026-08-10T14:00:00Z",
};

// ─── Plans ──────────────────────────────────────────────────────────────────

export const MOCK_PLANS: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    slug: "starter",
    price: 499,
    currency: "INR",
    billing_period: "monthly",
    max_branches: 1,
    max_qr_codes: 5,
    feedback_limit: 500,
    ai_generation_limit: 500,
    features: [
      "1 business location",
      "5 QR codes",
      "500 feedback/month",
      "500 AI generations/month",
      "Basic analytics",
      "Email support",
    ],
    is_active: true,
    created_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "plan_growth",
    name: "Growth",
    slug: "growth",
    price: 999,
    currency: "INR",
    billing_period: "monthly",
    max_branches: 3,
    max_qr_codes: 20,
    feedback_limit: 2000,
    ai_generation_limit: 2000,
    features: [
      "3 business locations",
      "20 QR codes",
      "2,000 feedback/month",
      "2,000 AI generations/month",
      "Advanced analytics",
      "Review intelligence",
      "Team management",
      "Priority support",
    ],
    is_active: true,
    created_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "plan_pro",
    name: "Pro",
    slug: "pro",
    price: 2499,
    currency: "INR",
    billing_period: "monthly",
    max_branches: 10,
    max_qr_codes: 100,
    feedback_limit: 10000,
    ai_generation_limit: 10000,
    features: [
      "10 business locations",
      "100 QR codes",
      "10,000 feedback/month",
      "10,000 AI generations/month",
      "Full analytics suite",
      "Review intelligence",
      "Custom AI tone",
      "API access",
      "Dedicated support",
      "White-label QR brand kit",
    ],
    is_active: true,
    created_at: "2025-12-01T00:00:00Z",
  },
];

// ─── Organization & Business ────────────────────────────────────────────────

export const MOCK_SUBSCRIPTION: Subscription = {
  id: "sub_1",
  organization_id: "org_1",
  plan_id: "plan_growth",
  plan: MOCK_PLANS[1],
  status: "active",
  starts_at: "2026-02-01T00:00:00Z",
  ends_at: "2026-09-01T00:00:00Z",
  created_at: "2026-02-01T00:00:00Z",
};

export const MOCK_ORGANIZATION: Organization = {
  id: "org_1",
  name: "Brew & Bliss",
  slug: "brewbliss",
  owner_id: "usr_1",
  owner: MOCK_CURRENT_USER,
  subscription: MOCK_SUBSCRIPTION,
  created_at: "2026-01-15T09:30:00Z",
};

export const MOCK_BUSINESS: Business = {
  id: "biz_1",
  organization_id: "org_1",
  name: "Brew & Bliss",
  slug: "brewbliss",
  category: "cafe",
  description: "Specialty coffee shop serving artisan blends and freshly baked goods in the heart of Udaipur.",
  website: "https://brewbliss.in",
  phone: "+91 98290 12345",
  address: "14, Fateh Sagar Road",
  city: "Udaipur",
  state: "Rajasthan",
  country: "India",
  postal_code: "313001",
  google_review_url: "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs",
  default_language: "en",
  ai_tone: "friendly",
  review_length: "medium",
  is_active: true,
  created_at: "2026-01-15T09:30:00Z",
  updated_at: "2026-08-01T14:00:00Z",
};

// ─── Branches ───────────────────────────────────────────────────────────────

export const MOCK_BRANCHES: Branch[] = [
  {
    id: "br_1",
    business_id: "biz_1",
    name: "Udaipur Main",
    address: "14, Fateh Sagar Road",
    city: "Udaipur",
    state: "Rajasthan",
    phone: "+91 98290 12345",
    is_active: true,
    created_at: "2026-01-15T09:30:00Z",
  },
  {
    id: "br_2",
    business_id: "biz_1",
    name: "Jaipur Branch",
    address: "23, MI Road",
    city: "Jaipur",
    state: "Rajasthan",
    phone: "+91 98290 54321",
    is_active: true,
    created_at: "2026-04-01T09:00:00Z",
  },
];

// ─── Team Members ───────────────────────────────────────────────────────────

export const MOCK_TEAM: TeamMember[] = [
  {
    id: "tm_1",
    user_id: "usr_1",
    organization_id: "org_1",
    user: MOCK_CURRENT_USER,
    role: "owner",
    status: "active",
    joined_at: "2026-01-15T09:30:00Z",
    last_active_at: "2026-08-10T14:00:00Z",
  },
  {
    id: "tm_2",
    user_id: "usr_2",
    organization_id: "org_1",
    user: {
      id: "usr_2",
      name: "Priya Verma",
      email: "priya@brewbliss.in",
      phone: "+91 98290 67890",
      role: "manager",
      email_verified_at: "2026-02-10T10:00:00Z",
      created_at: "2026-02-10T09:00:00Z",
      updated_at: "2026-08-09T10:00:00Z",
    },
    role: "manager",
    status: "active",
    joined_at: "2026-02-10T09:00:00Z",
    last_active_at: "2026-08-09T10:00:00Z",
  },
  {
    id: "tm_3",
    user_id: "usr_3",
    organization_id: "org_1",
    user: {
      id: "usr_3",
      name: "Amit Kumar",
      email: "amit@brewbliss.in",
      role: "staff",
      created_at: "2026-03-15T09:00:00Z",
      updated_at: "2026-08-08T10:00:00Z",
    },
    role: "staff",
    status: "active",
    joined_at: "2026-03-15T09:00:00Z",
    last_active_at: "2026-08-08T10:00:00Z",
  },
  {
    id: "tm_4",
    user_id: "usr_4",
    organization_id: "org_1",
    user: {
      id: "usr_4",
      name: "Sneha Joshi",
      email: "sneha@brewbliss.in",
      role: "staff",
      created_at: "2026-05-01T09:00:00Z",
      updated_at: "2026-07-20T10:00:00Z",
    },
    role: "staff",
    status: "invited",
    joined_at: undefined,
    last_active_at: undefined,
  },
];

// ─── QR Codes ───────────────────────────────────────────────────────────────

export const MOCK_QR_CODES: QRCode[] = [
  { id: "qr_1", business_id: "biz_1", branch_id: "br_1", branch: MOCK_BRANCHES[0], name: "Table 01", token: "X82Lm9", url: "brewbliss.reviewflow.in/q/X82Lm9", total_scans: 421, is_active: true, created_at: "2026-02-01T10:00:00Z" },
  { id: "qr_2", business_id: "biz_1", branch_id: "br_1", branch: MOCK_BRANCHES[0], name: "Table 02", token: "K93nP4", url: "brewbliss.reviewflow.in/q/K93nP4", total_scans: 387, is_active: true, created_at: "2026-02-01T10:05:00Z" },
  { id: "qr_3", business_id: "biz_1", branch_id: "br_1", branch: MOCK_BRANCHES[0], name: "Table 03", token: "R47xQ2", url: "brewbliss.reviewflow.in/q/R47xQ2", total_scans: 298, is_active: true, created_at: "2026-02-01T10:10:00Z" },
  { id: "qr_4", business_id: "biz_1", branch_id: "br_1", branch: MOCK_BRANCHES[0], name: "Billing Counter", token: "W61cT8", url: "brewbliss.reviewflow.in/q/W61cT8", total_scans: 534, is_active: true, created_at: "2026-02-15T09:00:00Z" },
  { id: "qr_5", business_id: "biz_1", branch_id: "br_1", branch: MOCK_BRANCHES[0], name: "Takeaway", token: "M28vH5", url: "brewbliss.reviewflow.in/q/M28vH5", total_scans: 189, is_active: true, created_at: "2026-03-01T09:00:00Z" },
  { id: "qr_6", business_id: "biz_1", branch_id: "br_1", branch: MOCK_BRANCHES[0], name: "Reception", token: "F15bN7", url: "brewbliss.reviewflow.in/q/F15bN7", total_scans: 156, is_active: true, created_at: "2026-03-15T09:00:00Z" },
  { id: "qr_7", business_id: "biz_1", branch_id: "br_2", branch: MOCK_BRANCHES[1], name: "Table 01 (Jaipur)", token: "J42kR9", url: "brewbliss.reviewflow.in/q/J42kR9", total_scans: 112, is_active: true, created_at: "2026-04-15T09:00:00Z" },
  { id: "qr_8", business_id: "biz_1", branch_id: "br_2", branch: MOCK_BRANCHES[1], name: "Packaging", token: "P73sD1", url: "brewbliss.reviewflow.in/q/P73sD1", total_scans: 67, is_active: false, created_at: "2026-05-01T09:00:00Z" },
];

// ─── Feedback ───────────────────────────────────────────────────────────────

export const MOCK_FEEDBACK: Feedback[] = [
  {
    id: "fb_1",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_1",
    qr_code: MOCK_QR_CODES[0],
    rating: 5,
    text: "Amazing coffee and the staff was super friendly! Loved the caramel latte.",
    sentiment: "positive",
    topics: ["Coffee", "Staff", "Caramel Latte"],
    status: "google_opened",
    review_draft: {
      id: "rd_1",
      feedback_id: "fb_1",
      original_text: "Amazing coffee and the staff was super friendly! Loved the caramel latte.",
      ai_draft: "I had an exceptional experience at Brew & Bliss. The coffee is outstanding — the caramel latte in particular was a standout. The staff were incredibly warm and welcoming. Highly recommend for coffee enthusiasts!",
      is_edited: false,
      status: "approved",
      created_at: "2026-08-10T11:32:00Z",
    },
    created_at: "2026-08-10T11:30:00Z",
  },
  {
    id: "fb_2",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_4",
    qr_code: MOCK_QR_CODES[3],
    rating: 4,
    text: "Great ambience and food quality. Service was a bit slow during peak hours but overall very nice.",
    sentiment: "positive",
    topics: ["Ambience", "Food", "Service Speed"],
    status: "draft_approved",
    review_draft: {
      id: "rd_2",
      feedback_id: "fb_2",
      original_text: "Great ambience and food quality. Service was a bit slow during peak hours but overall very nice.",
      ai_draft: "Brew & Bliss has a wonderful ambience and the food quality is consistently good. While the service can be slightly slow during peak hours, the overall experience is very pleasant. A great spot for a relaxing meal.",
      is_edited: false,
      status: "approved",
      created_at: "2026-08-09T16:15:00Z",
    },
    created_at: "2026-08-09T16:10:00Z",
  },
  {
    id: "fb_3",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_2",
    qr_code: MOCK_QR_CODES[1],
    rating: 5,
    text: "Best cafe in Udaipur hands down. The filter coffee is incredible.",
    sentiment: "positive",
    topics: ["Coffee", "Filter Coffee"],
    status: "draft_generated",
    review_draft: {
      id: "rd_3",
      feedback_id: "fb_3",
      original_text: "Best cafe in Udaipur hands down. The filter coffee is incredible.",
      ai_draft: "Without a doubt the best cafe in Udaipur! The filter coffee is absolutely incredible — rich, aromatic, and perfectly brewed. If you're in the city, this is a must-visit.",
      is_edited: false,
      status: "generated",
      created_at: "2026-08-09T14:05:00Z",
    },
    created_at: "2026-08-09T14:00:00Z",
  },
  {
    id: "fb_4",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_3",
    qr_code: MOCK_QR_CODES[2],
    rating: 3,
    text: "Coffee was great and staff was friendly but service was a little slow.",
    sentiment: "neutral",
    topics: ["Coffee", "Staff", "Service Speed"],
    status: "feedback_received",
    created_at: "2026-08-08T18:00:00Z",
  },
  {
    id: "fb_5",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_5",
    qr_code: MOCK_QR_CODES[4],
    rating: 2,
    text: "Waited 30 minutes for a cold coffee. Parking was also very difficult.",
    sentiment: "negative",
    topics: ["Waiting Time", "Parking"],
    status: "feedback_received",
    created_at: "2026-08-07T12:00:00Z",
  },
  {
    id: "fb_6",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_1",
    qr_code: MOCK_QR_CODES[0],
    rating: 5,
    text: "My favourite cafe! The cheesecake is to die for and the staff remembers regular customers.",
    sentiment: "positive",
    topics: ["Cheesecake", "Staff", "Regular Customers"],
    status: "google_opened",
    review_draft: {
      id: "rd_6",
      feedback_id: "fb_6",
      original_text: "My favourite cafe! The cheesecake is to die for and the staff remembers regular customers.",
      ai_draft: "Brew & Bliss is easily my favourite cafe. The cheesecake is absolutely divine, and I love that the staff takes the time to remember regular customers — it makes each visit feel special. Truly a gem!",
      is_edited: false,
      status: "approved",
      created_at: "2026-08-06T15:10:00Z",
    },
    created_at: "2026-08-06T15:05:00Z",
  },
  {
    id: "fb_7",
    business_id: "biz_1",
    branch_id: "br_2",
    branch: MOCK_BRANCHES[1],
    qr_code_id: "qr_7",
    qr_code: MOCK_QR_CODES[6],
    rating: 4,
    text: "Nice setup at the Jaipur branch. Food was good, slightly pricey compared to local cafes.",
    sentiment: "positive",
    topics: ["Setup", "Food", "Pricing"],
    status: "draft_generated",
    review_draft: {
      id: "rd_7",
      feedback_id: "fb_7",
      original_text: "Nice setup at the Jaipur branch. Food was good, slightly pricey compared to local cafes.",
      ai_draft: "Visited the Jaipur branch of Brew & Bliss — the setup is lovely and the food quality is good. It's slightly on the pricier side compared to local alternatives, but the experience justifies it.",
      is_edited: false,
      status: "generated",
      created_at: "2026-08-05T11:15:00Z",
    },
    created_at: "2026-08-05T11:10:00Z",
  },
  {
    id: "fb_8",
    business_id: "biz_1",
    branch_id: "br_1",
    branch: MOCK_BRANCHES[0],
    qr_code_id: "qr_6",
    qr_code: MOCK_QR_CODES[5],
    rating: 5,
    text: "Beautiful lake-view seating. Had the masala chai and chocolate brownie, both were perfect.",
    sentiment: "positive",
    topics: ["Lake View", "Masala Chai", "Brownie"],
    status: "google_opened",
    created_at: "2026-08-04T10:30:00Z",
  },
];

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  total_reviews: 184,
  reviews_trend: 18.4,
  average_rating: 4.7,
  total_feedback: 247,
  feedback_this_week: 24,
  google_actions: 184,
  conversion_rate: 31.4,
};

export const MOCK_SENTIMENT: SentimentBreakdown = {
  positive: 78,
  neutral: 15,
  negative: 7,
};

export const MOCK_TOPICS: TopicCount[] = [
  { topic: "Food Quality", count: 82, sentiment: "positive" },
  { topic: "Staff", count: 54, sentiment: "positive" },
  { topic: "Ambience", count: 37, sentiment: "positive" },
  { topic: "Waiting Time", count: 29, sentiment: "negative" },
  { topic: "Parking", count: 11, sentiment: "negative" },
  { topic: "Coffee", count: 68, sentiment: "positive" },
  { topic: "Pricing", count: 14, sentiment: "negative" },
];

export const MOCK_FUNNEL: FunnelStep[] = [
  { label: "QR Scans", value: 2164 },
  { label: "Feedback", value: 247 },
  { label: "AI Draft", value: 198 },
  { label: "Approved", value: 184 },
  { label: "Google Action", value: 68 },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: "2026-07-14", feedback: 12, ai_drafts: 10, google_actions: 4 },
  { date: "2026-07-21", feedback: 18, ai_drafts: 15, google_actions: 6 },
  { date: "2026-07-28", feedback: 22, ai_drafts: 19, google_actions: 8 },
  { date: "2026-08-04", feedback: 28, ai_drafts: 24, google_actions: 11 },
  { date: "2026-08-07", feedback: 14, ai_drafts: 12, google_actions: 5 },
  { date: "2026-08-10", feedback: 8, ai_drafts: 7, google_actions: 3 },
];

export const MOCK_QR_PERFORMANCE: QRPerformance[] = [
  { qr_name: "Table 01", scans: 421, feedback: 68, conversions: 24 },
  { qr_name: "Table 02", scans: 387, feedback: 52, conversions: 19 },
  { qr_name: "Table 03", scans: 298, feedback: 41, conversions: 15 },
  { qr_name: "Billing Counter", scans: 534, feedback: 47, conversions: 12 },
  { qr_name: "Takeaway", scans: 189, feedback: 22, conversions: 8 },
  { qr_name: "Packaging", scans: 67, feedback: 8, conversions: 2 },
];

export const MOCK_RATING_DISTRIBUTION: RatingDistribution[] = [
  { rating: 5, count: 112 },
  { rating: 4, count: 68 },
  { rating: 3, count: 34 },
  { rating: 2, count: 21 },
  { rating: 1, count: 12 },
];

// ─── Payments ───────────────────────────────────────────────────────────────

export const MOCK_PAYMENTS: Payment[] = [
  { id: "pay_1", organization_id: "org_1", amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "paid", invoice_number: "INV-2026-0008", paid_at: "2026-08-01T00:00:00Z", created_at: "2026-08-01T00:00:00Z" },
  { id: "pay_2", organization_id: "org_1", amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "paid", invoice_number: "INV-2026-0007", paid_at: "2026-07-01T00:00:00Z", created_at: "2026-07-01T00:00:00Z" },
  { id: "pay_3", organization_id: "org_1", amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "paid", invoice_number: "INV-2026-0006", paid_at: "2026-06-01T00:00:00Z", created_at: "2026-06-01T00:00:00Z" },
  { id: "pay_4", organization_id: "org_1", amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "paid", invoice_number: "INV-2026-0005", paid_at: "2026-05-01T00:00:00Z", created_at: "2026-05-01T00:00:00Z" },
  { id: "pay_5", organization_id: "org_1", amount: 499, currency: "INR", plan_id: "plan_starter", plan: MOCK_PLANS[0], status: "paid", invoice_number: "INV-2026-0004", paid_at: "2026-04-01T00:00:00Z", created_at: "2026-04-01T00:00:00Z" },
  { id: "pay_6", organization_id: "org_1", amount: 499, currency: "INR", plan_id: "plan_starter", plan: MOCK_PLANS[0], status: "paid", invoice_number: "INV-2026-0003", paid_at: "2026-03-01T00:00:00Z", created_at: "2026-03-01T00:00:00Z" },
];

// ─── Usage ──────────────────────────────────────────────────────────────────

export const MOCK_USAGE = {
  ai_generations: { current: 1832, limit: 2000 },
  feedback: { current: 1420, limit: 2000 },
  qr_codes: { current: 8, limit: 20 },
  branches: { current: 2, limit: 3 },
};

// ─── Admin ──────────────────────────────────────────────────────────────────

export const MOCK_ADMIN_STATS: AdminDashboardStats = {
  total_businesses: 48,
  active_subscriptions: 41,
  mrr: 40000,
  total_ai_generations: 18421,
  total_feedback: 31284,
};

export const MOCK_ADMIN_BUSINESSES: AdminBusinessView[] = [
  {
    ...MOCK_BUSINESS,
    owner: MOCK_CURRENT_USER,
    plan: MOCK_PLANS[1],
    review_count: 184,
    feedback_count: 247,
  },
  {
    id: "biz_2",
    organization_id: "org_2",
    name: "Spice Garden",
    slug: "spicegarden",
    category: "restaurant",
    description: "Authentic Rajasthani cuisine with a modern twist",
    phone: "+91 99820 45678",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    default_language: "en",
    ai_tone: "professional",
    review_length: "medium",
    is_active: true,
    created_at: "2026-02-20T09:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
    owner: { id: "usr_5", name: "Meera Rathore", email: "meera@spicegarden.in", role: "owner", created_at: "2026-02-20T09:00:00Z", updated_at: "2026-08-10T10:00:00Z" },
    plan: MOCK_PLANS[1],
    review_count: 312,
    feedback_count: 456,
  },
  {
    id: "biz_3",
    organization_id: "org_3",
    name: "Lakeside Luxe Hotel",
    slug: "lakesideluxe",
    category: "hotel",
    description: "Premium lakeside hotel with spa and fine dining",
    phone: "+91 94140 11111",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    default_language: "en",
    ai_tone: "formal",
    review_length: "long",
    is_active: true,
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
    owner: { id: "usr_6", name: "Vikram Singh", email: "vikram@lakesideluxe.in", role: "owner", created_at: "2026-03-01T09:00:00Z", updated_at: "2026-08-10T10:00:00Z" },
    plan: MOCK_PLANS[2],
    review_count: 89,
    feedback_count: 134,
  },
  {
    id: "biz_4",
    organization_id: "org_4",
    name: "Glow Beauty Studio",
    slug: "glowbeauty",
    category: "salon_spa",
    description: "Premium beauty and wellness studio",
    phone: "+91 98290 77777",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    default_language: "en",
    ai_tone: "friendly",
    review_length: "medium",
    is_active: true,
    created_at: "2026-04-15T09:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
    owner: { id: "usr_7", name: "Kavita Patel", email: "kavita@glowbeauty.in", role: "owner", created_at: "2026-04-15T09:00:00Z", updated_at: "2026-08-10T10:00:00Z" },
    plan: MOCK_PLANS[0],
    review_count: 45,
    feedback_count: 67,
  },
  {
    id: "biz_5",
    organization_id: "org_5",
    name: "FitZone Gym",
    slug: "fitzone",
    category: "gym_fitness",
    description: "Modern fitness center with personal training",
    phone: "+91 98765 12345",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    default_language: "en",
    ai_tone: "casual",
    review_length: "short",
    is_active: true,
    created_at: "2026-05-01T09:00:00Z",
    updated_at: "2026-08-10T10:00:00Z",
    owner: { id: "usr_8", name: "Rohit Desai", email: "rohit@fitzone.in", role: "owner", created_at: "2026-05-01T09:00:00Z", updated_at: "2026-08-10T10:00:00Z" },
    plan: MOCK_PLANS[1],
    review_count: 156,
    feedback_count: 198,
  },
];

// ─── Admin Charts ───────────────────────────────────────────────────────────

export const MOCK_ADMIN_NEW_BUSINESSES: ChartDataPoint[] = [
  { date: "2026-03", feedback: 5, ai_drafts: 0, google_actions: 0 },
  { date: "2026-04", feedback: 8, ai_drafts: 0, google_actions: 0 },
  { date: "2026-05", feedback: 6, ai_drafts: 0, google_actions: 0 },
  { date: "2026-06", feedback: 12, ai_drafts: 0, google_actions: 0 },
  { date: "2026-07", feedback: 9, ai_drafts: 0, google_actions: 0 },
  { date: "2026-08", feedback: 8, ai_drafts: 0, google_actions: 0 },
];

export const MOCK_ADMIN_MRR_DATA = [
  { date: "2026-03", mrr: 12500 },
  { date: "2026-04", mrr: 18000 },
  { date: "2026-05", mrr: 22500 },
  { date: "2026-06", mrr: 28000 },
  { date: "2026-07", mrr: 35000 },
  { date: "2026-08", mrr: 40000 },
];

export const MOCK_ADMIN_SUBSCRIPTION_DIST = [
  { name: "Starter", value: 18, color: "var(--chart-1)" },
  { name: "Growth", value: 16, color: "var(--chart-2)" },
  { name: "Pro", value: 7, color: "var(--chart-3)" },
  { name: "Trial", value: 7, color: "var(--chart-4)" },
];

// ─── Admin Payments ─────────────────────────────────────────────────────────

export const MOCK_ADMIN_PAYMENTS: Payment[] = [
  { id: "pay_a1", organization_id: "org_1", organization: MOCK_ORGANIZATION, amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "paid", invoice_number: "INV-2026-0048", paid_at: "2026-08-01T00:00:00Z", created_at: "2026-08-01T00:00:00Z" },
  { id: "pay_a2", organization_id: "org_2", amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "paid", invoice_number: "INV-2026-0047", paid_at: "2026-08-01T00:00:00Z", created_at: "2026-08-01T00:00:00Z" },
  { id: "pay_a3", organization_id: "org_3", amount: 2499, currency: "INR", plan_id: "plan_pro", plan: MOCK_PLANS[2], status: "paid", invoice_number: "INV-2026-0046", paid_at: "2026-08-01T00:00:00Z", created_at: "2026-08-01T00:00:00Z" },
  { id: "pay_a4", organization_id: "org_4", amount: 499, currency: "INR", plan_id: "plan_starter", plan: MOCK_PLANS[0], status: "pending", invoice_number: "INV-2026-0045", created_at: "2026-08-01T00:00:00Z" },
  { id: "pay_a5", organization_id: "org_5", amount: 999, currency: "INR", plan_id: "plan_growth", plan: MOCK_PLANS[1], status: "failed", invoice_number: "INV-2026-0044", created_at: "2026-07-30T00:00:00Z" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getCategoryLabel(id: BusinessCategory): string {
  return BUSINESS_CATEGORIES.find(c => c.id === id)?.label || id;
}

export function getCategoryDimensions(id: BusinessCategory): string[] {
  return BUSINESS_CATEGORIES.find(c => c.id === id)?.dimensions || [];
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}
