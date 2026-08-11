"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { toast } from "sonner";
import { Settings, Save, Server, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("System configurations updated!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SaaS Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Manage global SaaS policies, API keys, and maintenance schedules.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Server className="size-4.5 text-primary" /> API Configurations
            </CardTitle>
            <CardDescription>Setup LLM engine configurations and system environment endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sys-endpoint">Laravel API Endpoint</Label>
              <Input id="sys-endpoint" value="https://api.reviewflow.in/api/v1" readOnly className="font-mono text-xs bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-model">AI Engine Model</Label>
              <Input id="ai-model" value="gemini-1.5-flash" readOnly className="font-mono text-xs bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <ShieldCheck className="size-4.5 text-primary" /> Global Security Policies
            </CardTitle>
            <CardDescription>Configure security headers, password policies, and rate limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="maint-mode" className="font-semibold text-foreground">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">Force temporary redirection of all domains to update screens</p>
              </div>
              <Switch id="maint-mode" defaultChecked={false} />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div className="space-y-0.5">
                <Label htmlFor="user-reg" className="font-semibold text-foreground">Open User Registrations</Label>
                <p className="text-xs text-muted-foreground">Allow public owner profiles signup via /register</p>
              </div>
              <Switch id="user-reg" defaultChecked={true} />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-1.5">
              <Save className="size-4" /> {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
