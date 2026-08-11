"use client";

import { cn } from "@repo/ui/lib/utils";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-8",
  };

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} role="group" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onRate?.(starValue)}
              className={cn(
                "transition-colors focus:outline-none",
                isFilled ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-300"
              )}
              aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
            >
              <Star className={cn(sizeClasses[size], "fill-current")} />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={cn(
              sizeClasses[size],
              "fill-current",
              isFilled ? "text-amber-400" : "text-muted-foreground/20"
            )}
          />
        );
      })}
    </div>
  );
}
