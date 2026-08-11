"use client";

import * as React from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { Bell, Shield, Save, Eye } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false);

  // States
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [smsAlerts, setSmsAlerts] = React.useState(false);
  const [negativeRedirect, setNegativeRedirect] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings updated successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage notifications and workspace configuration preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Notifications card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Bell className="size-4.5 text-primary" /> Notifications
            </CardTitle>
            <CardDescription>Configure when you want to receive feedback alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="notify-email" className="font-semibold text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive instant email alerts for 1 and 2 star feedback</p>
              </div>
              <Switch id="notify-email" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div className="space-y-0.5">
                <Label htmlFor="notify-sms" className="font-semibold text-foreground">SMS Alerts</Label>
                <p className="text-xs text-muted-foreground">Send SMS warnings to manager on critical reports</p>
              </div>
              <Switch id="notify-sms" checked={smsAlerts} onCheckedChange={setSmsAlerts} />
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Shield className="size-4.5 text-primary" /> Security & Trust
            </CardTitle>
            <CardDescription>Configure privacy settings and compliance rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="neg-redirect" className="font-semibold text-foreground">Auto-gate Negative reviews</Label>
                <p className="text-xs text-muted-foreground">Force critical reviews to private feedback only (Disabled to comply with Google Policies)</p>
              </div>
              <Switch id="neg-redirect" checked={negativeRedirect} disabled className="opacity-50" />
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
