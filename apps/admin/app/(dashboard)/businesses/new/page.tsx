"use client";

import * as React from "react";
import { BUSINESS_CATEGORIES, MOCK_PLANS } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import {
  Building,
  User,
  MapPin,
  Globe,
  Coins,
  ArrowLeft,
  Copy,
  QrCode,
  LogIn,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminCreateBusinessPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [createdBiz, setCreatedBiz] = React.useState<{ name: string; subdomain: string } | null>(null);

  // Business Details
  const [bizName, setBizName] = React.useState("");
  const [category, setCategory] = React.useState("cafe");
  const [website, setWebsite] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [desc, setDesc] = React.useState("");

  // Owner details
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerEmail, setOwnerEmail] = React.useState("");
  const [ownerPhone, setOwnerPhone] = React.useState("");

  // Location details
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");

  // Google
  const [googleUrl, setGoogleUrl] = React.useState("");

  // Subscription setup
  const [planId, setPlanId] = React.useState("plan_growth");
  const [billingStatus, setBillingStatus] = React.useState("active");
  const [trialDays, setTrialDays] = React.useState("14");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !ownerEmail.trim()) {
      toast.error("Please fill in business name and owner email.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const subdomain = `${bizName.toLowerCase().replace(/[^a-z0-9]/g, "") || "business"}.reviewflow.in`;
      setCreatedBiz({ name: bizName, subdomain });
      toast.success("Business created and invitation sent!");
    }, 1500);
  };

  const handleCopyLink = () => {
    if (!createdBiz) return;
    navigator.clipboard.writeText(`https://${createdBiz.subdomain}`);
    toast.success("Link copied!");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="size-9 shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Onboard New Business</h1>
          <p className="text-sm text-muted-foreground">Register tenant profile, configure owner access and subscription level.</p>
        </div>
      </div>

      {!createdBiz ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Building className="size-4.5 text-primary" /> Business Details
              </CardTitle>
              <CardDescription>Configure primary brand metadata</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">Business Name</Label>
                <Input
                  id="biz-name"
                  placeholder="e.g. Brew & Bliss"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="biz-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-web">Website</Label>
                <Input
                  id="biz-web"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-phone">Phone Number</Label>
                <Input
                  id="biz-phone"
                  placeholder="+91 98290 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-desc">Description</Label>
                <Textarea
                  id="biz-desc"
                  placeholder="Briefly describe the business type..."
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner details */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <User className="size-4.5 text-primary" /> Owner Information
              </CardTitle>
              <CardDescription>Primary administrative contact user settings</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="owner-name">Owner Name</Label>
                <Input
                  id="owner-name"
                  placeholder="Rahul Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner-email">Owner Email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  placeholder="rahul@example.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner-phone">Owner Phone</Label>
                <Input
                  id="owner-phone"
                  placeholder="+91 98290 12345"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location details */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <MapPin className="size-4.5 text-primary" /> Location details
              </CardTitle>
              <CardDescription>Address of primary branch</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5 sm:col-span-4">
                <Label htmlFor="loc-addr">Street Address</Label>
                <Input
                  id="loc-addr"
                  placeholder="14, Fateh Sagar Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="loc-city">City</Label>
                <Input
                  id="loc-city"
                  placeholder="Udaipur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loc-state">State</Label>
                <Input
                  id="loc-state"
                  placeholder="Rajasthan"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loc-pc">Postal Code</Label>
                <Input
                  id="loc-pc"
                  placeholder="313001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Google integration */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Globe className="size-4.5 text-primary" /> Google Business Reviews URL
              </CardTitle>
              <CardDescription>Direct Google review link redirection config</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="loc-g-url">Google review URL</Label>
                <Input
                  id="loc-g-url"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription setup */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-1.5">
                <Coins className="size-4.5 text-primary" /> Subscription Plan
              </CardTitle>
              <CardDescription>Configure platform billing level and status</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sub-plan">SaaS Plan</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger id="sub-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PLANS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-status">Billing Status</Label>
                <Select value={billingStatus} onValueChange={setBillingStatus}>
                  <SelectTrigger id="sub-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Free Trial</SelectItem>
                    <SelectItem value="active">Active Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {billingStatus === "trial" && (
                <div className="space-y-1.5">
                  <Label htmlFor="sub-trial">Trial Days</Label>
                  <Input
                    id="sub-trial"
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-end">
              <Button type="submit" disabled={isLoading} className="h-10 gap-1.5">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering Business...
                  </>
                ) : (
                  "Create Business & Send Invitation"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50/10 shadow-lg text-center p-8 space-y-6">
          <div className="mx-auto size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-emerald-600 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground">Business Onboarded Successfully!</h2>
            <p className="text-sm text-muted-foreground">
              Workspace created and email invitation has been dispatched to <strong className="text-foreground">{ownerEmail}</strong>.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
              Active Subdomain URL
            </p>
            <a
              href={`https://${createdBiz.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-foreground hover:underline block truncate font-mono text-primary"
            >
              https://{createdBiz.subdomain}
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="outline" className="gap-1.5" onClick={handleCopyLink}>
              <Copy className="size-4" /> Copy Subdomain URL
            </Button>
            <Button variant="outline" className="gap-1.5">
              <QrCode className="size-4" /> Generate QR Code
            </Button>
             <Button className="gap-1.5" onClick={() => router.push("/businesses")}>
              <LogIn className="size-4" /> Back to List
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
