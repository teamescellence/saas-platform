"use client";

import { cn } from "../../lib/utils";

interface BusinessAvatarProps {
  name: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BusinessAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}: BusinessAvatarProps) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
  };

  const initial = name.charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className={cn(
          "rounded-lg object-cover border border-border",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
