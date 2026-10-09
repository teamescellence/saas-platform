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
import { mockGenerateReviewOptions, ReviewOption } from "@/lib/mock-review-generator";
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
  | "share"
  | "thankyou";

export function CustomerReviewScreen({
  token,
  initialSessionData,
  serverError,
}: CustomerReviewScreenProps) {
  const [viewState, setViewState] = React.useState<ViewState>("step1_rating");
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  // Review options & editing state
  const [reviewOptions, setReviewOptions] = React.useState<ReviewOption[]>([]);
  const [editingOptionId, setEditingOptionId] = React.useState<string | null>(null);
  const [copiedText, setCopiedText] = React.useState<string>("");

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 5, selectedTags: [], customComment: "" },
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

  // Generate review options whenever rating, tags, or custom comments change
  React.useEffect(() => {
    const currentRating = formRating > 0 ? formRating : 5;
    const generatedList = mockGenerateReviewOptions({
      rating: currentRating,
      selectedTags: getValues("selectedTags") || [],
      additionalComment: (getValues("customComment") || "").trim(),
      businessName,
    });
    setReviewOptions(generatedList);
  }, [formRating, watch("selectedTags"), watch("customComment"), businessName]);

  // Resolve Category Icon dynamically
  const getCategoryIcon = (catId: string) => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === catId);
    const iconName = cat?.icon || "Star";
    return (LucideIcons as any)[iconName] || LucideIcons.Star;
  };

  const CategoryIconComponent = getCategoryIcon(category);

  // ── Feedback Submit Mutation ──────────────────────────────────────────────
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
      // Silent log error
    },
  });

  const handleRatingChange = (n: number) => {
    setValue("rating", n, { shouldValidate: true });
    if (n < 4) {
      // If low rating (1-3 stars), direct to private feedback thank you
      submitFeedbackMutation.mutate();
      setViewState("thankyou");
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

  const handleCopyOption = (optionText: string) => {
    const textToCopy = optionText.trim();
    if (textToCopy) {
      setCopiedText(textToCopy);
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    submitFeedbackMutation.mutate();
    toast.success("Review copied ✓");
    setViewState("share");
  };

  const handleUpdateOptionText = (id: string, newText: string) => {
    setReviewOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text: newText } : opt))
    );
  };

  const handlePlatformShare = (platformUrl: string | undefined, platformName: string) => {
    if (copiedText) {
      navigator.clipboard.writeText(copiedText).catch(() => {});
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
  let stepHeaderText = "STEP 1 OF 3 • RATING & REVIEWS";
  let stepProgressWidth = "33%";
  if (viewState === "step1_rating") {
    stepHeaderText = "STEP 1 OF 3 • RATING & REVIEWS";
    stepProgressWidth = "33%";
  } else if (viewState === "step2_details") {
    stepHeaderText = "STEP 2 OF 3 • CUSTOMIZE HIGHLIGHTS";
    stepProgressWidth = "66%";
  } else if (viewState === "share") {
    stepHeaderText = "STEP 3 OF 3 • POST ON GOOGLE";
    stepProgressWidth = "100%";
  } else if (viewState === "thankyou") {
    stepHeaderText = "COMPLETED • PRIVATE FEEDBACK";
    stepProgressWidth = "100%";
  }

  // Rating label helper
  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5:
        return "Loved it! Absolutely wonderful";
      case 4:
        return "Good! Very enjoyable";
      case 3:
        return "Okay! Room for improvement";
      case 2:
        return "Needs improvement";
      case 1:
        return "Unsatisfactory experience";
      default:
        return "Tap stars to rate";
    }
  };

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
        className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans antialiased select-none relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${COLORS.backdropCenter} 0%, ${COLORS.backdropEdge} 65%, #0B0806 100%)`,
        }}
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="w-full max-w-md relative z-10">
          <div
            className="rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] border border-amber-950/20 px-6 sm:px-8 py-8 relative overflow-hidden"
            style={{ backgroundColor: COLORS.paper }}
          >
            <div className="h-1.5 w-full absolute top-0 left-0 bg-red-800" />

            {/* Header */}
            <div className="text-center pt-2">
              <h1
                className="font-mono font-bold text-lg tracking-widest uppercase"
                style={{ color: COLORS.ink }}
              >
                ReviewFlow AI
              </h1>
              <p
                className="font-mono text-xs mt-1 tracking-widest uppercase font-semibold"
                style={{ color: COLORS.inkMuted }}
              >
                Link Status
              </p>
            </div>

            {/* Tear line with notches */}
            <div className="relative -mx-6 sm:-mx-8 my-6 flex items-center justify-between">
              <div
                className="w-4 h-7 rounded-r-full -translate-x-1/2"
                style={{ backgroundColor: COLORS.backdropEdge }}
              />
              <div
                className="w-full border-t-2 border-dashed"
                style={{ borderColor: COLORS.paperLine }}
              />
              <div
                className="w-4 h-7 rounded-l-full translate-x-1/2"
                style={{ backgroundColor: COLORS.backdropEdge }}
              />
            </div>

            {/* Error Content */}
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-100 border border-red-200 shadow-sm">
                  <LucideIcons.ShieldAlert className="w-8 h-8 text-red-700" />
                </div>
              </div>
              <h2 className="font-bold text-xl" style={{ color: COLORS.ink }}>
                Link Expired or Invalid
              </h2>
              <p
                className="text-xs sm:text-sm mt-2 leading-relaxed"
                style={{ color: COLORS.inkMuted }}
              >
                {errorMsg}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-95 active:scale-95 focus:outline-none cursor-pointer shadow-md"
                style={{
                  backgroundColor: COLORS.stamp,
                  color: COLORS.paperInset,
                }}
              >
                <LucideIcons.RotateCw className="size-4" />
                Try Scanning Again
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
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans antialiased select-none relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 20%, ${COLORS.backdropCenter} 0%, ${COLORS.backdropEdge} 65%, #0B0806 100%)`,
      }}
    >
      {/* Background glow ambient particle */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-md relative z-10 my-4">
        {/* Ticket Outer Shell */}
        <div
          className="rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7),0_15px_30px_-10px_rgba(0,0,0,0.5)] border border-[#EBE6DC]/20 px-6 sm:px-8 py-7 relative overflow-hidden transition-all duration-300"
          style={{ backgroundColor: COLORS.paper }}
        >
          {/* Top Decorative Stripe */}
          <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[#2F5D45] via-[#438260] to-[#2F5D45]" />

          {/* Ticket Header */}
          <div className="text-center flex flex-col items-center pt-1">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={businessName}
                className="w-12 h-12 rounded-2xl object-cover mb-3 border-2 shadow-sm"
                style={{ borderColor: COLORS.paperLine }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs border"
                style={{
                  backgroundColor: COLORS.paperInset,
                  borderColor: COLORS.paperLine,
                }}
              >
                <span className="font-serif font-black text-xl text-[#2F5D45]">
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <h1
              className="font-bold text-xl sm:text-2xl tracking-tight uppercase leading-tight font-serif"
              style={{ color: COLORS.ink }}
            >
              {businessName}
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span
                className="font-mono text-xs flex items-center gap-1 font-semibold"
                style={{ color: COLORS.inkMuted }}
              >
                <LucideIcons.MapPin className="size-3 text-[#2F5D45]" />
                {branchName}
              </span>
              <span className="text-xs" style={{ color: COLORS.paperLine }}>
                •
              </span>
              <span
                className="font-mono text-xs font-medium"
                style={{ color: COLORS.inkMuted }}
              >
                {tableName}
              </span>
            </div>

            {/* Step Badge & Progress Line */}
            <div className="mt-3.5 w-full flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F5D45]/10 border border-[#2F5D45]/25">
                <LucideIcons.Sparkles className="size-3 text-[#2F5D45]" />
                <span className="font-mono text-[10px] font-bold tracking-wider text-[#2F5D45] uppercase">
                  {stepHeaderText}
                </span>
              </div>
              {/* Progress Line */}
              <div
                className="w-full h-1 rounded-full mt-2.5 overflow-hidden"
                style={{ backgroundColor: `${COLORS.paperLine}60` }}
              >
                <div
                  className="h-full bg-[#2F5D45] transition-all duration-300 ease-out"
                  style={{ width: stepProgressWidth }}
                />
              </div>
            </div>
          </div>

          {/* Ticket Cutout Tear Line */}
          <div className="relative -mx-6 sm:-mx-8 my-5 flex items-center justify-between">
            <div
              className="w-4 h-7 rounded-r-full -translate-x-1/2 shadow-inner"
              style={{ backgroundColor: COLORS.backdropEdge }}
            />
            <div
              className="w-full border-t-2 border-dashed"
              style={{ borderColor: COLORS.paperLine }}
            />
            <div
              className="w-4 h-7 rounded-l-full translate-x-1/2 shadow-inner"
              style={{ backgroundColor: COLORS.backdropEdge }}
            />
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 1 — RATING + INSTANT PRE-WRITTEN REVIEWS LIST */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "step1_rating" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <h2
                  className="font-bold text-xl sm:text-2xl leading-tight"
                  style={{ color: COLORS.ink }}
                >
                  How was your experience?
                </h2>
                <p
                  className="text-xs mt-1 mb-4 font-medium transition-colors"
                  style={{ color: COLORS.stamp }}
                >
                  {getRatingLabel(currentDisplayRating)}
                </p>

                {/* 5 Rating Stamps */}
                <div className="flex justify-center gap-2.5 sm:gap-3.5 mb-5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = n <= currentDisplayRating;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleRatingChange(n)}
                        onMouseEnter={() => setHoveredRating(n)}
                        onMouseLeave={() => setHoveredRating(null)}
                        aria-label={`Rate ${n} out of 5`}
                        aria-pressed={filled}
                        className={cn(
                          "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 focus:outline-none cursor-pointer",
                          filled
                            ? "bg-gradient-to-br from-[#2F5D45] to-[#1E3E2E] text-[#F4F2EC] shadow-md ring-2 ring-[#2F5D45]/30"
                            : "bg-[#F4F2EC] border-2 border-dashed border-[#C9C2B4] text-[#8C8478] hover:border-[#2F5D45]/50"
                        )}
                      >
                        <CategoryIconComponent
                          className={cn(
                            "w-5 h-5 sm:w-6 sm:h-6 transition-transform",
                            TILTS[(n - 1) % TILTS.length]
                          )}
                          strokeWidth={filled ? 2 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Pre-Written Reviews Subheader */}
                <div className="flex items-center justify-between px-1 mb-3 pt-2 border-t border-dashed border-[#C9C2B4]/80">
                  <div className="flex items-center gap-1.5">
                    <LucideIcons.Sparkles
                      className="size-4"
                      style={{ color: COLORS.stamp }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider font-mono"
                      style={{ color: COLORS.ink }}
                    >
                      Pre-Written Reviews
                    </span>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#2F5D45]/10 text-[#2F5D45]">
                    1-Tap Copy
                  </span>
                </div>

                {/* List of Pre-Written Review Options */}
                <div className="space-y-3.5 mb-4">
                  {reviewOptions.map((opt) => {
                    const isEditingThis = editingOptionId === opt.id;
                    const isJustCopied = copiedText === opt.text;

                    // Color theme per category badge
                    let badgeStyle =
                      "bg-emerald-800 text-white border-emerald-900";
                    let cardBorder =
                      "border-emerald-700/25 bg-gradient-to-b from-[#F7F9F6] to-[#F1F5EF]";

                    if (opt.category === "SHORT & DIRECT") {
                      badgeStyle = "bg-amber-800 text-white border-amber-900";
                      cardBorder =
                        "border-amber-700/25 bg-gradient-to-b from-[#FAF7F2] to-[#F5EFE6]";
                    } else if (opt.category === "DETAILED") {
                      badgeStyle =
                        "bg-indigo-800 text-white border-indigo-900";
                      cardBorder =
                        "border-indigo-700/25 bg-gradient-to-b from-[#F6F5FA] to-[#ECEAF5]";
                    }

                    return (
                      <div
                        key={opt.id}
                        className={cn(
                          "rounded-2xl p-4 text-left border-2 border-dashed relative transition-all duration-200 shadow-xs hover:shadow-md",
                          cardBorder
                        )}
                      >
                        {/* Category Header & Edit Toggle */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs border",
                              badgeStyle
                            )}
                          >
                            {opt.category}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingOptionId(isEditingThis ? null : opt.id)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors hover:text-[#2F5D45] cursor-pointer"
                            style={{ color: COLORS.inkMuted }}
                          >
                            <LucideIcons.Edit3 className="size-3" />
                            {isEditingThis ? "Done" : "Edit"}
                          </button>
                        </div>

                        {/* Review Content */}
                        {isEditingThis ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={opt.text}
                              onChange={(e) =>
                                handleUpdateOptionText(opt.id, e.target.value)
                              }
                              rows={3}
                              className="w-full bg-white rounded-xl p-2.5 border border-emerald-700/50 resize-none text-xs leading-relaxed font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
                              style={{ color: COLORS.ink }}
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingOptionId(null)}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-white cursor-pointer shadow-xs transition-transform active:scale-95"
                                style={{ backgroundColor: COLORS.stamp }}
                              >
                                Save Text
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-xs sm:text-sm leading-relaxed font-medium pt-0.5 italic whitespace-pre-line font-serif"
                            style={{ color: COLORS.ink }}
                          >
                            &ldquo;{opt.text}&rdquo;
                          </p>
                        )}

                        {/* 1-Tap Copy & Post Action */}
                        <div
                          className="mt-3 pt-2.5 border-t border-dashed"
                          style={{ borderColor: COLORS.paperLine }}
                        >
                          <button
                            type="button"
                            onClick={() => handleCopyOption(opt.text)}
                            className={cn(
                              "w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-xs focus:outline-none",
                              isJustCopied
                                ? "bg-emerald-900 text-white"
                                : "hover:opacity-95"
                            )}
                            style={{
                              backgroundColor: isJustCopied
                                ? undefined
                                : COLORS.stamp,
                              color: COLORS.paperInset,
                            }}
                          >
                            {isJustCopied ? (
                              <>
                                <LucideIcons.CheckCircle2 className="size-4 text-emerald-300" />
                                Copied! Opening Google ↗
                              </>
                            ) : (
                              <>
                                <LucideIcons.Copy className="size-3.5" />
                                Copy &amp; Post on Google ↗
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Alternate Customization Action */}
                <button
                  type="button"
                  onClick={() => setViewState("step2_details")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed font-bold text-xs transition-all duration-200 hover:bg-black/5 active:scale-98 cursor-pointer shadow-2xs"
                  style={{
                    borderColor: COLORS.paperLine,
                    color: COLORS.ink,
                  }}
                >
                  <LucideIcons.SlidersHorizontal className="size-4 text-[#2F5D45]" />
                  Customize Review (Highlights &amp; Notes) →
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 2 — CUSTOMIZE REVIEW DETAILS (TAGS & NOTES) */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "step2_details" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                <h2
                  className="font-bold text-xl sm:text-2xl leading-tight"
                  style={{ color: COLORS.ink }}
                >
                  Customize your feedback
                </h2>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mt-1 mb-4"
                  style={{ color: COLORS.inkMuted }}
                >
                  Select what stood out &amp; add extra notes
                </p>

                {/* Category Chips */}
                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {dynamicTags.map((tagItem: any) => {
                    const label =
                      typeof tagItem === "string"
                        ? tagItem
                        : tagItem?.label || "";
                    const iconId =
                      typeof tagItem === "object" && tagItem?.icon
                        ? tagItem.icon
                        : label;
                    const TagIcon = getTagIcon(iconId);
                    const isSelected = formSelectedTags.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleTag(label)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase transition-all duration-150 active:scale-95 cursor-pointer border",
                          isSelected
                            ? "bg-[#2F5D45] text-[#F4F2EC] border-transparent shadow-sm scale-105"
                            : "bg-[#F4F2EC] text-[#2B2420] border-[#C9C2B4] hover:bg-white"
                        )}
                      >
                        {isSelected ? (
                          <LucideIcons.Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <TagIcon className="w-3.5 h-3.5 text-[#6B6459]" />
                        )}
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
                    placeholder="E.g. Loved the cozy seating, amazing latte, and fast service!"
                    rows={3}
                    className="w-full rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#2F5D45] transition-all font-medium border"
                    style={{
                      backgroundColor: COLORS.paperInset,
                      color: COLORS.ink,
                      borderColor: COLORS.paperLine,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setViewState("step1_rating")}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-95 active:scale-98 cursor-pointer shadow-md focus:outline-none"
                  style={{
                    backgroundColor: COLORS.stamp,
                    color: COLORS.paperInset,
                  }}
                >
                  <LucideIcons.Sparkles className="w-4 h-4 text-emerald-300" />
                  Apply Customization &amp; View Reviews ✨
                </button>

                <button
                  type="button"
                  onClick={() => setViewState("step1_rating")}
                  className="w-full text-center py-2 text-xs font-semibold hover:underline transition-all cursor-pointer flex items-center justify-center gap-1"
                  style={{ color: COLORS.inkMuted }}
                >
                  <LucideIcons.ArrowLeft className="size-3.5" /> Back to Quick Reviews
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 3 — SHARE / POST */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "share" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center">
                {/* Copied Review Preview Banner */}
                {copiedText && (
                  <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-left">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-800 font-bold text-xs">
                      <LucideIcons.CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Review Copied to Clipboard!</span>
                    </div>
                    <p className="text-xs text-emerald-950 font-serif italic line-clamp-2 leading-relaxed">
                      &ldquo;{copiedText}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex justify-center mb-2">
                  <div
                    className="size-12 rounded-full flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${COLORS.stamp}18` }}
                  >
                    <LucideIcons.Share2
                      className="size-6"
                      style={{ color: COLORS.stamp }}
                    />
                  </div>
                </div>

                <h2
                  className="font-bold text-xl sm:text-2xl leading-tight"
                  style={{ color: COLORS.ink }}
                >
                  Post your review
                </h2>
                <p
                  className="text-xs mt-1 mb-5"
                  style={{ color: COLORS.inkMuted }}
                >
                  Tap below to open Google and paste your copied review:
                </p>

                {/* Platform Card List */}
                <div className="space-y-3 mb-5">
                  {/* Google Maps & Search Card */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePlatformShare(googleReviewUrl, "Google")
                    }
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-98 cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: COLORS.paperInset,
                      borderColor: COLORS.stamp,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
                        <LucideIcons.Star className="size-6 text-amber-500 fill-amber-400" />
                      </div>
                      <div className="text-left">
                        <p
                          className="text-sm font-bold flex items-center gap-1"
                          style={{ color: COLORS.ink }}
                        >
                          Google Reviews
                        </p>
                        <p
                          className="text-[11px] font-medium"
                          style={{ color: COLORS.inkMuted }}
                        >
                          Google Maps &amp; Search Profile
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F5D45] text-white text-xs font-bold shadow-xs">
                      <span>Post Review</span>
                      <LucideIcons.ExternalLink className="size-3.5" />
                    </div>
                  </button>

                  {/* Optional TripAdvisor Card */}
                  {tripadvisorUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePlatformShare(tripadvisorUrl, "TripAdvisor")
                      }
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 hover:shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer focus:outline-none"
                      style={{
                        backgroundColor: COLORS.paperInset,
                        borderColor: COLORS.paperLine,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                          <LucideIcons.Compass className="size-5 text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <p
                            className="text-xs font-bold"
                            style={{ color: COLORS.ink }}
                          >
                            TripAdvisor
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: COLORS.inkMuted }}
                          >
                            Travelers &amp; Guests
                          </p>
                        </div>
                      </div>
                      <LucideIcons.ExternalLink
                        className="size-4 opacity-50"
                        style={{ color: COLORS.ink }}
                      />
                    </button>
                  )}

                  {/* Optional MakeMyTrip Card */}
                  {makemytripUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePlatformShare(makemytripUrl, "MakeMyTrip")
                      }
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 hover:shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer focus:outline-none"
                      style={{
                        backgroundColor: COLORS.paperInset,
                        borderColor: COLORS.paperLine,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                          <LucideIcons.Plane className="size-5 text-red-500" />
                        </div>
                        <div className="text-left">
                          <p
                            className="text-xs font-bold"
                            style={{ color: COLORS.ink }}
                          >
                            MakeMyTrip
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: COLORS.inkMuted }}
                          >
                            Hotel &amp; Resort Stay
                          </p>
                        </div>
                      </div>
                      <LucideIcons.ExternalLink
                        className="size-4 opacity-50"
                        style={{ color: COLORS.ink }}
                      />
                    </button>
                  )}
                </div>

                {/* Back to Review Options Button */}
                <button
                  type="button"
                  onClick={() => setViewState("step1_rating")}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:underline cursor-pointer"
                  style={{ color: COLORS.inkMuted }}
                >
                  <LucideIcons.ArrowLeft className="size-3.5" /> Back to Review Options
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREEN 4 — THANK YOU (Direct/Private Feedback) */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {viewState === "thankyou" && (
            <div className="text-center py-6 animate-in fade-in duration-300">
              <div className="flex justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border shadow-inner"
                  style={{
                    backgroundColor: `${COLORS.stamp}15`,
                    borderColor: `${COLORS.stamp}30`,
                  }}
                >
                  <LucideIcons.ShieldCheck
                    className="w-8 h-8"
                    style={{ color: COLORS.stamp }}
                  />
                </div>
              </div>
              <h2
                className="font-bold text-xl sm:text-2xl"
                style={{ color: COLORS.ink }}
              >
                Feedback Received
              </h2>
              <p
                className="text-xs sm:text-sm mt-3 leading-relaxed"
                style={{ color: COLORS.inkMuted }}
              >
                Thank you for sharing your thoughts. Your feedback has been shared directly with the team at{" "}
                <strong style={{ color: COLORS.ink }}>{businessName}</strong> to help us improve.
              </p>

              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setViewState("step1_rating");
                    setReviewOptions([]);
                    setEditingOptionId(null);
                    setCopiedText("");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-95 active:scale-95 focus:outline-none cursor-pointer shadow-md"
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
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <LucideIcons.Sparkles
            className="w-3.5 h-3.5"
            style={{ color: COLORS.backdropMuted }}
          />
          <span
            className="font-mono text-[11px] tracking-wide"
            style={{ color: COLORS.backdropMuted }}
          >
            Powered by Escellence · ReviewFlow AI
          </span>
        </div>
      </div>
    </div>
  );
}
