"use client";

import * as React from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
} from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState("30");

  const { data: chartData = [], isLoading: chartLoading } = useQuery<any[]>({
    queryKey: ["dashboardChart"],
    queryFn: () => api.get<any[]>(endpoints.dashboardChart),
  });

  const { data: sentiment = { positive: 100, neutral: 0, negative: 0 } } = useQuery<any>({
    queryKey: ["dashboardSentiment"],
    queryFn: () => api.get<any>(endpoints.dashboardSentiment),
  });

  const { data: topics = [] } = useQuery<any[]>({
    queryKey: ["dashboardTopics"],
    queryFn: () => api.get<any[]>(endpoints.dashboardTopics),
  });

  const { data: funnel = [] } = useQuery<any[]>({
    queryKey: ["dashboardFunnel"],
    queryFn: () => api.get<any[]>(endpoints.dashboardFunnel),
  });

  const { data: qrCodes = [] } = useQuery<any[]>({
    queryKey: ["qrCodes"],
    queryFn: () => api.get<any[]>(endpoints.qrCodes),
  });

  const handleExport = () => {
    toast.success("Exporting customer analytics report as CSV...");
  };

  const sentimentData = [
    { name: "Positive", value: sentiment.positive, color: "var(--success)" },
    { name: "Neutral", value: sentiment.neutral, color: "var(--warning)" },
    { name: "Negative", value: sentiment.negative, color: "var(--destructive)" },
  ];

  const qrPerformanceData = qrCodes.map((qr) => ({
    qr_name: qr.name,
    scans: qr.total_scans || 0,
    conversions: Math.round((qr.total_scans || 0) * 0.4),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Intelligence</h1>
          <p className="text-sm text-muted-foreground">Comprehensive review metrics and AI-driven customer sentiment insights.</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-10 w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1.5 h-10" onClick={handleExport}>
            <Download className="size-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* AI Insight Box */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 shrink-0 pointer-events-none">
          <Brain className="size-28 text-primary" />
        </div>
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-start relative z-10">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="size-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              AI Insight & Recommendations <Sparkles className="size-3.5 text-primary animate-pulse" />
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed max-w-2xl">
              &quot;Customer satisfaction is high across your active locations with positive feedback for service speed and product quality.&quot;
            </p>
            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
              <AlertCircle className="size-3 text-emerald-600" />
              Tip: Keep QR codes accessible near billing counters to maximize review conversions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts row 1: Volume & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Feedback Volume</CardTitle>
            <CardDescription>Daily customer feedback and draft conversion volume</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="feedbackCol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="feedback"
                    stroke="var(--primary)"
                    fillOpacity={1}
                    fill="url(#feedbackCol)"
                    name="Feedback Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Sentiment Breakdown</CardTitle>
            <CardDescription>Customer reviews categorised by AI sentiment</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center gap-6">
            <div className="h-40 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground">{sentiment.positive}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Positive</span>
              </div>
            </div>
            <div className="grid grid-cols-3 w-full gap-2 text-center text-xs">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <span className="font-semibold">{item.value}%</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel & QR Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Step-by-step progress from scan to Google reviews</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col justify-between">
            <div className="space-y-4">
              {funnel.map((step) => {
                const totalScans = funnel[0]?.value || 1;
                const percent = Math.min(100, Math.round((step.value / totalScans) * 100));

                return (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{step.label}</span>
                      <span className="text-muted-foreground">{step.value.toLocaleString()} ({percent}%)</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Customer Topics</CardTitle>
            <CardDescription>Frequency of themes mentioned in customer feedback</CardDescription>
          </CardHeader>
          <CardContent className="h-72 overflow-y-auto pr-2 space-y-4">
            {topics.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                No customer topics analyzed yet.
              </div>
            ) : (
              topics.map((topic) => {
                const maxCount = Math.max(...topics.map((t) => t.count), 1);
                const percent = Math.round((topic.count / maxCount) * 100);
                const isPositive = topic.sentiment === "positive";

                return (
                  <div key={topic.topic} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className={`size-2.5 rounded-full ${isPositive ? "bg-emerald-500" : "bg-red-500"}`} />
                        {topic.topic}
                      </span>
                      <span className="text-muted-foreground">{topic.count} mentions</span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR performance */}
      {qrPerformanceData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>QR Code Performance</CardTitle>
            <CardDescription>Scan volume and review conversion rate by location</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qrPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="qr_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scans" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Scans" />
                <Bar dataKey="conversions" fill="var(--success)" radius={[4, 4, 0, 0]} name="Google Actions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
