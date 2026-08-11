import Link from "next/link";
import {
  Star,
  QrCode,
  MessageSquare,
  Sparkles,
  Check,
  ArrowRight,
  Coffee,
  UtensilsCrossed,
  Hotel,
  Scissors,
  Stethoscope,
  ShoppingBag,
  Armchair,
  Dumbbell,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { MOCK_PLANS } from "@/lib/mock-data";
import { PlanCard } from "@/components/ui/plan-card";

export const metadata = {
  title: "ReviewFlow — Turn Real Customer Experiences into Better Reviews",
  description: "ReviewFlow helps customers share genuine feedback without struggling to figure out what to write. AI-powered review assistant for local businesses.",
};

const HOW_IT_WORKS = [
  { step: 1, icon: QrCode, title: "Customer scans QR", description: "Place QR codes on tables, counters, or packaging. Customers scan with any phone camera." },
  { step: 2, icon: MessageSquare, title: "Gives a rating & feedback", description: "Simple star rating and a short text about their experience. Takes under 30 seconds." },
  { step: 3, icon: Sparkles, title: "AI polishes their words", description: "ReviewFlow improves grammar and readability while preserving the customer's authentic voice." },
  { step: 4, icon: Check, title: "Customer approves & continues", description: "The customer reviews the polished text, makes any edits, and continues to Google." },
];

const INDUSTRIES = [
  { icon: Coffee, label: "Cafe", description: "Food · Service · Ambience" },
  { icon: UtensilsCrossed, label: "Restaurant", description: "Food · Service · Ambience" },
  { icon: Hotel, label: "Hotel", description: "Room · Cleanliness · Staff" },
  { icon: Scissors, label: "Salon & Spa", description: "Service · Staff · Experience" },
  { icon: Stethoscope, label: "Clinic", description: "Appointment · Staff · Cleanliness" },
  { icon: ShoppingBag, label: "Retail", description: "Product · Staff · Shopping" },
  { icon: Armchair, label: "Furniture", description: "Quality · Delivery · Installation" },
  { icon: Dumbbell, label: "Gym & Fitness", description: "Equipment · Trainers · Environment" },
];

const POSITIVE_TOPICS = [
  { label: "Food Quality", count: 82 },
  { label: "Friendly Staff", count: 54 },
  { label: "Ambience", count: 37 },
];

const NEGATIVE_TOPICS = [
  { label: "Waiting Time", count: 29 },
  { label: "Parking", count: 11 },
  { label: "Pricing", count: 8 },
];

const DASHBOARD_FEATURES = [
  { icon: Star, label: "Reviews", value: "184" },
  { icon: BarChart3, label: "Avg Rating", value: "4.7" },
  { icon: MessageSquare, label: "Feedback", value: "247" },
  { icon: QrCode, label: "QR Scans", value: "2,164" },
  { icon: TrendingUp, label: "Conversion", value: "31.4%" },
  { icon: Sparkles, label: "AI Drafts", value: "198" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6">
              <Sparkles className="size-3.5" />
              AI-powered review assistant
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Turn real customer experiences into{" "}
              <span className="text-primary">better reviews</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              ReviewFlow helps customers share genuine feedback without struggling to figure out what to write.
              No fake reviews. No fabricated experiences. Just better words for real stories.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="h-12 px-8 text-sm" asChild>
                <Link href="/register">
                  Start Free
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-sm" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>

          {/* Hero Visual — Mini Review Flow */}
          <div className="mt-16 max-w-lg mx-auto">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Coffee className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Brew & Bliss</p>
                  <p className="text-xs text-muted-foreground">Udaipur, Rajasthan</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="rounded-lg bg-muted/50 p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Customer said:</p>
                <p className="text-sm italic">&quot;Great coffee, staff was very nice&quot;</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="size-3 text-primary" />
                  <p className="text-xs font-semibold text-primary">AI Polished</p>
                </div>
                <p className="text-sm">&quot;Had a wonderful experience at Brew & Bliss. The coffee was excellent and the staff were incredibly warm and welcoming. Highly recommend!&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">How ReviewFlow works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Four simple steps from feedback to Google review. Under 60 seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative rounded-xl border border-border bg-background p-6 flex flex-col items-start gap-4">
                <div className="flex items-center gap-3">
                  <span className="size-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <item.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Industries ────────────────────────────────────────────────── */}
      <section id="industries" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Built for every local business</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              ReviewFlow adapts its AI to understand your industry and your customers.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.map((industry) => (
              <div key={industry.label} className="rounded-xl border border-border bg-card p-5 flex flex-col items-center text-center gap-3 hover:border-primary/30 transition-colors">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <industry.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">{industry.label}</h3>
                <p className="text-xs text-muted-foreground">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dashboard Preview ─────────────────────────────────────────── */}
      <section id="product" className="py-20 md:py-28 bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Your review command centre</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Track feedback, ratings, QR performance, and AI-generated drafts — all in one dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DASHBOARD_FEATURES.map((feat) => (
              <div key={feat.label} className="rounded-xl border border-border bg-background p-5 flex items-center gap-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feat.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{feat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{feat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Review Intelligence ───────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Understand what customers really think</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              ReviewFlow analyses recurring themes so you know exactly what to improve and what to celebrate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Positive */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="size-5 text-emerald-600" />
                <h3 className="text-base font-semibold text-emerald-900">Customers love</h3>
              </div>
              <div className="space-y-3">
                {POSITIVE_TOPICS.map((topic) => (
                  <div key={topic.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-800">{topic.label}</span>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                      {topic.count} mentions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative */}
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsDown className="size-5 text-red-600" />
                <h3 className="text-base font-semibold text-red-900">Common complaints</h3>
              </div>
              <div className="space-y-3">
                {NEGATIVE_TOPICS.map((topic) => (
                  <div key={topic.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">{topic.label}</span>
                    <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                      {topic.count} mentions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Section ─────────────────────────────────────────────── */}
      <section className="py-16 bg-card border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <Shield className="size-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1">No fake reviews</h4>
                <p className="text-sm text-muted-foreground">AI only improves what the customer actually said. Never invents experiences.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="size-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1">Under 60 seconds</h4>
                <p className="text-sm text-muted-foreground">Customers complete the entire flow in less than a minute. No app, no login.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="size-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold mb-1">Made for India</h4>
                <p className="text-sm text-muted-foreground">Designed for Indian local businesses with INR pricing and regional context.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free. Upgrade when you need more. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {MOCK_PLANS.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isPopular={index === 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-primary/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to get better reviews?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
            Join businesses across India who are turning customer feedback into authentic, polished Google reviews.
          </p>
          <Button size="lg" className="h-12 px-8 text-sm" asChild>
            <Link href="/register">
              Get Started Free
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
