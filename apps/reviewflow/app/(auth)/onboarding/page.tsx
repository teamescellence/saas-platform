"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
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
  Sparkles,
  Search,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { BUSINESS_CATEGORIES, MOCK_PLANS } from "@/lib/mock-data";
import { PlanCard } from "@/components/ui/plan-card";
import { api, endpoints } from "@/lib/api";

const onboardingSchema = z.object({
  bizName: z.string().min(2, "Business name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  website: z.string().optional(),
  bizPhone: z.string().min(7, "Please enter a valid phone number"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  description: z.string().min(10, "Please provide a short description (min 10 characters)"),
  language: z.string().min(1, "Language is required"),
  tone: z.string().min(1, "Tone is required"),
  googleUrl: z.string().url("Please enter a valid Google Review URL"),
  selectedPlanSlug: z.string().min(1, "Plan is required"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardedResult {
  business: {
    id: number;
    name: string;
    slug: string;
    subdomain: string;
    google_review_url?: string;
  };
  qr_code: {
    id: number;
    name: string;
    token: string;
    url: string;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [completedData, setCompletedData] = React.useState<OnboardedResult | null>(null);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bizName: "Escellence Cafe",
      category: "cafe",
      website: "https://escellence.in",
      bizPhone: "+91 98290 12345",
      address: "100, Palace Road",
      city: "Udaipur",
      state: "Rajasthan",
      description: "Fine artisanal coffee roasters and specialty bakehouse with exceptional ambiance.",
      language: "en",
      tone: "friendly",
      googleUrl: "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs",
      selectedPlanSlug: "growth",
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    control,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const bizName = watch("bizName");
  const selectedPlanSlug = watch("selectedPlanSlug");
  const liveSubdomain = `${(bizName || "business").toLowerCase().replace(/[^a-z0-9]/g, "")}.reviewflow.in`;

  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await trigger(["bizName", "category", "bizPhone", "address", "city", "state"]);
    } else if (step === 2) {
      isValid = await trigger(["description", "language", "tone"]);
    } else if (step === 3) {
      isValid = await trigger(["googleUrl"]);
    } else if (step === 4) {
      isValid = await trigger(["selectedPlanSlug"]);
    }

    if (isValid && step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      const response = await api.post<OnboardedResult>(endpoints.onboarding, {
        name: data.bizName,
        category_slug: data.category,
        website: data.website || null,
        phone: data.bizPhone,
        address_line_1: data.address,
        city: data.city,
        state: data.state,
        country: "India",
        description: data.description,
        google_review_url: data.googleUrl,
        plan_slug: data.selectedPlanSlug,
      });

      setCompletedData(response);
      setStep(5);
      toast.success("Business profile configured and activated successfully!");
    } catch (err: any) {
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to save business settings. Please try again.";
      toast.error(errorMsg);
    }
  };

  const finalSubdomain = completedData?.business?.subdomain || liveSubdomain;
  const qrToken = completedData?.qr_code?.token || "escellence-demo-token";
  const qrDirectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/q/${qrToken}`
    : `https://${finalSubdomain}/q/${qrToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrDirectUrl);
    toast.success("Customer review link copied to clipboard!");
  };

  const getProgressValue = () => {
    return (step / 5) * 100;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="mb-8 space-y-2 px-4 sm:px-0">
        <div className="flex justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && "Business Information"}
            {step === 2 && "Brand Voice & AI"}
            {step === 3 && "Google Integration"}
            {step === 4 && "Choose Subscription"}
            {step === 5 && "Onboarding Complete!"}
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
            {step === 2 && "Customize your Brand Voice"}
            {step === 3 && "Connect your Google Business"}
            {step === 4 && "Choose a Subscription Plan"}
            {step === 5 && "You're All Set!"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter the public location and contact details for your business."}
            {step === 2 && "Define how the AI Review Assistant drafts reviews that match your brand."}
            {step === 3 && "Add your Google Review Link where customers will submit their reviews."}
            {step === 4 && "Select a plan that suits your volume and feature requirements."}
            {step === 5 && "Your business page and QR codes are live and ready to accept customer feedback."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="p-6">
            {/* Step 1: Business Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bizName">Business Name</Label>
                    <Input
                      id="bizName"
                      placeholder="e.g. Brew & Bliss"
                      className={errors.bizName ? "border-destructive" : ""}
                      {...register("bizName")}
                    />
                    {errors.bizName && (
                      <p className="text-xs text-destructive font-medium">{errors.bizName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="category">
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
                      )}
                    />
                    {errors.category && (
                      <p className="text-xs text-destructive font-medium">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://brewbliss.in"
                      className={errors.website ? "border-destructive" : ""}
                      {...register("website")}
                    />
                    {errors.website && (
                      <p className="text-xs text-destructive font-medium">{errors.website.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bizPhone">Business Phone</Label>
                    <Input
                      id="bizPhone"
                      type="tel"
                      placeholder="+91 98290 12345"
                      className={errors.bizPhone ? "border-destructive" : ""}
                      {...register("bizPhone")}
                    />
                    {errors.bizPhone && (
                      <p className="text-xs text-destructive font-medium">{errors.bizPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Address Line</Label>
                  <Input
                    id="address"
                    placeholder="14, Palace Road"
                    className={errors.address ? "border-destructive" : ""}
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive font-medium">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Udaipur"
                      className={errors.city ? "border-destructive" : ""}
                      {...register("city")}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive font-medium">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Rajasthan"
                      className={errors.state ? "border-destructive" : ""}
                      {...register("state")}
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive font-medium">{errors.state.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Brand Voice */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your offerings and key highlights for the AI review engine..."
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="language">Review Language</Label>
                    <Controller
                      control={control}
                      name="language"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Default Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tone">AI Review Tone</Label>
                    <Controller
                      control={control}
                      name="tone"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="tone">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly & Warm</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual & Conversational</SelectItem>
                            <SelectItem value="formal">Polite & Formal</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Google Connection */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="googleUrl">Google Business Review URL</Label>
                  <Input
                    id="googleUrl"
                    placeholder="https://search.google.com/local/writereview?placeid=..."
                    className={`font-mono text-xs ${errors.googleUrl ? "border-destructive" : ""}`}
                    {...register("googleUrl")}
                  />
                  {errors.googleUrl && (
                    <p className="text-xs text-destructive font-medium">{errors.googleUrl.message}</p>
                  )}
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="size-3.5" /> How to find your URL?
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Search your business on Google Business Profile, click &quot;Ask for reviews&quot;, and copy the direct link. Customers will be automatically directed here with their pre-generated AI review ready to paste.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Subscription Plan */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MOCK_PLANS.map((plan) => {
                    const isSelected = selectedPlanSlug === plan.slug;
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrentPlan={isSelected}
                        onSelect={() => setValue("selectedPlanSlug", plan.slug)}
                        className="p-4 cursor-pointer transition-all"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Complete */}
            {step === 5 && (
              <div className="text-center py-4 space-y-6">
                <div className="flex flex-col items-center justify-center p-6 bg-primary/5 border border-dashed border-primary/30 rounded-2xl max-w-md mx-auto space-y-4">
                  <div className="p-3 bg-white rounded-xl shadow-md">
                    <QRCodeSVG value={qrDirectUrl} size={150} level="M" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                      Live Customer Review Link
                    </p>
                    <a
                      href={qrDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-foreground hover:underline block truncate font-mono"
                    >
                      {qrDirectUrl}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button type="button" variant="outline" className="gap-1.5" onClick={handleCopyLink}>
                    <Copy className="size-4" /> Copy Customer Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => window.open(qrDirectUrl, "_blank")}
                  >
                    <ExternalLink className="size-4" /> Test Review Flow
                  </Button>
                  <Button
                    type="button"
                    className="gap-1.5"
                    onClick={() => router.push("/dashboard")}
                  >
                    Go to Dashboard <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          {step < 5 && (
            <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className="gap-1"
              >
                <ArrowLeft className="size-4" /> Back
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-1"
                >
                  Next <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activating Business...
                    </>
                  ) : (
                    <>
                      Complete Setup <Check className="ml-1.5 size-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
