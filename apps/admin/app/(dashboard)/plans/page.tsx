"use client";

import * as React from "react";
import { MOCK_PLANS, formatCurrency } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit, Ban, CheckCircle, ShieldAlert, Layers } from "lucide-react";

export default function AdminPlansPage() {
  const [plans, setPlans] = React.useState(MOCK_PLANS);

  const handleToggleActive = (id: string, name: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
    toast.success(`Plan ${name} status updated.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SaaS Subscription Plans</h1>
          <p className="text-sm text-muted-foreground">Configure global subscription tiers, limits, and pricing settings.</p>
        </div>
        <Button onClick={() => toast.info("Create Plan coming soon!")} className="gap-1.5 h-10">
          <Plus className="size-4" /> Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border/50 bg-card p-6 flex flex-col relative ${
              !plan.is_active ? "opacity-60" : ""
            }`}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                {!plan.is_active && (
                  <span className="text-[10px] bg-red-50 border border-red-200 text-red-700 font-bold px-2 py-0.5 rounded-md uppercase">
                    Disabled
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-sm text-muted-foreground">/{plan.billing_period === "monthly" ? "mo" : "yr"}</span>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-border pt-4 flex-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Max Branches</span>
                <span>{plan.max_branches}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Max QR Codes</span>
                <span>{plan.max_qr_codes}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Feedback Limit</span>
                <span>{plan.feedback_limit.toLocaleString()} / mo</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">AI Generation Limit</span>
                <span>{plan.ai_generation_limit.toLocaleString()} / mo</span>
              </div>
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Core Features</span>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="truncate">{f}</li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="font-semibold text-primary">+{plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1 h-9 gap-1.5 text-xs"
                onClick={() => toast.info(`Editing plan ${plan.name}...`)}
              >
                <Edit className="size-3.5" /> Edit
              </Button>
              <Button
                variant={plan.is_active ? "destructive" : "default"}
                className="flex-1 h-9 gap-1.5 text-xs"
                onClick={() => handleToggleActive(plan.id, plan.name)}
              >
                <Ban className="size-3.5" /> {plan.is_active ? "Disable" : "Enable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
