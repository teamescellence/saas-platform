"use client";

import { cn } from "@repo/ui/lib/utils";

interface LoadingStateProps {
  variant?: "card" | "table" | "chart" | "page";
  count?: number;
  className?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="size-9 rounded-lg" />
      </div>
      <SkeletonBlock className="h-8 w-20" />
      <SkeletonBlock className="h-4 w-16" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-8 w-24" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="p-4 border-b border-border last:border-0 flex items-center gap-4">
          <SkeletonBlock className="h-4 w-1/4" />
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-4 w-1/6" />
          <SkeletonBlock className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-8 w-24" />
      </div>
      <SkeletonBlock className="h-64 w-full rounded-lg" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
        <SkeletonBlock className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}

export function LoadingState({ variant = "page", count = 1, className }: LoadingStateProps) {
  return (
    <div className={cn("animate-in fade-in-50", className)}>
      {variant === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      {variant === "table" && <TableSkeleton rows={count} />}
      {variant === "chart" && <ChartSkeleton />}
      {variant === "page" && <PageSkeleton />}
    </div>
  );
}
