"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardStats, SentimentBreakdown, TopicCount, FunnelStep, ChartDataPoint, Feedback } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { RatingStars } from "@/components/ui/rating-stars";
import { FeedbackCard } from "@/components/ui/feedback-card";
import {
  Star,
  MessageSquare,
  QrCode,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const { data: business } = useQuery<any>({
    queryKey: ["business"],
    queryFn: () => api.get<any>(endpoints.business),
    enabled: !!user,
  });

  const businessDisplayName = business?.name || user?.name || "My Business";

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => api.get<DashboardStats>(endpoints.dashboardStats),
  });

  const { data: sentiment = { positive: 100, neutral: 0, negative: 0 } } = useQuery<SentimentBreakdown>({
    queryKey: ["dashboardSentiment"],
    queryFn: () => api.get<SentimentBreakdown>(endpoints.dashboardSentiment),
  });

  const { data: topics = [] } = useQuery<TopicCount[]>({
    queryKey: ["dashboardTopics"],
    queryFn: () => api.get<TopicCount[]>(endpoints.dashboardTopics),
  });

  const { data: funnel = [] } = useQuery<FunnelStep[]>({
    queryKey: ["dashboardFunnel"],
    queryFn: () => api.get<FunnelStep[]>(endpoints.dashboardFunnel),
  });

  const { data: chartData = [] } = useQuery<ChartDataPoint[]>({
    queryKey: ["dashboardChart"],
    queryFn: () => api.get<ChartDataPoint[]>(endpoints.dashboardChart),
  });

  const { data: feedbackList = [] } = useQuery<Feedback[]>({
    queryKey: ["dashboardRecentFeedback"],
    queryFn: () => api.get<Feedback[]>(endpoints.dashboardRecentFeedback),
  });

  const liveStats: DashboardStats = stats || {
    total_reviews: 0,
    reviews_trend: 0,
    average_rating: 5.0,
    total_feedback: 0,
    feedback_this_week: 0,
    google_actions: 0,
    conversion_rate: 0,
  };

  // Pie chart data for sentiment
  const pieData = [
    { name: "Positive", value: sentiment.positive, color: "var(--success)" },
    { name: "Neutral", value: sentiment.neutral, color: "var(--warning)" },
    { name: "Negative", value: sentiment.negative, color: "var(--destructive)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back, {user?.name || "Owner"}!</h1>
          <p className="text-sm text-muted-foreground">Here is the performance overview for <span className="font-semibold text-foreground">{businessDisplayName}</span>.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(business?.google_review_url || "#", "_blank")}>
            <Award className="size-4 text-primary" /> View Google Page
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => window.location.href = "/dashboard/qr-codes"}>
            <QrCode className="size-4" /> Download QR
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Google Reviews"
          value={liveStats.total_reviews}
          icon={Star}
          trend={{ value: liveStats.reviews_trend, label: "vs last month" }}
        />
        <StatCard
          title="Average Rating"
          value={liveStats.average_rating.toFixed(1)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Feedback"
          value={liveStats.total_feedback}
          icon={MessageSquare}
          description={`${liveStats.feedback_this_week} this week`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${liveStats.conversion_rate}%`}
          icon={QrCode}
          description="Scan to Google Review"
        />
      </div>

      {/* Review Velocity & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Review Velocity</CardTitle>
            <CardDescription>Daily customer feedback, AI drafts, and Google conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area type="monotone" dataKey="feedback" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorFeedback)" name="Feedback" />
                  <Area type="monotone" dataKey="google_actions" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorGoogle)" name="Google Action" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Conversions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>QR Scan to Published Google Review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnel.map((step, index) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">{step.label}</span>
                  <span className="text-foreground">{step.value}</span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${funnel[0]?.value ? Math.min(100, Math.round((step.value / (funnel[0]?.value || 1)) * 100)) : 100}%`,
                      opacity: 1 - index * 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sentiment & Topics & Recent Feedbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Analysis */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" /> AI Sentiment Analysis
            </CardTitle>
            <CardDescription>Real-time customer satisfaction sentiment</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            <div className="h-[180px] w-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground">{sentiment.positive}%</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Positive</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-4 w-full border-t border-border pt-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span>Positive ({sentiment.positive}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span>Neutral ({sentiment.neutral}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500" />
                <span>Negative ({sentiment.negative}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Keywords / Topics */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Top Extracted Topics</CardTitle>
            <CardDescription>Key themes mentioned in customer reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.slice(0, 5).map((t) => (
              <div key={t.topic} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                <span className="font-semibold text-foreground">{t.topic}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">{t.count} mentions</span>
                  {t.sentiment === "positive" ? (
                    <ThumbsUp className="size-3.5 text-emerald-600" />
                  ) : (
                    <ThumbsDown className="size-3.5 text-rose-600" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Feedback Column */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Feedbacks</CardTitle>
              <CardDescription>Live incoming reviews</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => window.location.href = "/dashboard/feedback"}>
              View All <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedbackList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No customer feedbacks yet. Share your QR code to start collecting reviews!
              </div>
            ) : (
              feedbackList.slice(0, 3).map((fb) => (
                <div key={fb.id} className="p-3 rounded-lg border border-border/50 bg-card space-y-1.5">
                  <div className="flex justify-between items-center">
                    <RatingStars rating={fb.rating} size="sm" />
                    <span className="text-[10px] text-muted-foreground">
                      {fb.qr_code?.name || "QR"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                    &quot;{fb.text}&quot;
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
