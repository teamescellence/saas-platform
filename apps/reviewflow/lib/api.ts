import type { ApiResponse, PaginatedResponse, ApiError } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.reviewflow.in/api/v1";

class ReviewFlowApi {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: "An unexpected error occurred",
        status: response.status,
      };
      try {
        const body = await response.json();
        error.message = body.message || error.message;
        error.errors = body.errors;
      } catch {
        // Response body is not JSON
      }
      throw error;
    }
    return response.json();
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ReviewFlowApi(API_BASE_URL);

// ─── Typed API endpoints ────────────────────────────────────────────────────
// These will be used with TanStack Query hooks.
// For now they serve as documentation; actual implementation connects later.

export const endpoints = {
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  logout: "/auth/logout",
  me: "/auth/me",

  // Public
  publicReviewSession: (token: string) => `/public/review/${token}`,
  publicSubmitFeedback: (token: string) => `/public/review/${token}/feedback`,
  publicGenerateDraft: (token: string) => `/public/review/${token}/generate`,

  // Business Dashboard
  dashboardStats: "/dashboard/stats",
  dashboardChart: "/dashboard/chart",
  dashboardFunnel: "/dashboard/funnel",
  dashboardSentiment: "/dashboard/sentiment",
  dashboardTopics: "/dashboard/topics",
  dashboardRecentFeedback: "/dashboard/recent-feedback",

  // Reviews
  reviews: "/reviews",
  reviewById: (id: string) => `/reviews/${id}`,
  generateDraft: (id: string) => `/reviews/${id}/generate-draft`,

  // Feedback
  feedback: "/feedback",
  feedbackById: (id: string) => `/feedback/${id}`,

  // QR Codes
  qrCodes: "/qr-codes",
  qrCodeById: (id: string) => `/qr-codes/${id}`,

  // Analytics
  analyticsVolume: "/analytics/volume",
  analyticsRatings: "/analytics/ratings",
  analyticsQRPerformance: "/analytics/qr-performance",
  analyticsFunnel: "/analytics/funnel",
  analyticsSentiment: "/analytics/sentiment",
  analyticsTopics: "/analytics/topics",

  // Team
  team: "/team",
  teamInvite: "/team/invite",
  teamMember: (id: string) => `/team/${id}`,

  // Business
  business: "/business",
  businessUpdate: "/business",
  branches: "/branches",


  // Subscription
  subscription: "/subscription",
  subscriptionPlans: "/subscription/plans",
  subscriptionBilling: "/subscription/billing-history",

  // Admin
  adminStats: "/admin/stats",
  adminBusinesses: "/admin/businesses",
  adminBusinessById: (id: string) => `/admin/businesses/${id}`,
  adminUsers: "/admin/users",
  adminPlans: "/admin/plans",
  adminPlanById: (id: string) => `/admin/plans/${id}`,
  adminSubscriptions: "/admin/subscriptions",
  adminPayments: "/admin/payments",
  adminUsage: "/admin/usage",
  adminQRCodes: "/admin/qr-codes",
  adminAIUsage: "/admin/ai-usage",
} as const;
