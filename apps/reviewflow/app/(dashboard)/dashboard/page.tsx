"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardStats, SentimentBreakdown, TopicCount, FunnelStep, ChartDataPoint, Feedback } from "@/lib/types";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_SENTIMENT,
  MOCK_TOPICS,
  MOCK_FUNNEL,
  MOCK_CHART_DATA,
  MOCK_FEEDBACK,
} from "@/lib/mock-data";
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
  const businessName = user?.name ? user.name.split(" ")[0] : "Brew & Bliss";

  const { data: stats = MOCK_DASHBOARD_STATS } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: () => api.get<DashboardStats>(endpoints.dashboardStats),
  });

  const { data: sentiment = MOCK_SENTIMENT } = useQuery<SentimentBreakdown>({
    queryKey: ["dashboardSentiment"],
    queryFn: () => api.get<SentimentBreakdown>(endpoints.dashboardSentiment),
  });

  const { data: topics = MOCK_TOPICS } = useQuery<TopicCount[]>({
    queryKey: ["dashboardTopics"],
    queryFn: () => api.get<TopicCount[]>(endpoints.dashboardTopics),
  });

  const { data: funnel = MOCK_FUNNEL } = useQuery<FunnelStep[]>({
    queryKey: ["dashboardFunnel"],
    queryFn: () => api.get<FunnelStep[]>(endpoints.dashboardFunnel),
  });

  const { data: chartData = MOCK_CHART_DATA } = useQuery<ChartDataPoint[]>({
    queryKey: ["dashboardChart"],
    queryFn: () => api.get<ChartDataPoint[]>(endpoints.dashboardChart),
  });

  const { data: feedbackList = MOCK_FEEDBACK } = useQuery<Feedback[]>({
    queryKey: ["dashboardRecentFeedback"],
    queryFn: () => api.get<Feedback[]>(endpoints.dashboardRecentFeedback),
  });

  // Pie chart data for sentiment
  const pieData = [
    { name: "Positive", value: sentiment.positive, color: "var(--success)" },
    { name: "Neutral", value: sentiment.neutral, color: "var(--warning)" },
    { name: "Negative", value: sentiment.negative, color: "var(--destructive)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Good morning, {businessName}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s how your customer feedback is performing.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Reviews"
          value={stats.total_reviews}
          trend={stats.reviews_trend}
          trendLabel="vs last month"
          icon={Star}
        />
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Average Rating</span>
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="size-4 text-primary" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">{stats.average_rating}</span>
          </div>
          <div className="mt-1">
            <RatingStars rating={Math.round(stats.average_rating)} size="sm" />
          </div>
        </div>
        <StatCard
          label="Feedback"
          value={stats.total_feedback}
          trend={stats.feedback_this_week}
          trendLabel="this week"
          icon={MessageSquare}
        />
        <StatCard
          label="Google Actions"
          value={stats.google_actions}
          trend={stats.conversion_rate}
          trendLabel="conversion rate"
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Daily feedback volume, generated drafts, and Google clicks</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDrafts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="feedback"
                  stroke="var(--chart-1)"
                  fillOpacity={1}
                  fill="url(#colorFeedback)"
                  name="Feedback"
                />
                <Area
                  type="monotone"
                  dataKey="ai_drafts"
                  stroke="var(--chart-2)"
                  fillOpacity={1}
                  fill="url(#colorDrafts)"
                  name="AI Drafts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Customer Sentiment</CardTitle>
            <CardDescription>Ratio of positive, neutral and negative feedback</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-80 gap-4">
            <div className="h-40 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground">{sentiment.positive}%</span>
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-widest">Positive</span>
              </div>
            </div>
            <div className="flex justify-around w-full gap-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <span className="text-sm font-semibold">{item.value}%</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Funnel Flow & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Review Funnel Conversion</CardTitle>
            <CardDescription>Conversion metrics from scanning QR to Google actions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-5 gap-3">
              {funnel.map((step, idx) => {
                const prevStep = idx > 0 ? funnel[idx - 1] : null;
                const dropRate = prevStep
                  ? Math.round((step.value / prevStep.value) * 100)
                  : 100;

                return (
                  <div key={step.label} className="flex flex-col items-center gap-2 relative">
                    <div className="w-full text-center p-3 rounded-lg border border-border bg-muted/30 flex flex-col justify-center items-center h-20">
                      <span className="text-base font-bold text-foreground">{step.value.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{step.label}</span>
                    </div>
                    {idx < funnel.length - 1 && (
                      <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:block">
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    {idx > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {dropRate}% retention
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>What Customers Talk About</CardTitle>
            <CardDescription>Most mentioned tags analyzed by AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <ThumbsUp className="size-3" /> Positive highlights
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topics
                  .filter((t) => t.sentiment === "positive")
                  .slice(0, 3)
                  .map((t) => (
                    <span
                      key={t.topic}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full"
                    >
                      {t.topic} ({t.count})
                    </span>
                  ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1">
                <ThumbsDown className="size-3" /> Area of improvement
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topics
                  .filter((t) => t.sentiment === "negative")
                  .slice(0, 3)
                  .map((t) => (
                    <span
                      key={t.topic}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full"
                    >
                      {t.topic} ({t.count})
                    </span>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Live customer feedback submissions</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/feedback">View All Feedback</a>
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbackList.slice(0, 3).map((item) => (
            <FeedbackCard key={item.id} feedback={item} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
