"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { toast } from "sonner";
import {
  Building,
  Globe,
  Phone,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Search,
  Check,
  QrCode,
  Copy,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { PlanCard } from "@/components/ui/plan-card";
import { MOCK_PLANS } from "@/lib/mock-data";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Step 1: Business Information
  const [bizName, setBizName] = React.useState("Brew & Bliss");
  const [category, setCategory] = React.useState("cafe");
  const [website, setWebsite] = React.useState("https://brewbliss.in");
  const [bizPhone, setBizPhone] = React.useState("+91 98290 12345");
  const [address, setAddress] = React.useState("14, Fateh Sagar Road");
  const [city, setCity] = React.useState("Udaipur");
  const [state, setState] = React.useState("Rajasthan");

  // Step 2: Brand Settings
  const [logo, setLogo] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [description, setDescription] = React.useState(
    "Specialty coffee shop serving artisan blends and freshly baked goods in the heart of Udaipur."
  );
  const [language, setLanguage] = React.useState("en");
  const [tone, setTone] = React.useState("friendly");

  // Step 3: Google
  const [googleUrl, setGoogleUrl] = React.useState(
    "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs"
  );

  // Step 4: Subscription
  const [selectedPlanId, setSelectedPlanId] = React.useState("plan_growth");

  // Step 5: Complete
  const subdomain = `${bizName.toLowerCase().replace(/[^a-z0-9]/g, "") || "business"}.reviewflow.in`;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else if (step === 4) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep(5);
        toast.success("Business registered successfully!");
      }, 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${subdomain}`);
    toast.success("Link copied to clipboard!");
  };

  const getProgressValue = () => {
    return (step / 5) * 100;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      {/* Progress */}
      <div className="mb-8 space-y-2 px-4 sm:px-0">
        <div className="flex justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && "Business Information"}
            {step === 2 && "Brand & Tone"}
            {step === 3 && "Google Integration"}
            {step === 4 && "Choose Subscription"}
            {step === 5 && "All Done!"}
          </span>
        </div>
        <Progress value={getProgressValue()} className="h-1.5" />
      </div>

      <Card className="border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {step === 1 && <Building className="size-5 text-primary" />}
            {step === 2 && <Sparkles className="size-5 text-primary" />}
            {step === 3 && <Globe className="size-5 text-primary" />}
            {step === 4 && <Check className="size-5 text-primary" />}
            {step === 5 && <Check className="size-5 text-emerald-600 animate-bounce" />}
            {step === 1 && "Tell us about your Business"}
            {step === 2 && "Customize your Brand voice"}
            {step === 3 && "Connect your Google Business"}
            {step === 4 && "Choose a Subscription Plan"}
            {step === 5 && "Onboarding Complete!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter the public location and contact details for your business."}
            {step === 2 && "Define how the AI Review Assistant speaks and what tone matches your business."}
            {step === 3 && "Add your Google Review Link. This is where verified customers will write reviews."}
            {step === 4 && "Select a plan that works best for your locations and usage needs."}
            {step === 5 && "Your business page is ready. You can share your link or download your QR codes now."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-name">Business Name</Label>
                  <Input
                    id="biz-name"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Brew & Bliss"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="biz-category">
                      <SelectValue placeholder="Select a category" />
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-website">Website</Label>
                  <Input
                    id="biz-website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://brewbliss.in"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-phone">Business Phone</Label>
                  <Input
                    id="biz-phone"
                    type="tel"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    placeholder="e.g. +91 98290 12345"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-address">Address</Label>
                <Input
                  id="biz-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14, Fateh Sagar Road"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-city">City</Label>
                  <Input
                    id="biz-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Udaipur"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-state">State</Label>
                  <Input
                    id="biz-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Rajasthan"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Brand Voice */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl border border-border bg-muted flex items-center justify-center relative overflow-hidden shrink-0">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label htmlFor="logo-upload">Upload Logo</Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-desc">Business Description</Label>
                <Textarea
                  id="biz-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your business context for the AI review generator..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="biz-lang">Review Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="biz-lang">
                      <SelectValue placeholder="Default Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-tone">AI Assistant Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="biz-tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly & Warm</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Conversational</SelectItem>
                      <SelectItem value="formal">Polite & Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Google Connection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="google-url">Google Business Review URL</Label>
                <Input
                  id="google-url"
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  placeholder="e.g. https://search.google.com/local/writereview?placeid=..."
                  className="font-mono text-xs"
                  required
                />
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="size-3.5" /> How to find your URL?
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Go to Google Search Console or search your business on Google. Click &quot;Ask for reviews&quot; to copy the direct review URL.
                </p>
                <p className="text-xs text-primary font-medium leading-relaxed">
                  &quot;Customers will be sent to this URL after approving their review so they can easily paste it.&quot;
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Subscription */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={selectedPlanId === plan.id}
                  onSelect={(p) => setSelectedPlanId(p.id)}
                  className="p-4"
                />
              ))}
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div className="text-center py-6 space-y-6">
              <div className="max-w-md mx-auto rounded-xl border border-dashed border-primary/30 bg-primary/5 p-5">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                  Your ReviewFlow link is ready
                </p>
                <a
                  href={`https://${subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-foreground hover:underline block truncate font-mono text-primary"
                >
                  https://{subdomain}
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="outline" className="gap-1.5" onClick={handleCopyLink}>
                  <Copy className="size-4" /> Copy Link
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <QrCode className="size-4" /> Generate QR Kit
                </Button>
                <Button className="gap-1.5" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {step < 5 && (
          <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="gap-1"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : step === 4 ? (
                "Finish Setup"
              ) : (
                <>
                  Next <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
