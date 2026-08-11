"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Star,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  RotateCcw,
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { getCategoryDimensions } from "@/lib/mock-data";
import { api, endpoints } from "@/lib/api";
import { toast } from "sonner";

// Zod Validation Schema
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  selectedTags: z.array(z.string()),
  customComment: z.string().max(5000, "Comment cannot exceed 5000 characters"),
  aiDraft: z.string(),
  isEditingDraft: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface CustomerReviewScreenProps {
  token: string;
}

export function CustomerReviewScreen({ token }: CustomerReviewScreenProps) {
  // Page Step State (1: Rating, 2: Comments, 3: AI Draft, 4: Preview/Google Redirect, 5: Thank You)
  const [step, setStep] = React.useState<number>(1);
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Initialize React Hook Form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      selectedTags: [],
      customComment: "",
      aiDraft: "",
      isEditingDraft: false,
    },
  });

  const { register, handleSubmit, setValue, watch, getValues } = form;

  // Watch necessary form values for UI rendering
  const formRating = watch("rating");
  const formSelectedTags = watch("selectedTags");
  const formAiDraft = watch("aiDraft");
  const formIsEditingDraft = watch("isEditingDraft");

  // TanStack Query for session retrieval
  const { data: sessionData, isLoading: loadingSession, error: queryError } = useQuery({
    queryKey: ["reviewSession", token],
    queryFn: () => api.get<any>(endpoints.publicReviewSession(token)),
    enabled: !!token,
    retry: false,
  });

  // Extract dynamic details from server response
  const businessName = sessionData?.business?.name || "Brew & Bliss Cafe";
  const category = sessionData?.business?.category || "cafe";
  const logoUrl = sessionData?.business?.logo;
  const googleReviewUrl = sessionData?.business?.google_review_url || "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs";
  const branchName = sessionData?.branch?.name || "Main Branch";
  const tableName = sessionData?.qr_code?.name || "Table";

  const dimensions = getCategoryDimensions(category as any);

  // TanStack Query Mutation for AI review generation
  const generateDraftMutation = useMutation({
    mutationFn: async (overrides?: { comment?: string; rating?: number }) => {
      const payload: any = {};
      
      if (overrides?.comment !== undefined) {
        payload.comment = overrides.comment;
      } else {
        const rawComment = getValues("customComment");
        const tags = getValues("selectedTags");
        payload.comment = tags.length > 0 
          ? `Highlights: ${tags.join(", ")}. ${rawComment}`
          : rawComment;
      }

      if (overrides?.rating !== undefined) {
        payload.rating = overrides.rating;
      } else {
        payload.rating = getValues("rating");
      }

      return api.post<any>(endpoints.publicGenerateDraft(token), payload);
    },
    onSuccess: (data) => {
      setValue("aiDraft", data.draft?.generated_text || "");
    },
    onError: (err: any) => {
      toast.error(err.message || "AI review generation failed");
    },
  });

  // TanStack Query Mutation for submitting raw feedback
  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      const rawComment = getValues("customComment");
      const tags = getValues("selectedTags");
      const commentText = tags.length > 0 
        ? `Highlights: ${tags.join(", ")}. ${rawComment}`
        : rawComment;

      return api.post<any>(endpoints.publicSubmitFeedback(token), {
        rating: getValues("rating"),
        comment: commentText,
        language: "en",
      });
    },
    onSuccess: () => {
      setStep(3);
      generateDraftMutation.mutate(undefined);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  const onSubmit = () => {
    if (step === 2) {
      submitFeedbackMutation.mutate();
    }
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setStep((prev) => prev - 1);
  };

  const toggleTag = (tag: string) => {
    const currentTags = getValues("selectedTags");
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    setValue("selectedTags", newTags);
  };

  const handleCopyAndRedirect = () => {
    const draftText = getValues("aiDraft");
    if (draftText) {
      navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
    setStep(5); // Go to thank you screen
  };

  const currentDisplayRating = hoveredRating !== null ? hoveredRating : formRating;

  if (loadingSession) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 max-w-md mx-auto border-x border-border/40 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Store className="size-8 text-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-semibold">Resolving ReviewFlow Session...</p>
        </div>
      </div>
    );
  }

  if (queryError) {
    const errorMsg = (queryError as any).message || "Failed to load review session. Invalid or expired link.";
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto border-x border-border/40 shadow-2xl space-y-6">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
          <ShieldCheck className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Review Link Expired</h2>
          <p className="text-sm text-muted-foreground px-4">{errorMsg}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="h-11 rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-between p-4 font-sans relative max-w-md mx-auto border-x border-border/40 shadow-2xl">
      {/* Background soft gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent blur-xl pointer-events-none" />

      {/* Top Header Section */}
      <header className="w-full flex flex-col items-center text-center py-4 border-b border-border/50 shrink-0">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="size-8 rounded-lg" />
          ) : (
            <Store className="size-6 text-primary" />
          )}
        </div>
        <h1 className="text-lg font-bold tracking-tight text-foreground">{businessName}</h1>
        <p className="text-xs text-muted-foreground font-medium">
          {branchName} • <span className="text-primary font-semibold">{tableName}</span>
        </p>
      </header>

      {/* Main Form Content Container */}
      <main className="flex-1 w-full flex flex-col justify-center py-6">
        {/* Step 1: Rating Screen */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold tracking-tight">How was your experience?</h2>
              <p className="text-sm text-muted-foreground">Tap stars to share your rating</p>
            </div>

            {/* Large Interactive Star Buttons */}
            <div className="flex items-center justify-center gap-1.5 py-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setValue("rating", star);
                      handleNextStep();
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className={cn(
                      "p-1.5 rounded-lg transition-transform active:scale-90 focus:outline-none",
                      isFilled ? "text-amber-400 scale-110" : "text-muted-foreground/30"
                    )}
                    aria-label={`Rate ${star} Stars`}
                  >
                    <Star className="size-11 fill-current stroke-current" />
                  </button>
                );
              })}
            </div>

            {/* Quick Dimension Selection Tags */}
            {dimensions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select highlights</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {dimensions.map((dim) => {
                    const isSelected = formSelectedTags.includes(dim);
                    return (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => toggleTag(dim)}
                        className={cn(
                          "text-xs font-semibold px-3.5 py-2 rounded-full border transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card border-border hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {dim}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Custom Comments Screen */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Tell us about your experience</h2>
              <p className="text-xs text-muted-foreground">What stood out during your visit?</p>
            </div>

            <textarea
              {...register("customComment")}
              placeholder="Tell us what you liked or what could be better..."
              rows={4}
              className="w-full rounded-xl border border-border bg-card p-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 resize-none h-32"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={handleBackStep}
                disabled={submitFeedbackMutation.isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl"
                disabled={submitFeedbackMutation.isPending}
              >
                {submitFeedbackMutation.isPending ? "Submitting..." : "Continue"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: AI Assistant Draft Screen */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles className="size-4 animate-pulse" /> AI Review Assistant
              </h2>
              <button
                type="button"
                onClick={() => {
                  const rawComment = getValues("customComment");
                  const tags = getValues("selectedTags");
                  const commentText = tags.length > 0 
                    ? `Highlights: ${tags.join(", ")}. ${rawComment}`
                    : rawComment;
                  generateDraftMutation.mutate({ comment: commentText, rating: formRating });
                }}
                disabled={generateDraftMutation.isPending}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" /> Regenerate
              </button>
            </div>

            {generateDraftMutation.isPending ? (
              <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                <Sparkles className="size-8 text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-semibold">Generating your review...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Here&apos;s a polished version of what you told us.</p>
                <textarea
                  {...register("aiDraft")}
                  disabled={!formIsEditingDraft}
                  rows={5}
                  className={cn(
                    "w-full rounded-xl border p-3.5 text-sm leading-relaxed resize-none italic h-40",
                    formIsEditingDraft
                      ? "border-primary bg-background not-italic"
                      : "border-border bg-muted/30 text-foreground/80 cursor-not-allowed"
                  )}
                />
                <p className="text-[10px] text-center text-muted-foreground">You control the final review text and can edit it anytime.</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl gap-1.5"
                onClick={() => setValue("isEditingDraft", !formIsEditingDraft)}
                disabled={generateDraftMutation.isPending}
              >
                <Edit2 className="size-4" /> {formIsEditingDraft ? "Save Edit" : "Edit Draft"}
              </Button>
              <Button
                className="w-full h-12 rounded-xl gap-1.5"
                onClick={handleNextStep}
                disabled={generateDraftMutation.isPending || !formAiDraft}
              >
                Use This Review <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Preview/Redirect */}
        {step === 4 && (
          <div className="space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold">Ready to share?</h2>
            <p className="text-xs text-muted-foreground">We will copy the review so you can paste it directly on Google Reviews.</p>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 italic text-sm text-foreground/90 max-h-32 overflow-y-auto leading-relaxed">
              &quot;{formAiDraft}&quot;
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full h-12 rounded-xl gap-1.5 shadow-lg shadow-primary/20"
                onClick={handleCopyAndRedirect}
              >
                {copied ? (
                  <>
                    <Check className="size-4" /> Copied Review!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Continue to Google <ExternalLink className="size-3.5" />
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full h-12 rounded-xl" onClick={handleBackStep}>
                Back to Edit
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Thank you */}
        {step === 5 && (
          <div className="text-center py-8 space-y-6 animate-in fade-in duration-500">
            <div className="mx-auto size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-emerald-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-foreground">Thank you!</h2>
              <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                Thanks for sharing your experience and supporting <strong className="text-foreground">{businessName}</strong>.
              </p>
            </div>
            <p className="text-xs text-muted-foreground/60 italic pt-6">ReviewFlow • Authentic Local Businesses Reviews</p>
          </div>
        )}
      </main>

      {/* Mobile Footer Indicator */}
      <footer className="w-full py-3 border-t border-border/50 text-center text-[10px] text-muted-foreground shrink-0">
        Secure feedback verified by ReviewFlow AI
      </footer>
    </div>
  );
}
