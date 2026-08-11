"use client";

import { cn } from "@repo/ui/lib/utils";
import { RatingStars } from "./rating-stars";
import { SentimentBadge } from "./sentiment-badge";
import { StatusBadge } from "./status-badge";
import type { Feedback } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { QrCode } from "lucide-react";

interface FeedbackCardProps {
  feedback: Feedback;
  onClick?: () => void;
  className?: string;
}

export function FeedbackCard({ feedback, onClick, className }: FeedbackCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 flex flex-col gap-3 cursor-pointer hover:border-primary/30 transition-colors",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RatingStars rating={feedback.rating} size="sm" />
          <SentimentBadge sentiment={feedback.sentiment} />
        </div>
        <StatusBadge status={feedback.status} />
      </div>

      <p className="text-sm text-foreground line-clamp-2">{feedback.text}</p>

      {feedback.review_draft && (
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1">AI Draft</p>
          <p className="text-xs text-foreground/80 line-clamp-2 italic">
            {feedback.review_draft.ai_draft}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {feedback.qr_code && (
            <span className="flex items-center gap-1">
              <QrCode className="size-3" />
              {feedback.qr_code.name}
            </span>
          )}
          {feedback.branch && (
            <span>{feedback.branch.name}</span>
          )}
        </div>
        <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
      </div>
    </div>
  );
}
