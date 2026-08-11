"use client";

import { cn } from "@repo/ui/lib/utils";

type SentimentType = "positive" | "neutral" | "negative";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  className?: string;
}

const sentimentConfig: Record<SentimentType, { label: string; classes: string }> = {
  positive: { label: "Positive", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  neutral: { label: "Neutral", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  negative: { label: "Negative", classes: "bg-red-50 text-red-700 border-red-200" },
};

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
