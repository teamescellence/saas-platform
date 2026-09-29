"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { api, endpoints } from "@/lib/api";
import { toast } from "sonner";

// ── Theme Design Tokens & Config ─────────────────────────────────────────────
const COLORS = {
  backdropCenter: "#2A2019",
  backdropEdge: "#140F0C",
  backdropMuted: "#9C9186",
  paper: "#EAE6DC",
  paperInset: "#F4F2EC",
  paperLine: "#C9C2B4",
  ink: "#2B2420",
  inkMuted: "#6B6459",
  stamp: "#2F5D45",
  stampOff: "#DAD5C8",
};

const TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2"];

const DEFAULT_TAGS = ["STAFF", "TASTE", "OVERALL", "VALUE FOR MONEY"];

// Helper to map tag text or icon ID to Lucide Icons dynamically
function getTagIcon(tagNameOrIconId: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  if (!tagNameOrIconId) return LucideIcons.Sparkles;
  if ((LucideIcons as any)[tagNameOrIconId]) {
    return (LucideIcons as any)[tagNameOrIconId];
  }
  const lower = tagNameOrIconId.toLowerCase();
  if (lower.includes("staff") || lower.includes("people") || lower.includes("host") || lower.includes("team") || lower.includes("crew")) return LucideIcons.Users;
  if (lower.includes("taste") || lower.includes("food") || lower.includes("dish") || lower.includes("meal")) return LucideIcons.UtensilsCrossed;
  if (lower.includes("overall") || lower.includes("love") || lower.includes("heart") || lower.includes("experience")) return LucideIcons.Heart;
  if (lower.includes("value") || lower.includes("price") || lower.includes("money") || lower.includes("affordable")) return LucideIcons.BadgePercent;
  if (lower.includes("deliver") || lower.includes("truck") || lower.includes("takeaway")) return LucideIcons.Truck;
  if (lower.includes("coffee") || lower.includes("tea") || lower.includes("drink")) return LucideIcons.Coffee;
  if (lower.includes("wine") || lower.includes("bar")) return LucideIcons.Wine;
  if (lower.includes("ambience") || lower.includes("vibe") || lower.includes("decor") || lower.includes("atmosphere")) return LucideIcons.Sparkles;
  if (lower.includes("service") || lower.includes("speed") || lower.includes("fast") || lower.includes("quick")) return LucideIcons.Zap;
  if (lower.includes("clean") || lower.includes("hygiene")) return LucideIcons.ShieldCheck;
  if (lower.includes("music") || lower.includes("sound")) return LucideIcons.Music;
  if (lower.includes("wifi") || lower.includes("internet")) return LucideIcons.Wifi;
  if (lower.includes("park") || lower.includes("car")) return LucideIcons.Car;
  if (lower.includes("kid") || lower.includes("family") || lower.includes("friendly") || lower.includes("smile")) return LucideIcons.Smile;
  if (lower.includes("clock") || lower.includes("time") || lower.includes("wait")) return LucideIcons.Clock;
  if (lower.includes("star") || lower.includes("quality")) return LucideIcons.Star;
  if (lower.includes("award") || lower.includes("chef")) return LucideIcons.Award;
  if (lower.includes("flame") || lower.includes("hot") || lower.includes("fresh")) return LucideIcons.Flame;
  return LucideIcons.Sparkles;
}

// ── Zod Schema ───────────────────────────────────────────────────────────────
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  selectedTags: z.array(z.string()),
  customComment: z.string().max(5000),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// ── Props & View State ───────────────────────────────────────────────────────
interface CustomerReviewScreenProps {
  token: string;
  initialSessionData?: any;
  serverError?: string | null;
}

type ViewState =
  | "step1_rating"
  | "step2_details"
  | "generating"
  | "review_ready"
  | "share"
  | "thankyou";

export function CustomerReviewScreen({
  token,
  initialSessionData,
  serverError,
}: CustomerReviewScreenProps) {
  const [viewState, setViewState] = React.useState<ViewState>("step1_rating");
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);
  const [aiDraft, setAiDraft] = React.useState("");
  const [editedReview, setEditedReview] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const reviewTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, selectedTags: [], customComment: "" },
  });

  const { register, setValue, watch, getValues } = form;
  const formRating = watch("rating");
  const formSelectedTags = watch("selectedTags");

  // ── Session Query ──────────────────────────────────────────────────────────
  const { data: sessionData, error: queryError } = useQuery({
    queryKey: ["reviewSession", token],
    queryFn: () => api.get<any>(endpoints.publicReviewSession(token)),
    enabled: !!token,
    retry: false,
    initialData: initialSessionData || undefined,
  });

  const activeError = queryError || serverError;
  const businessName = sessionData?.business?.name || "NAMOKA";
  const category = sessionData?.business?.category || "cafe";
  const logoUrl = sessionData?.business?.logo;

  const googleReviewUrl =
    sessionData?.business?.google_review_url ||
    "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs";
  const tripadvisorUrl = sessionData?.business?.tripadvisor_url;
  const makemytripUrl = sessionData?.business?.makemytrip_url;

  const rawTagsFromApi = sessionData?.business?.review_tags;
  const dynamicTags: string[] =
    Array.isArray(rawTagsFromApi) && rawTagsFromApi.length > 0
      ? rawTagsFromApi
      : DEFAULT_TAGS;

  const branchName = sessionData?.branch?.name || "Main Location";
  const tableName = sessionData?.qr_code?.name || "Table";
  const activeToken = sessionData?.session_token || token;

  const currentDisplayRating = hoveredRating !== null ? hoveredRating : formRating;

  // Resolve Category Icon dynamically
  const getCategoryIcon = (catId: string) => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === catId);
    const iconName = cat?.icon || "Star";
    return (LucideIcons as any)[iconName] || LucideIcons.Star;
  };

  const CategoryIconComponent = getCategoryIcon(category);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      const rawComment = (getValues("customComment") || "").trim();
      const tags = getValues("selectedTags") || [];
      const commentText =
        tags.length > 0
          ? rawComment
            ? `Highlights: ${tags.join(", ")}. ${rawComment}`
            : `Highlights: ${tags.join(", ")}`
          : rawComment;

      return api.post<any>(endpoints.publicSubmitFeedback(activeToken), {
        rating: getValues("rating"),
        comment: commentText,
        language: "en",
      });
    },
    onError: (_err: any) => {
      toast.error("Something went wrong submitting feedback. Please try again.");
    },
  });

  const generateDraftMutation = useMutation({
    mutationFn: async () => {
      setGenerationError(null);
      const rawComment = (getValues("customComment") || "").trim();
      const tags = getValues("selectedTags") || [];
      const commentText =
        tags.length > 0
          ? rawComment
            ? `Highlights: ${tags.join(", ")}. ${rawComment}`
            : `Highlights: ${tags.join(", ")}`
          : rawComment;

      return api.post<any>(endpoints.publicGenerateDraft(activeToken), {
        rating: getValues("rating"),
        comment: commentText,
      });
    },
    onSuccess: (data) => {
      const draftText = data.draft?.generated_text || "";
      setAiDraft(draftText);
      setEditedReview(draftText);
      setIsEditing(false);
      setViewState("review_ready");
    },
    onError: (_err: any) => {
      setGenerationError("Something went wrong while creating your review. Please try again.");
    },
  });

  // Handle flow transition from Screen 2 submit
  const handleProceedFromDetails = async () => {
    const rating = getValues("rating");
    if (rating >= 4) {
      setViewState("generating");
      try {
        await submitFeedbackMutation.mutateAsync();
      } catch {
        // Continue generation even if log feedback submit encountered minor issue
      }
      generateDraftMutation.mutate();
    } else {
      setViewState("generating");
      try {
        await submitFeedbackMutation.mutateAsync();
        setViewState("thankyou");
      } catch {
        setViewState("step2_details");
      }
    }
  };

  const toggleTag = (tag: string) => {
    const current = getValues("selectedTags");
    setValue(
      "selectedTags",
      current.includes(tag) ? current.filter((t: string) => t !== tag) : [...current, tag],
      { shouldValidate: true }
    );
  };

  const handleCopyReview = () => {
    const textToCopy = (editedReview || aiDraft).trim();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    toast.success("Review copied ✓");
    setViewState("share");
  };

  const handleToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        if (reviewTextareaRef.current) {
          reviewTextareaRef.current.focus();
        }
      }, 50);
    } else {
      setIsEditing(false);
    }
  };

  const handlePlatformShare = (platformUrl: string | undefined, platformName: string) => {
    const textToCopy = (editedReview || aiDraft).trim();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    toast.success(`Copied to clipboard! Opening ${platformName}...`);

    const targetUrl =
      platformUrl ||
      (platformName === "Google"
        ? googleReviewUrl
        : `https://www.google.com/search?q=${encodeURIComponent(businessName + " " + platformName + " review")}`);

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Header step text formatting
  let stepHeaderText = "FEEDBACK TICKET · STEP 1 OF 3";
  if (viewState === "step1_rating") {
    stepHeaderText = "FEEDBACK TICKET · STEP 1 OF 3";
  } else if (viewState === "step2_details") {
    stepHeaderText = "FEEDBACK TICKET · STEP 2 OF 3";
  } else if (viewState === "generating") {
    stepHeaderText = "FEEDBACK TICKET · GENERATING AI REVIEW";
  } else if (viewState === "review_ready") {
    stepHeaderText = "FEEDBACK TICKET · STEP 2 OF 3";
  } else if (viewState === "share") {
    stepHeaderText = "FEEDBACK TICKET · STEP 3 OF 3";
  } else if (viewState === "thankyou") {
    stepHeaderText = "FEEDBACK TICKET · COMPLETED";
  }

  // ── Error State Screen ─────────────────────────────────────────────────────
  if (activeError) {
    let errorMsg = "Invalid or expired review link. Please scan the QR code again.";
    const rawMsg = (activeError as any).message || "";

    if (
      rawMsg &&
      !rawMsg.includes("Model") &&
      !rawMsg.includes("query results") &&
      !rawMsg.includes("Exception") &&
      !rawMsg.includes("laravel") &&
      !rawMsg.includes("Handler")
    ) {
      errorMsg = rawMsg;
    }
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-5 font-sans antialiased select-none"
        style={{
          background: `radial-gradient(circle at 50% 25%, ${COLORS.backdropCenter} 0%, ${COLORS.backdropEdge} 70%)`,
        }}
      >
        <div className="w-full max-w-sm">
          <div className="rounded-2xl shadow-2xl px-7 py-8 relative overflow-hidden" style={{ backgroundColor: COLORS.paper }}>
            {/* Ticket header */}
            <div className="text-center">
              <h1 className="font-mono font-bold text-lg tracking-widest uppercase" style={{ color: COLORS.ink }}>
                ReviewFlow
              </h1>
              <p className="font-mono text-xs mt-3 tracking-widest uppercase" style={{ color: COLORS.inkMuted }}>
                Link Status
              </p>
            </div>

            {/* Tear line with notches */}
            <div className="relative -mx-7 my-6 flex items-center justify-between">
              <div className="absolute left-0 w-3 h-6 rounded-r-full -translate-x-1/2" style={{ backgroundColor: COLORS.backdropEdge }} />
              <div className="w-full border-t-2 border-dashed" style={{ borderColor: COLORS.paperLine }} />
              <div className="absolute right-0 w-3 h-6 rounded-l-full translate-x-1/2" style={{ backgroundColor: COLORS.backdropEdge }} />
            </div>

            {/* Error Content */}
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
                  <LucideIcons.ShieldAlert className="w-8 h-8 text-red-700" />
                </div>
              </div>
              <h2 className="font-bold text-xl" style={{ color: COLORS.ink }}>
                Link Expired
              </h2>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: COLORS.inkMuted }}>
                {errorMsg}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-90 active:scale-95 focus:outline-none cursor-pointer shadow-md"
                style={{
                  backgroundColor: COLORS.stamp,
                  color: COLORS.paperInset,
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Customer Journey Component ─────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-5 font-sans antialiased select-none"
      style={{
        background: `radial-gradient(circle at 50% 25%, ${COLORS.backdropCenter} 0%, ${COLORS.backdropEdge} 70%)`,
      }}
    >
      <div className="w-full max-w-sm">
        <div className="rounded-2xl shadow-2xl px-7 py-8 relative overflow-hidden" style={{ backgroundColor: COLORS.paper }}>

          {/* Ticket Header */}
          <div className="text-center flex flex-col items-center">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={businessName}
                className="w-10 h-10 rounded-xl object-cover mb-3 border shadow-sm"
                style={{ borderColor: COLORS.paperLine }}
              />
            )}
            <h1 className="font-mono font-bold text-lg tracking-widest uppercase leading-tight" style={{ color: COLORS.ink }}>
              {businessName}
            </h1>
            <p className="font-mono text-xs mt-1" style={{ color: COLORS.inkMuted }}>
              {branchName} · {tableName}
            </p>
            <p className="font-mono text-[11px] mt-3 tracking-widest uppercase font-semibold" style={{ color: COLORS.inkMuted }}>
              {stepHeaderText}
            </p>
          </div>

          {/* Ticket Cutout Tear Line */}
          <div className="relative -mx-7 my-6 flex items-center justify-between">
            <div className="absolute left-0 w-3 h-6 rounded-r-full -translate-x-1/2" style={{ backgroundColor: COLORS.backdropEdge }} />
            <div className="w-full border-t-2 border-dashed" style={{ borderColor: COLORS.paperLine }} />
            <div className="absolute right-0 w-3 h-6 rounded-l-full translate-x-1/2" style={{ backgroundColor: COLORS.backdropEdge }} />
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 1 — EXPERIENCE RATING */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "step1_rating" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <h2 className="font-bold text-xl leading-tight" style={{ color: COLORS.ink }}>
                  How was your experience?
                </h2>
                <p className="text-sm mt-1 mb-6" style={{ color: COLORS.inkMuted }}>
                  Give us your honest take — it takes 30 seconds
                </p>

                {/* 5 Rating Stamps */}
                <div className="flex justify-center gap-3 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = n <= currentDisplayRating;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setValue("rating", n, { shouldValidate: true })}
                        onMouseEnter={() => setHoveredRating(n)}
                        onMouseLeave={() => setHoveredRating(null)}
                        aria-label={`Rate ${n} out of 5`}
                        aria-pressed={filled}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer",
                          filled ? "" : "border-2 border-dashed"
                        )}
                        style={{
                          backgroundColor: filled ? COLORS.stamp : "transparent",
                          borderColor: filled ? "transparent" : COLORS.paperLine,
                        }}
                      >
                        <CategoryIconComponent
                          className={cn("w-5 h-5", TILTS[(n - 1) % TILTS.length])}
                          style={{ color: filled ? COLORS.paperInset : COLORS.inkMuted }}
                          strokeWidth={filled ? 2 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="h-8 flex items-center justify-center text-center">
                  <p className="text-xs font-medium px-2" style={{ color: COLORS.inkMuted }}>
                    Tap a stamp to rate your visit
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <button
                  type="button"
                  disabled={formRating === 0}
                  onClick={() => setViewState("step2_details")}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 focus:outline-none",
                    formRating > 0
                      ? "hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                      : "cursor-not-allowed opacity-50"
                  )}
                  style={{
                    backgroundColor: formRating > 0 ? COLORS.stamp : COLORS.stampOff,
                    color: formRating > 0 ? COLORS.paperInset : COLORS.inkMuted,
                  }}
                >
                  <LucideIcons.Sparkles className="w-4 h-4" />
                  Create My Review
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 2 — REVIEW DETAILS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "step2_details" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <h2 className="font-bold text-lg leading-tight" style={{ color: COLORS.ink }}>
                  Thanks for sharing! A few words go a long way
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wider mt-3 mb-3" style={{ color: COLORS.inkMuted }}>
                  Select what stood out to you.
                </p>

                {/* Category Chips */}
                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {dynamicTags.map((tagItem: any) => {
                    const label = typeof tagItem === "string" ? tagItem : tagItem?.label || "";
                    const iconId = typeof tagItem === "object" && tagItem?.icon ? tagItem.icon : label;
                    const TagIcon = getTagIcon(iconId);
                    const isSelected = formSelectedTags.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleTag(label)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold uppercase border transition-all duration-150 active:scale-95 cursor-pointer",
                          isSelected ? "shadow-sm" : ""
                        )}
                        style={{
                          backgroundColor: isSelected ? COLORS.stamp : COLORS.paperInset,
                          color: isSelected ? COLORS.paperInset : COLORS.ink,
                          borderColor: isSelected ? "transparent" : COLORS.paperLine,
                        }}
                      >
                        <TagIcon className="w-3.5 h-3.5" style={{ color: isSelected ? COLORS.paperInset : COLORS.ink }} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Anything else to add textarea */}
                <div className="text-left mt-4">
                  <label
                    htmlFor="visit-note"
                    className="block font-mono text-[11px] font-bold tracking-widest uppercase mb-2 text-center"
                    style={{ color: COLORS.inkMuted }}
                  >
                    ANYTHING ELSE TO ADD? (OPTIONAL)
                  </label>
                  <textarea
                    id="visit-note"
                    {...register("customComment")}
                    placeholder="Anything else you'd like to share?"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all font-medium"
                    style={{
                      backgroundColor: COLORS.paperInset,
                      color: COLORS.ink,
                      border: `1px solid ${COLORS.paperLine}`,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleProceedFromDetails}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer shadow-md focus:outline-none"
                  style={{
                    backgroundColor: COLORS.stamp,
                    color: COLORS.paperInset,
                  }}
                >
                  <LucideIcons.Sparkles className="w-4 h-4" />
                  Create My Review
                </button>

                <button
                  type="button"
                  onClick={() => setViewState("step1_rating")}
                  className="w-full text-center py-2 text-xs font-semibold hover:underline transition-all cursor-pointer"
                  style={{ color: COLORS.inkMuted }}
                >
                  ← Change Rating
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 3 — GENERATING AI REVIEW */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "generating" && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-300">
              {generationError ? (
                <div className="w-full">
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-100">
                      <LucideIcons.AlertTriangle className="w-7 h-7 text-red-700" />
                    </div>
                  </div>
                  <h3 className="font-bold text-base" style={{ color: COLORS.ink }}>
                    Generation Issue
                  </h3>
                  <p className="text-xs mt-2 mb-5 px-2 leading-relaxed" style={{ color: COLORS.inkMuted }}>
                    {generationError}
                  </p>
                  <button
                    type="button"
                    onClick={() => generateDraftMutation.mutate()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                    style={{
                      backgroundColor: COLORS.stamp,
                      color: COLORS.paperInset,
                    }}
                  >
                    <LucideIcons.RotateCcw className="w-3.5 h-3.5" />
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="animate-spin mb-4" style={{ color: COLORS.stamp }}>
                    <LucideIcons.Sparkles className="w-10 h-10" />
                  </div>
                  <h2 className="font-bold text-lg font-mono uppercase tracking-wider" style={{ color: COLORS.ink }}>
                    CRAFTING REVIEW
                  </h2>
                  <p className="text-xs mt-2 max-w-[230px] leading-relaxed" style={{ color: COLORS.inkMuted }}>
                    Our AI is writing a personalized review based on what you selected...
                  </p>
                </>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 4 — REVIEW READY */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "review_ready" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <h2 className="font-bold text-xl leading-tight" style={{ color: COLORS.ink }}>
                  Your review is ready ✨
                </h2>
                <p className="text-xs mt-1 mb-4" style={{ color: COLORS.inkMuted }}>
                  We created a review based on what you selected. Feel free to edit it.
                </p>

                {/* Rating Stamps Display */}
                <div className="flex justify-center gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = n <= formRating;
                    return (
                      <div
                        key={n}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: filled ? COLORS.stamp : COLORS.stampOff,
                        }}
                      >
                        <CategoryIconComponent
                          className="w-3.5 h-3.5"
                          style={{ color: filled ? COLORS.paperInset : COLORS.inkMuted }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Premium Review Card */}
                <div
                  className="rounded-xl p-4 text-left border-2 border-dashed relative mb-4 transition-all"
                  style={{
                    backgroundColor: COLORS.paperInset,
                    borderColor: COLORS.paperLine,
                  }}
                >
                  <div className="absolute -top-3 right-3">
                    <span className="bg-emerald-800 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      AI DRAFT
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        ref={reviewTextareaRef}
                        value={editedReview}
                        onChange={(e) => setEditedReview(e.target.value)}
                        rows={5}
                        className="w-full bg-white/70 rounded-lg p-2.5 border border-emerald-700/30 resize-none text-xs leading-relaxed font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        style={{ color: COLORS.ink }}
                        placeholder="Edit your review here..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditedReview(aiDraft);
                            setIsEditing(false);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer hover:bg-black/5"
                          style={{ borderColor: COLORS.paperLine, color: COLORS.inkMuted }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 rounded text-[11px] font-semibold text-white cursor-pointer shadow-sm"
                          style={{ backgroundColor: COLORS.stamp }}
                        >
                          Save Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-xs leading-relaxed font-medium pt-1 italic whitespace-pre-line"
                      style={{ color: COLORS.ink }}
                    >
                      &ldquo;{editedReview || aiDraft}&rdquo;
                    </p>
                  )}
                </div>

                {/* Secondary Actions: [ Edit Review ] [ Try Another ] */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={handleToggleEdit}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs border transition-all duration-150 hover:bg-black/5 active:scale-95 cursor-pointer"
                    style={{
                      borderColor: COLORS.paperLine,
                      color: COLORS.ink,
                    }}
                  >
                    <LucideIcons.Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? "Save Edits" : "Edit Review"}
                  </button>

                  <button
                    type="button"
                    disabled={generateDraftMutation.isPending}
                    onClick={() => generateDraftMutation.mutate()}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs border transition-all duration-150 hover:bg-black/5 active:scale-95 cursor-pointer"
                    style={{
                      borderColor: COLORS.paperLine,
                      color: COLORS.ink,
                    }}
                  >
                    {generateDraftMutation.isPending ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LucideIcons.RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Try Another
                  </button>
                </div>

                {/* Primary CTA: Copy & Post on Google */}
                <button
                  type="button"
                  onClick={handleCopyReview}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer shadow-md focus:outline-none"
                  style={{
                    backgroundColor: COLORS.stamp,
                    color: COLORS.paperInset,
                  }}
                >
                  <LucideIcons.Copy className="w-4 h-4" />
                  Copy &amp; Post on Google
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 5 — SHARE / POST */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "share" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="size-11 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: `${COLORS.stamp}18` }}>
                    <LucideIcons.Share2 className="size-5" style={{ color: COLORS.stamp }} />
                  </div>
                </div>

                <h2 className="font-bold text-xl leading-tight" style={{ color: COLORS.ink }}>
                  Share your experience
                </h2>
                <p className="text-xs mt-1 mb-5" style={{ color: COLORS.inkMuted }}>
                  Tap below to open the platform and paste your copied review:
                </p>

                {/* Platform Card List */}
                <div className="space-y-2.5 mb-5">
                  {/* Google Maps & Search Card */}
                  <button
                    type="button"
                    onClick={() => handlePlatformShare(googleReviewUrl, "Google")}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 hover:shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: COLORS.paperInset,
                      borderColor: COLORS.paperLine,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <LucideIcons.Star className="size-5 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold" style={{ color: COLORS.ink }}>Google</p>
                        <p className="text-[10px]" style={{ color: COLORS.inkMuted }}>Google Maps &amp; Search Reviews</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                      <span>Post Review</span>
                      <LucideIcons.ExternalLink className="size-3.5" />
                    </div>
                  </button>

                  {/* Optional TripAdvisor Card (if configured) */}
                  {tripadvisorUrl && (
                    <button
                      type="button"
                      onClick={() => handlePlatformShare(tripadvisorUrl, "TripAdvisor")}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 hover:shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer focus:outline-none"
                      style={{
                        backgroundColor: COLORS.paperInset,
                        borderColor: COLORS.paperLine,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <LucideIcons.Compass className="size-5 text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold" style={{ color: COLORS.ink }}>TripAdvisor</p>
                          <p className="text-[10px]" style={{ color: COLORS.inkMuted }}>Travelers &amp; Guests</p>
                        </div>
                      </div>
                      <LucideIcons.ExternalLink className="size-4 opacity-50" style={{ color: COLORS.ink }} />
                    </button>
                  )}

                  {/* Optional MakeMyTrip Card (if configured) */}
                  {makemytripUrl && (
                    <button
                      type="button"
                      onClick={() => handlePlatformShare(makemytripUrl, "MakeMyTrip")}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 hover:shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer focus:outline-none"
                      style={{
                        backgroundColor: COLORS.paperInset,
                        borderColor: COLORS.paperLine,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                          <LucideIcons.Plane className="size-5 text-red-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold" style={{ color: COLORS.ink }}>MakeMyTrip</p>
                          <p className="text-[10px]" style={{ color: COLORS.inkMuted }}>Hotel &amp; Resort Stay</p>
                        </div>
                      </div>
                      <LucideIcons.ExternalLink className="size-4 opacity-50" style={{ color: COLORS.ink }} />
                    </button>
                  )}
                </div>

                {/* Back to Review Text Button */}
                <button
                  type="button"
                  onClick={() => setViewState("review_ready")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:underline cursor-pointer"
                  style={{ color: COLORS.inkMuted }}
                >
                  <LucideIcons.ArrowLeft className="size-3.5" /> Back to Review Text
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 6 — THANK YOU (Direct/Private Feedback) */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "thankyou" && (
            <div className="text-center py-6 animate-in fade-in duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.stampOff }}>
                  <LucideIcons.ShieldCheck className="w-8 h-8" style={{ color: COLORS.stamp }} />
                </div>
              </div>
              <h2 className="font-bold text-xl" style={{ color: COLORS.ink }}>
                Feedback Submitted
              </h2>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: COLORS.inkMuted }}>
                Thank you for sharing your thoughts. Your feedback has been shared directly with the management at{" "}
                <strong style={{ color: COLORS.ink }}>{businessName}</strong>.
              </p>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setViewState("step1_rating");
                    setAiDraft("");
                    setEditedReview("");
                    setIsEditing(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-90 active:scale-95 focus:outline-none cursor-pointer shadow-md"
                  style={{
                    backgroundColor: COLORS.stamp,
                    color: COLORS.paperInset,
                  }}
                >
                  Submit Another Response
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Brand Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <LucideIcons.Sparkles className="w-3.5 h-3.5" style={{ color: COLORS.backdropMuted }} />
          <span className="font-mono text-xs tracking-wide animate-pulse" style={{ color: COLORS.backdropMuted }}>
            Powered by Escellence · ReviewFlow AI
          </span>
        </div>
      </div>
    </div>
  );
}
