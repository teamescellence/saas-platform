"use client";

import { cn } from "@repo/ui/lib/utils";

interface UsageProgressProps {
  label: string;
  current: number;
  limit: number;
  className?: string;
}

export function UsageProgress({
  label,
  current,
  limit,
  className,
}: UsageProgressProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {current.toLocaleString("en-IN")} / {limit.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isCritical
              ? "bg-destructive"
              : isWarning
              ? "bg-amber-500"
              : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isCritical && (
        <p className="text-xs text-destructive font-medium">
          Approaching limit. Consider upgrading your plan.
        </p>
      )}
    </div>
  );
}
