"use client";

import { cn } from "../../lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  suffix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  suffix,
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
          {suffix && <span className="text-base font-medium text-muted-foreground ml-0.5">{suffix}</span>}
        </span>
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center gap-1.5">
          {trend !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
                isPositive
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-red-700 bg-red-50"
              )}
            >
              {isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {isPositive ? "+" : ""}
              {trend}%
            </span>
          )}
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
