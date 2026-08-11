"use client";

import * as React from "react";
import {
  MOCK_ADMIN_STATS,
  MOCK_ADMIN_NEW_BUSINESSES,
  MOCK_ADMIN_MRR_DATA,
  MOCK_ADMIN_SUBSCRIPTION_DIST,
} from "@/lib/mock-data";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  Building2,
  CreditCard,
  Coins,
  Brain,
  MessageSquare,
  TrendingUp,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function AdminOverviewPage() {
  const stats = MOCK_ADMIN_STATS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Super Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform health, subscriptions and AI model consumption stats.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Businesses" value={stats.total_businesses} icon={Building2} />
        <StatCard label="Subscriptions" value={stats.active_subscriptions} icon={CreditCard} />
        <StatCard
          label="MRR"
          value={stats.mrr}
          suffix=" INR"
          icon={Coins}
        />
        <StatCard label="AI Generations" value={stats.total_ai_generations} icon={Brain} />
        <StatCard label="Total Feedbacks" value={stats.total_feedback} icon={MessageSquare} />
      </div>

      {/* Charts Row 1: MRR & Business Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>MRR Growth (INR)</CardTitle>
            <CardDescription>Monthly Recurring Revenue performance over last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ADMIN_MRR_DATA}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--chart-1)"
                  fillOpacity={1}
                  fill="url(#colorMrr)"
                  name="MRR"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>New Business Onboardings</CardTitle>
            <CardDescription>Monthly growth count of newly onboarded SaaS accounts</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ADMIN_NEW_BUSINESSES}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="feedback" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Onboarded Businesses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown & AI Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Breakdown of active plan levels across customer base</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center gap-6">
            <div className="h-40 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_ADMIN_SUBSCRIPTION_DIST}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MOCK_ADMIN_SUBSCRIPTION_DIST.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground">41</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Active plans</span>
              </div>
            </div>
            <div className="grid grid-cols-2 w-full gap-2 text-center text-xs">
              {MOCK_ADMIN_SUBSCRIPTION_DIST.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <span className="font-semibold">{item.value} businesses</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Platform AI Generation Load</CardTitle>
            <CardDescription>Daily generation counts across all registered entities</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ADMIN_NEW_BUSINESSES}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="feedback" stroke="var(--chart-3)" strokeWidth={2} name="AI Drafts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
