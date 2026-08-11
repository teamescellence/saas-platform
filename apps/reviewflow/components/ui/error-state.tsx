"use client";

import { cn } from "@repo/ui/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
