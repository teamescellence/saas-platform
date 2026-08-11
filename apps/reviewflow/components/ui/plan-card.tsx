"use client";

import { cn } from "@repo/ui/lib/utils";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { formatCurrency } from "@/lib/mock-data";
import type { Plan } from "@/lib/types";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect?: (plan: Plan) => void;
  className?: string;
}

export function PlanCard({
  plan,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  className,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 flex flex-col relative",
        isPopular ? "border-primary shadow-lg shadow-primary/10" : "border-border",
        isCurrentPlan && "ring-2 ring-primary/20",
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-sm text-muted-foreground">/{plan.billing_period === "monthly" ? "mo" : "yr"}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="size-4 text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPopular ? "default" : "outline"}
        className="w-full"
        size="lg"
        onClick={() => onSelect?.(plan)}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Current Plan" : "Choose Plan"}
      </Button>
    </div>
  );
}
