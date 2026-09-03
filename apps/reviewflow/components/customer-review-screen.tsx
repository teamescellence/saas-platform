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

const MESSAGES = [
  "Tap a stamp to rate your visit",
  "We're sorry it wasn't great — tell us what went wrong",
  "Thanks for the honesty. What could we do better?",
  "Thanks for sharing! A few words go a long way",
  "Glad you enjoyed it! What stood out to you?",
  "Wonderful! We'd love to hear the details",
];

// Helper to map tag text or icon ID to Lucide Icons dynamically
function getTagIcon(tagNameOrIconId: string): React.ComponentType<{ className?: string }> {
  if (!tagNameOrIconId) return LucideIcons.Sparkles;
  if ((LucideIcons as any)[tagNameOrIconId]) {
    return (LucideIcons as any)[tagNameOrIconId];
  }
  const lower = tagNameOrIconId.toLowerCase();
  if (lower.includes("deliver") || lower.includes("truck") || lower.includes("takeaway")) return LucideIcons.Truck;
  if (lower.includes("taste") || lower.includes("food") || lower.includes("dish") || lower.includes("meal")) return LucideIcons.UtensilsCrossed;
  if (lower.includes("coffee") || lower.includes("tea") || lower.includes("drink")) return LucideIcons.Coffee;
  if (lower.includes("wine") || lower.includes("bar")) return LucideIcons.Wine;
  if (lower.includes("staff") || lower.includes("people") || lower.includes("host") || lower.includes("team") || lower.includes("crew")) return LucideIcons.Users;
  if (lower.includes("ambience") || lower.includes("vibe") || lower.includes("decor") || lower.includes("atmosphere")) return LucideIcons.Sparkles;
  if (lower.includes("service") || lower.includes("speed") || lower.includes("fast") || lower.includes("quick")) return LucideIcons.Zap;
  if (lower.includes("clean") || lower.includes("hygiene")) return LucideIcons.ShieldCheck;
  if (lower.includes("value") || lower.includes("price") || lower.includes("affordable")) return LucideIcons.BadgePercent;
  if (lower.includes("music") || lower.includes("sound")) return LucideIcons.Music;
  if (lower.includes("wifi") || lower.includes("internet")) return LucideIcons.Wifi;
  if (lower.includes("park") || lower.includes("car")) return LucideIcons.Car;
  if (lower.includes("kid") || lower.includes("family") || lower.includes("friendly") || lower.includes("smile")) return LucideIcons.Smile;
  if (lower.includes("clock") || lower.includes("time") || lower.includes("wait")) return LucideIcons.Clock;
  if (lower.includes("star") || lower.includes("quality")) return LucideIcons.Star;
  if (lower.includes("award") || lower.includes("chef")) return LucideIcons.Award;
  if (lower.includes("flame") || lower.includes("hot") || lower.includes("fresh")) return LucideIcons.Flame;
  if (lower.includes("overall") || lower.includes("love") || lower.includes("heart") || lower.includes("experience")) return LucideIcons.Heart;
  return LucideIcons.Sparkles;
}

// ── Zod Schema ───────────────────────────────────────────────────────────────
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  selectedTags: z.array(z.string()),
  customComment: z.string().max(5000),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// ── Props ────────────────────────────────────────────────────────────────────
interface CustomerReviewScreenProps {
  token: string;
  initialSessionData?: any;
  serverError?: string | null;
}

type ViewState = "write" | "generating" | "done" | "share" | "thankyou";

export function CustomerReviewScreen({
  token,
  initialSessionData,
  serverError,
}: CustomerReviewScreenProps) {
  const [viewState, setViewState] = React.useState<ViewState>("write");
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);
  const [aiDraft, setAiDraft] = React.useState("");
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
  const businessName = sessionData?.business?.name || "Brew & Bliss";
  const category = sessionData?.business?.category || "cafe";
  const logoUrl = sessionData?.business?.logo;

  const googleReviewUrl =
    sessionData?.business?.google_review_url ||
    "https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs";
  const tripadvisorUrl = sessionData?.business?.tripadvisor_url;
  const makemytripUrl = sessionData?.business?.makemytrip_url;

  const dynamicTags: string[] = Array.isArray(sessionData?.business?.review_tags)
    ? sessionData.business.review_tags
    : [];

  const branchName = sessionData?.branch?.name || "Main Branch";
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
    onSuccess: () => {
      const rating = getValues("rating");
      if (rating >= 4) {
        setViewState("generating");
        generateDraftMutation.mutate();
      } else {
        setViewState("thankyou");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  const generateDraftMutation = useMutation({
    mutationFn: async () => {
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
      setAiDraft(data.draft?.generated_text || "");
      setViewState("done");
    },
    onError: (err: any) => {
      toast.error(err.message || "AI generation failed");
      setViewState("thankyou");
    },
  });

  const toggleTag = (tag: string) => {
    const current = getValues("selectedTags");
    setValue(
      "selectedTags",
      current.includes(tag) ? current.filter((t: string) => t !== tag) : [...current, tag],
      { shouldValidate: true }
    );
  };

  const handleCopyReview = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft).catch(() => {});
    }

    const targetUrl =
      googleReviewUrl ||
      `https://www.google.com/search?q=${encodeURIComponent(businessName + " write google review")}`;

    toast.success("Review copied to clipboard! Opening Google Reviews...");

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }

    setViewState("share");
  };

  const handleFocusEdit = () => {
    if (reviewTextareaRef.current) {
      reviewTextareaRef.current.focus();
      toast.info("You can now edit your review text directly");
    }
  };

  const handlePlatformShare = (platformUrl: string | undefined, platformName: string) => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft).catch(() => {});
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

  // Dynamic step label
  let stepText = "Feedback ticket · Step 1 of 3";
  if (viewState === "write") {
    stepText = formRating > 0 && formRating < 4 ? "Feedback ticket · Step 1 of 2" : "Feedback ticket · Step 1 of 3";
  } else if (viewState === "generating") {
    stepText = "Feedback ticket · Generating AI Review";
  } else if (viewState === "done") {
    stepText = "Feedback ticket · Step 2 of 3";
  } else if (viewState === "share") {
    stepText = "Feedback ticket · Step 3 of 3";
  } else if (viewState === "thankyou") {
    stepText = "Feedback ticket · Completed";
  }

  // ── Error state ────────────────────────────────────────────────────────────
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
        className="min-h-screen w-full flex items-center justify-center p-5 font-sans antialiased"
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

            {/* Tear line */}
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
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-90 active:scale-95 focus:outline-none cursor-pointer"
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

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-5 font-sans antialiased"
      style={{
        background: `radial-gradient(circle at 50% 25%, ${COLORS.backdropCenter} 0%, ${COLORS.backdropEdge} 70%)`,
      }}
    >
      <div className="w-full max-w-sm">
        <div className="rounded-2xl shadow-2xl px-7 py-8 relative overflow-hidden" style={{ backgroundColor: COLORS.paper }}>
          
          {/* Ticket header */}
          <div className="text-center flex flex-col items-center">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={businessName}
                className="w-10 h-10 rounded-xl object-cover mb-3 border"
                style={{ borderColor: COLORS.paperLine }}
              />
            )}
            <h1 className="font-mono font-bold text-lg tracking-widest uppercase leading-tight" style={{ color: COLORS.ink }}>
              {businessName}
            </h1>
            {branchName && (
              <p className="font-mono text-xs mt-1" style={{ color: COLORS.inkMuted }}>
                {branchName} {tableName ? `· ${tableName}` : ""}
              </p>
            )}
            <p className="font-mono text-xs mt-3 tracking-widest uppercase" style={{ color: COLORS.inkMuted }}>
              {stepText}
            </p>
          </div>

          {/* Tear line with notches */}
          <div className="relative -mx-7 my-6 flex items-center justify-between">
            <div className="absolute left-0 w-3 h-6 rounded-r-full -translate-x-1/2" style={{ backgroundColor: COLORS.backdropEdge }} />
            <div className="w-full border-t-2 border-dashed" style={{ borderColor: COLORS.paperLine }} />
            <div className="absolute right-0 w-3 h-6 rounded-l-full translate-x-1/2" style={{ backgroundColor: COLORS.backdropEdge }} />
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 1. WRITE STATE */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "write" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <h2 className="font-bold text-xl leading-tight" style={{ color: COLORS.ink }}>
                  How was your experience?
                </h2>
                <p className="text-sm mt-1 mb-6" style={{ color: COLORS.inkMuted }}>
                  Give us your honest take — it takes 30 seconds
                </p>

                {/* Stamp rating */}
                <div className="flex justify-center gap-3 mb-3">
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
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 cursor-pointer",
                          filled ? "" : "border-2 border-dashed"
                        )}
                        style={{
                          backgroundColor: filled ? COLORS.stamp : "transparent",
                          borderColor: filled ? "transparent" : COLORS.inkMuted,
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

                <div className="h-10 flex items-center justify-center text-center">
                  <p className="text-xs font-medium px-2 leading-snug" style={{ color: COLORS.ink }}>
                    {MESSAGES[currentDisplayRating]}
                  </p>
                </div>
              </div>

              {/* Progressive disclosure fields when rating selected */}
              {formRating > 0 && (
                <div className="motion-preset-fade motion-preset-slide-down-xs motion-duration-300 mt-2">
                  {/* Highlights / Dynamic Tags */}
                  {dynamicTags.length > 0 && (
                    <div className="mt-4">
                      <label
                        className="block font-semibold text-xs mb-3 text-center"
                        style={{ color: COLORS.ink }}
                      >
                        Select what stood out to you.
                      </label>
                      <div className="flex flex-wrap gap-2 justify-center">
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
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase border transition-all duration-150 active:scale-95 cursor-pointer",
                                isSelected ? "shadow-sm" : ""
                              )}
                              style={{
                                backgroundColor: isSelected ? COLORS.stamp : COLORS.paperInset,
                                color: isSelected ? COLORS.paperInset : COLORS.ink,
                                borderColor: isSelected ? "transparent" : COLORS.paperLine,
                              }}
                            >
                              <TagIcon className="w-3.5 h-3.5" />
                              <span>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Optional Note */}
                  <div className="mt-5">
                    <label
                      htmlFor="visit-note"
                      className="block font-mono text-xs tracking-widest uppercase mb-2 text-center"
                      style={{ color: COLORS.inkMuted }}
                    >
                      Anything else to add? (optional)
                    </label>
                    <textarea
                      id="visit-note"
                      {...register("customComment")}
                      placeholder={
                        formRating >= 4
                          ? "The service was great, staff was friendly..."
                          : "Tell us what went wrong so we can fix it..."
                      }
                      rows={2}
                      className="w-full rounded-xl px-4 py-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                      style={{
                        backgroundColor: COLORS.paperInset,
                        color: COLORS.ink,
                        border: `1px solid ${COLORS.paperLine}`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="mt-6">
                <button
                  type="button"
                  disabled={formRating === 0 || submitFeedbackMutation.isPending}
                  onClick={() => submitFeedbackMutation.mutate()}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2",
                    formRating > 0 && !submitFeedbackMutation.isPending
                      ? "hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                      : "cursor-not-allowed opacity-60"
                  )}
                  style={{
                    backgroundColor: formRating > 0 ? COLORS.stamp : COLORS.stampOff,
                    color: formRating > 0 ? COLORS.paperInset : COLORS.inkMuted,
                  }}
                >
                  {submitFeedbackMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating Your Review...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Sparkles className="w-4 h-4" />
                      Create My Review
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2. GENERATING STATE */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "generating" && (
            <div className="flex flex-col items-center justify-center py-12 text-center motion-preset-fade motion-duration-300">
              <div className="animate-spin mb-4" style={{ color: COLORS.stamp }}>
                <LucideIcons.Sparkles className="w-12 h-12" />
              </div>
              <h2 className="font-bold text-lg font-mono uppercase" style={{ color: COLORS.ink }}>
                Crafting Review
              </h2>
              <p className="text-sm mt-2 max-w-[240px] leading-relaxed" style={{ color: COLORS.inkMuted }}>
                Our AI is writing a personalized review based on what you selected...
              </p>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 3. REVIEW READY & EDITABLE STATE */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "done" && (
            <div className="motion-preset-fade motion-preset-slide-up-sm motion-duration-500">
              <div className="text-center">
                <h2 className="font-bold text-xl leading-tight" style={{ color: COLORS.ink }}>
                  Your review is ready ✨
                </h2>
                <p className="text-xs mt-1 mb-4" style={{ color: COLORS.inkMuted }}>
                  We created a review based on what you selected. Feel free to edit it.
                </p>

                {/* Rating stamps preview */}
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

                {/* Editable Review Text Box */}
                <div
                  className="rounded-xl p-4 text-left border-2 border-dashed relative mb-5 focus-within:ring-2 focus-within:ring-emerald-700"
                  style={{
                    backgroundColor: COLORS.paperInset,
                    borderColor: COLORS.paperLine,
                  }}
                >
                  <textarea
                    ref={reviewTextareaRef}
                    value={aiDraft}
                    onChange={(e) => setAiDraft(e.target.value)}
                    rows={5}
                    className="w-full bg-transparent border-0 resize-none text-xs leading-relaxed font-medium focus:outline-none"
                    style={{ color: COLORS.ink }}
                    placeholder="Write your review here..."
                  />
                  <div className="absolute -top-3 -right-2 transform rotate-12">
                    <span className="bg-emerald-800 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      AI Draft
                    </span>
                  </div>
                </div>

                {/* Action CTAs: [ Edit Review ] [ Copy Review ] */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleFocusEdit}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs border transition-all duration-150 hover:bg-black/5 active:scale-95 focus:outline-none cursor-pointer"
                    style={{
                      borderColor: COLORS.paperLine,
                      color: COLORS.ink,
                    }}
                  >
                    <LucideIcons.Edit3 className="w-3.5 h-3.5" />
                    Edit Review
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyReview}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs transition-all duration-150 hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer shadow-md"
                    style={{
                      backgroundColor: COLORS.stamp,
                      color: COLORS.paperInset,
                    }}
                  >
                    <LucideIcons.Copy className="w-3.5 h-3.5" />
                    Copy &amp; Post on Google
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 4. PLATFORM SHARE STATE */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "share" && (
            <div className="motion-preset-fade motion-preset-slide-up-sm motion-duration-500">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.stamp}15` }}>
                    <LucideIcons.Share2 className="size-5" style={{ color: COLORS.stamp }} />
                  </div>
                </div>

                <h2 className="font-bold text-xl leading-tight" style={{ color: COLORS.ink }}>
                  Share your experience
                </h2>
                <p className="text-xs mt-1 mb-5" style={{ color: COLORS.inkMuted }}>
                  Tap below to open the platform and paste your copied review:
                </p>

                {/* Platforms List */}
                <div className="space-y-2.5 mb-5">
                  {/* Google (Always Available) */}
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
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <span>Post Review</span>
                      <LucideIcons.ExternalLink className="size-3.5 opacity-80" />
                    </div>
                  </button>

                  {/* TripAdvisor (Only for Hotels / Hospitality) */}
                  {(category.toLowerCase().includes("hotel") || category.toLowerCase().includes("resort")) && tripadvisorUrl && (
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

                  {/* MakeMyTrip (Only for Hotels / Hospitality) */}
                  {(category.toLowerCase().includes("hotel") || category.toLowerCase().includes("resort")) && makemytripUrl && (
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

                {/* Back to Edit Button */}
                <button
                  type="button"
                  onClick={() => setViewState("done")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:underline cursor-pointer"
                  style={{ color: COLORS.inkMuted }}
                >
                  <LucideIcons.ArrowLeft className="size-3.5" /> Back to Review Text
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 5. THANKYOU STATE (For direct/private feedback) */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "thankyou" && (
            <div className="text-center py-6 motion-preset-fade motion-duration-300">
              <div className="flex justify-center mb-4 motion-preset-pop motion-duration-500">
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
                    setViewState("write");
                    setAiDraft("");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
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

        {/* Footer */}
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
