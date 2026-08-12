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
  Send,
  Home,
  FileText,
  Edit2,
  CheckCircle,
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
  initialSessionData?: any;
  serverError?: string | null;
}

export function CustomerReviewScreen({
  token,
  initialSessionData,
  serverError,
}: CustomerReviewScreenProps) {
  // Page Step State
  // 1: Write (Rating + Tags + Custom Impressions)
  // 2: Review (Bento Grid comparison: Original vs AI Polished)
  // 3: Approved & Post (Copy Review & Redirect to Google)
  // 4: Thank You (Low Ratings Gated)
  const [step, setStep] = React.useState<number>(1);
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

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
  const formCustomComment = watch("customComment");

  // TanStack Query for session retrieval, initialized with server-prefetched data
  const { data: sessionData, error: queryError } = useQuery({
    queryKey: ["reviewSession", token],
    queryFn: () => api.get<any>(endpoints.publicReviewSession(token)),
    enabled: !!token,
    retry: false,
    initialData: initialSessionData || undefined,
  });

  const activeError = queryError || serverError;

  // Extract dynamic details from server response
  const businessName = sessionData?.business?.name || "Brew & Bliss Cafe";
  const category = sessionData?.business?.category || "cafe";
  const logoUrl = sessionData?.business?.logo;
  const googleReviewUrl =
    sessionData?.business?.google_review_url ||
    "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs";
  const branchName = sessionData?.branch?.name || "Main Branch";
  const tableName = sessionData?.qr_code?.name || "Table";

  const dimensions = getCategoryDimensions(category as any);

  const activeToken = sessionData?.session_token || token;

  // TanStack Query Mutation for AI review generation
  const generateDraftMutation = useMutation({
    mutationFn: async (overrides?: { comment?: string; rating?: number }) => {
      const payload: any = {};

      if (overrides?.comment !== undefined) {
        payload.comment = overrides.comment;
      } else {
        const rawComment = getValues("customComment");
        const tags = getValues("selectedTags");
        payload.comment =
          tags.length > 0
            ? `Highlights: ${tags.join(", ")}. ${rawComment}`
            : rawComment;
      }

      if (overrides?.rating !== undefined) {
        payload.rating = overrides.rating;
      } else {
        payload.rating = getValues("rating");
      }

      return api.post<any>(endpoints.publicGenerateDraft(activeToken), payload);
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
      const commentText =
        tags.length > 0
          ? `Highlights: ${tags.join(", ")}. ${rawComment}`
          : rawComment;

      return api.post<any>(endpoints.publicSubmitFeedback(activeToken), {
        rating: getValues("rating"),
        comment: commentText,
        language: "en",
      });
    },
    onSuccess: () => {
      const rating = getValues("rating");
      if (rating >= 4) {
        setStep(2); // Go to Step 2: Review comparison screen
        generateDraftMutation.mutate(undefined);
      } else {
        setStep(4); // Go directly to Step 4: Gated thank you screen
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  const onSubmit = () => {
    submitFeedbackMutation.mutate();
  };

  const handleRefineWithAI = () => {
    if (!formRating) {
      toast.error("Please select a rating first");
      return;
    }
    submitFeedbackMutation.mutate(undefined, {
      onSuccess: () => {
        setStep(2); // Go to Step 2 (Review)
        generateDraftMutation.mutate(undefined);
      },
    });
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
      toast.success("Review copied to clipboard!");
    }
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
  };

  const currentDisplayRating =
    hoveredRating !== null ? hoveredRating : formRating;

  // Render error screen
  if (activeError) {
    const errorMsg =
      (activeError as any).message ||
      "Failed to load review session. Invalid or expired link.";
    return (
      <div className="min-h-screen w-full bg-surface flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto border border-outline-variant/20 shadow-warm-ambient space-y-6 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-sm">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
          <ShieldCheck className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">
            Review Link Expired
          </h2>
          <p className="text-sm text-on-surface-variant px-4 leading-relaxed">{errorMsg}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="h-12 px-6 rounded-full border-primary text-primary hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-semibold"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface antialiased flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop overflow-x-hidden relative font-sans">
      {/* Background soft ambient peach/rose gradients for Gulaabo modern warmth with floating animations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0 pointer-events-none animate-float"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 pointer-events-none animate-float-delayed"></div>

      {/* Background Texture SVG Pattern for premium feel */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23944248' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <main className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 relative z-10 my-8">
        {/* Step 1: Write Screen */}
        {step === 1 && (
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-warm-ambient p-6 md:p-12 border border-outline-variant/10 flex flex-col items-center gap-8 transition-all duration-300 hover:shadow-warm-hover animate-in fade-in duration-300">
            {/* Branding Header */}
            <div className="flex flex-col items-center text-center gap-3 w-full">
              <div className="size-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-1 border border-primary/10 shadow-inner">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={businessName}
                    className="size-12 rounded-xl object-cover animate-in zoom-in duration-300"
                  />
                ) : (
                  <Store className="size-8 text-primary" />
                )}
              </div>
              <h1 className="font-headline-md text-headline-lg-mobile md:text-headline-md text-primary tracking-tight font-serif italic">
                {businessName}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Your thoughts help us perfect the art of hospitality.
              </p>
              {branchName && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full mt-1 border border-primary/20 shadow-sm transition-transform hover:scale-105 duration-200">
                  {branchName} • {tableName}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-24 h-px bg-outline-variant/30"></div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-6"
            >
              {/* Star Rating Section */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-[13px] font-bold text-secondary uppercase tracking-widest pl-1">
                    Rate your experience
                  </span>
                  {formRating === 5 && (
                    <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide animate-pulse">
                      Outstanding!
                    </span>
                  )}
                </div>
                <div className="flex justify-center items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= currentDisplayRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setValue("rating", star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className={cn(
                          "p-1.5 rounded-lg transition-all duration-200 hover:scale-125 active:scale-90 focus:outline-none cursor-pointer",
                          isFilled ? "text-primary scale-110" : "text-outline-variant"
                        )}
                        aria-label={`Rate ${star} Stars`}
                      >
                        <Star
                          className={cn(
                            "size-10 transition-colors duration-200",
                            isFilled ? "fill-primary" : "fill-transparent"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Highlights (Dimensions) */}
              {dimensions.length > 0 && (
                <div className="flex flex-col gap-2.5 w-full">
                  <span className="font-label-md text-label-md text-on-surface pl-1 font-bold">
                    Aspects of your visit
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dimensions.map((dim) => {
                      const isSelected = formSelectedTags.includes(dim);
                      return (
                        <button
                          key={dim}
                          type="button"
                          onClick={() => toggleTag(dim)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-label-md font-label-md transition-all duration-200 active:scale-95 cursor-pointer",
                            isSelected
                              ? "bg-primary text-white border-primary shadow-md scale-105 font-bold"
                              : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-primary/40 hover:bg-secondary-fixed/50 hover:text-primary hover:scale-105"
                          )}
                        >
                          {dim}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Impressions Text Area */}
              <div className="flex flex-col gap-2.5 w-full">
                <label
                  className="font-label-md text-label-md text-on-surface pl-1 font-bold"
                  htmlFor="impressions"
                >
                  Your impressions...
                </label>
                <div className="relative w-full group">
                  <textarea
                    {...register("customComment")}
                    id="impressions"
                    placeholder="Tell us about the coffee, the ambiance, the service..."
                    rows={5}
                    className="w-full bg-surface resize-none rounded-xl border border-outline-variant/30 text-on-surface font-body-md text-body-md p-4 hover:border-outline-variant/60 focus:border-primary focus:shadow-lg focus:shadow-primary/5 transition-all duration-300 placeholder:text-outline/70 focus:outline-none shadow-inner leading-relaxed"
                  />
                  {/* Sparkle icon hint for AI */}
                  <div className="absolute bottom-4 right-4 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity text-primary">
                    <Sparkles
                      className="size-5 fill-primary"
                      style={{
                        fontVariationSettings: '"FILL" 1',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 w-full mt-2 justify-between items-center">
                {/* Refine with AI Button */}
                <button
                  type="button"
                  onClick={handleRefineWithAI}
                  disabled={
                    submitFeedbackMutation.isPending ||
                    generateDraftMutation.isPending
                  }
                  className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-surface-container-highest border border-outline-variant/40 text-on-surface hover:bg-secondary-fixed/30 hover:text-primary hover:border-primary/40 hover:scale-[1.02] transition-all duration-200 rounded-full px-6 py-3.5 font-label-md text-label-md shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {generateDraftMutation.isPending ? (
                    <Sparkles className="size-4 animate-spin text-primary" />
                  ) : (
                    <Sparkles className="size-4 text-primary group-hover:rotate-12 transition-transform" />
                  )}
                  Refine with AI
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    submitFeedbackMutation.isPending ||
                    generateDraftMutation.isPending
                  }
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-b from-primary to-primary/95 text-white hover:from-primary/90 hover:to-primary/85 shadow-[0_8px_16px_-4px_rgba(148,66,72,0.3),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:shadow-[0_12px_24px_-4px_rgba(148,66,72,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-200 rounded-full px-8 py-3.5 font-label-md text-label-md active:scale-95 disabled:opacity-50 font-bold cursor-pointer"
                >
                  {submitFeedbackMutation.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      Submit Feedback
                      <Send className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Review (Bento Grid screen) */}
        {step === 2 && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Sparkles className="size-10 text-primary animate-pulse fill-primary/10" />
              </div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-serif italic tracking-tight">
                Here&apos;s a clearer version of your thoughts
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                We&apos;ve crafted your raw notes into a beautifully worded review. Feel free to refine it further.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Raw Notes Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-warm-ambient hover:shadow-warm-hover border border-outline-variant/30 hover:border-primary/20 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center gap-2 text-secondary relative z-10">
                  <FileText className="size-5 text-on-surface-variant" />
                  <h3 className="font-label-md text-[13px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Your Raw Notes
                  </h3>
                  <span className="ml-auto text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-tighter bg-surface-container px-2 py-0.5 rounded border border-outline-variant/10">
                    Original
                  </span>
                </div>
                <div className="bg-surface-container-highest/20 rounded-lg p-4 flex-1 relative z-10 border border-outline-variant/10 shadow-inner min-h-[160px] flex items-center">
                  <p className="font-body-md text-body-md text-on-surface italic text-opacity-80 leading-relaxed">
                    &quot;{formCustomComment || "No comment provided. AI polished it based on your selected highlights."}&quot;
                  </p>
                </div>
              </div>

              {/* Curated Review Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-warm-ambient hover:shadow-warm-hover border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center gap-2 text-primary relative z-10">
                  <Star className="size-5 fill-primary" />
                  <h3 className="font-label-md text-[13px] font-bold uppercase tracking-widest text-primary">
                    Your Review
                  </h3>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-primary/20 flex items-center gap-1">
                      <Sparkles className="size-2.5 fill-primary" /> Drafted with AI
                    </span>
                    <button
                      type="button"
                      onClick={() => generateDraftMutation.mutate(undefined)}
                      disabled={generateDraftMutation.isPending}
                      className="p-1 hover:bg-primary/15 rounded-full text-primary transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center border border-primary/20 bg-primary/5 shadow-sm active:scale-90"
                      title="Regenerate review"
                      aria-label="Regenerate AI review draft"
                    >
                      <RotateCcw className="size-3" />
                    </button>
                  </div>
                </div>

                {generateDraftMutation.isPending ? (
                  <div className="rounded-lg p-5 flex-1 relative z-10 border border-surface-container-highest flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
                    <Sparkles className="size-8 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground font-semibold">Generating your review...</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-2 relative z-10">
                    {formIsEditingDraft ? (
                      <textarea
                        {...register("aiDraft")}
                        rows={6}
                        className="w-full bg-surface-bright rounded-lg p-4 flex-1 shadow-inner border border-primary font-body-lg text-body-lg text-on-surface leading-relaxed focus:outline-none resize-none min-h-[160px]"
                      />
                    ) : (
                      <div className="bg-surface-bright rounded-lg p-5 flex-1 border border-surface-container-highest shadow-inner min-h-[160px] flex items-center">
                        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                          {formAiDraft || "Generating draft review..."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
              {/* Approve & Continue */}
              <button
                onClick={() => setStep(3)}
                disabled={generateDraftMutation.isPending || !formAiDraft}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-label-md text-label-md rounded-full shadow-[0_8px_16px_-4px_rgba(148,66,72,0.3),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:bg-opacity-95 hover:shadow-[0_12px_24px_-4px_rgba(148,66,72,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
              >
                <span>Approve & Continue</span>
                <Send className="size-4" />
              </button>

              {/* Edit Manually */}
              <button
                onClick={() => setValue("isEditingDraft", !formIsEditingDraft)}
                disabled={generateDraftMutation.isPending}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-primary text-primary font-label-md text-label-md rounded-full hover:bg-primary/5 hover:scale-[1.02] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
              >
                {formIsEditingDraft ? (
                  <>
                    <Check className="size-4" />
                    <span>Save Draft</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="size-4" />
                    <span>Edit Manually</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Approved Screen */}
        {step === 3 && (
          <div className="w-full animate-in fade-in duration-300">
            {/* Progress Indicator */}
            <div className="w-full max-w-2xl mx-auto mb-8 flex justify-between items-center px-4 relative">
              <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-surface-container-high -z-10 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 w-[100%]"></div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md shadow-sm border border-primary/20">
                  <Check className="size-4 stroke-[3]" />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium animate-pulse">Write</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md shadow-sm border border-primary/20">
                  <Check className="size-4 stroke-[3]" />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium animate-pulse">Review</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md shadow-md ring-4 ring-primary/20 font-bold">
                  3
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Approved</span>
              </div>
            </div>

            {/* Approved Card */}
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-warm-ambient p-8 md:p-12 text-center relative overflow-hidden mt-4 border border-outline-variant/10">
              {/* Decorative Header Element */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary/80 to-primary/20"></div>

              {/* Success Check Circle */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                  <CheckCircle className="size-12 text-emerald-600 animate-in zoom-in duration-500" />
                </div>
              </div>

              <h1 className="font-headline-xl text-headline-xl text-primary mb-4 italic tracking-tight font-serif">
                Approved
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg mx-auto">
                Your review is ready to be posted. Thank you for sharing your experience!
              </p>

              {/* Review Preview Card */}
              <div className="bg-surface-container-low rounded-lg p-6 mb-10 text-left border border-outline-variant/30 relative shadow-inner">
                <div className="absolute -top-3 left-6 bg-surface-container-lowest px-2 text-primary font-label-md text-label-md flex items-center gap-1 font-bold border border-outline-variant/15 rounded">
                  <FileText className="size-3.5" />
                  Final Text
                </div>
                {/* 5 Gold Stars with staggered mount animation */}
                <div className="flex items-center gap-1.5 mb-4 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s, idx) => (
                    <Star
                      key={s}
                      className="size-5 fill-current stroke-current animate-in zoom-in duration-300"
                      style={{
                        animationDelay: `${idx * 75}ms`,
                        animationFillMode: "both",
                      }}
                    />
                  ))}
                </div>
                <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                  &quot;{formAiDraft}&quot;
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleCopyAndRedirect}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-full shadow-[0_8px_16px_-4px_rgba(148,66,72,0.3),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:bg-opacity-95 hover:shadow-[0_12px_24px_-4px_rgba(148,66,72,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-200 active:scale-95 cursor-pointer font-bold shadow-md"
                >
                  <Copy className="size-4" />
                  Copy and open Google
                  <ExternalLink className="size-4" />
                </button>
                <button
                  onClick={() => {
                    form.reset();
                    setStep(1);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-primary font-label-md text-label-md px-8 py-4 rounded-full border border-primary hover:bg-surface-container hover:scale-[1.02] transition-all duration-200 cursor-pointer font-bold active:scale-95"
                >
                  <Home className="size-4" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Thank You (Gated low rating feedback) */}
        {step === 4 && (
          <div className="w-full bg-surface-container-lowest rounded-2xl shadow-warm-ambient p-8 md:p-12 text-center relative overflow-hidden mt-4 border border-outline-variant/10 animate-in fade-in duration-500">
            {/* Decorative Header Element */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary/80 to-primary/20"></div>

            {/* Success Check Circle */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                <CheckCircle className="size-12 text-emerald-600 animate-in zoom-in duration-500" />
              </div>
            </div>

            <h1 className="font-headline-xl text-headline-xl text-primary mb-4 italic tracking-tight font-serif">
              Thank You!
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg mx-auto leading-relaxed">
              Thanks for sharing your experience and supporting <strong className="text-on-surface">{businessName}</strong>. Your feedback has been submitted directly to our management team for internal review. We appreciate your honesty and will use your input to improve our services.
            </p>

            {/* Actions */}
            <div className="flex justify-center items-center">
              <button
                onClick={() => {
                  form.reset();
                  setStep(1);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-full shadow-[0_8px_16px_-4px_rgba(148,66,72,0.3),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:bg-opacity-95 hover:shadow-[0_12px_24px_-4px_rgba(148,66,72,0.4),inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all duration-200 cursor-pointer font-bold active:scale-95"
              >
                <Home className="size-4" />
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile/Footer verified text */}
      <footer className="w-full max-w-2xl mx-auto py-6 border-t border-outline-variant/20 text-center text-xs text-on-surface-variant/60 relative z-10 mt-8">
        Secure feedback verified by ReviewFlow AI • Powered by Escellence AI Review
      </footer>
    </div>
  );
}
