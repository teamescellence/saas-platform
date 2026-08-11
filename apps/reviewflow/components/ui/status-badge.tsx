"use client";

import { cn } from "@repo/ui/lib/utils";
import type { FeedbackStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: FeedbackStatus;
  className?: string;
}

const statusConfig: Record<FeedbackStatus, { label: string; classes: string }> = {
  feedback_received: { label: "Feedback Received", classes: "bg-slate-100 text-slate-600 border-slate-200" },
  draft_generated: { label: "Draft Generated", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  draft_approved: { label: "Draft Approved", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  google_opened: { label: "Google Opened", classes: "bg-violet-50 text-violet-700 border-violet-200" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const fallback = {
    label: typeof status === "string" ? status.replace(/_/g, " ") : "Pending",
    classes: "bg-slate-50 text-slate-600 border-slate-200 capitalize",
  };
  const config = statusConfig[status] || fallback;
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
