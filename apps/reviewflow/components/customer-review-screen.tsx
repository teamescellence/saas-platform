"use client";

import * as React from "react";
import {
  Star,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  RotateCcw,
  Coffee,
  Zap,
  Smile,
  Heart,
  Store,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  Award,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

interface TagOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_TAGS: TagOption[] = [
  { id: "quality", label: "Excellent Quality", icon: Coffee },
  { id: "service", label: "Fast Service", icon: Zap },
  { id: "staff", label: "Friendly Staff", icon: Smile },
  { id: "vibe", label: "Great Ambience", icon: Heart },
  { id: "value", label: "Worth the Price", icon: ThumbsUp },
  { id: "clean", label: "Clean & Hygenic", icon: ShieldCheck },
];

interface CustomerReviewScreenProps {
  businessName?: string;
  category?: string;
  logoUrl?: string;
  googleReviewUrl?: string;
  branchName?: string;
  tableName?: string;
}

export function CustomerReviewScreen({
  businessName = "Brew & Bliss Cafe",
  category = "Cafe & Bakery",
  logoUrl,
  googleReviewUrl = "https://g.page/review/brewbliss",
  branchName = "Udaipur Main Branch",
  tableName = "Table 04",
}: CustomerReviewScreenProps) {
  const [rating, setRating] = React.useState<number>(5);
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<string[]>(["quality", "staff"]);
  const [customComment, setCustomComment] = React.useState<string>("");
  const [aiDraft, setAiDraft] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Auto-generate AI Draft based on rating, selected tags, and custom comment
  const generateAiReview = React.useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      let draft = "";
      const selectedTagLabels = DEFAULT_TAGS.filter((t) =>
        selectedTags.includes(t.id)
      ).map((t) => t.label.toLowerCase());

      if (rating >= 4) {
        draft = `Had a wonderful experience at ${businessName}! `;
        if (selectedTagLabels.length > 0) {
          draft += `Particularly impressed with their ${selectedTagLabels.join(" and ")}. `;
        }
        if (customComment.trim()) {
          draft += `${customComment.trim()} `;
        } else {
          draft += `The staff were attentive and the atmosphere was vibrant. Highly recommended!`;
        }
      } else if (rating === 3) {
        draft = `Decent visit to ${businessName}. `;
        if (selectedTagLabels.length > 0) {
          draft += `Appreciated the ${selectedTagLabels.join(", ")}, `;
        }
        if (customComment.trim()) {
          draft += `however: ${customComment.trim()}`;
        } else {
          draft += `though there is room for improvement in overall service speed.`;
        }
      } else {
        draft = `Visiting ${businessName} fell short of expectations. `;
        if (customComment.trim()) {
          draft += `${customComment.trim()}`;
        } else {
          draft += `Hoping the management addresses service consistency soon.`;
        }
      }
      setAiDraft(draft.trim());
      setIsGenerating(false);
    }, 350);
  }, [rating, selectedTags, customComment, businessName]);

  React.useEffect(() => {
    generateAiReview();
  }, [rating, selectedTags, generateAiReview]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleCopyAndRedirect = () => {
    if (aiDraft) {
      navigator.clipboard.writeText(aiDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
  };

  const currentDisplayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-start p-4 md:p-8 font-sans relative">
      {/* Soft Background Accent Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-2xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md z-10 flex flex-col gap-5">
        {/* Header Branding Card */}
        <header className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="size-full bg-white rounded-[14px] flex items-center justify-center">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={businessName} className="size-9 rounded-lg" />
              ) : (
                <Store className="size-8 text-blue-600" />
              )}
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700 mb-1">
              <Award className="size-3 text-blue-600" />
              <span>Verified Customer Review</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {businessName}
            </h1>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2 mt-1 font-medium">
              <span>{category}</span>
              <span>•</span>
              <span>{branchName}</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">{tableName}</span>
            </p>
          </div>
        </header>

        {/* Step 1: Rating Selection */}
        <section className="flex flex-col items-center gap-3.5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <MessageSquare className="size-4 text-blue-600" />
            <span>How would you rate your visit?</span>
          </div>

          {/* Interactive Star Rating Bar */}
          <div className="flex items-center gap-2 my-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= currentDisplayRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200 focus:outline-none transform active:scale-95",
                    isFilled
                      ? "text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)] scale-110"
                      : "text-slate-300 hover:text-slate-400"
                  )}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star className="size-8 fill-current stroke-current" />
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {currentDisplayRating === 5 && "Outstanding Experience"}
            {currentDisplayRating === 4 && "Great Experience"}
            {currentDisplayRating === 3 && "Good / Average Visit"}
            {currentDisplayRating === 2 && "Fair / Needs Improvement"}
            {currentDisplayRating === 1 && "Poor Experience"}
          </div>
        </section>

        {/* Step 2: Quick Highlight Chips */}
        <section className="flex flex-col gap-3 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            What did you like most?
          </h3>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TAGS.map((tag) => {
              const IconComp = tag.icon;
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <IconComp className={cn("size-3.5", isSelected ? "text-white" : "text-blue-600")} />
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Optional Comment Input */}
        <section className="flex flex-col gap-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50">
          <label
            htmlFor="custom-comment"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            Add Specific Comments (Optional)
          </label>
          <textarea
            id="custom-comment"
            rows={2}
            value={customComment}
            onChange={(e) => setCustomComment(e.target.value)}
            placeholder="e.g. Tried the caramel latte, excellent service by Sam..."
            className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
        </section>

        {/* Step 4: AI Review Assistant Box */}
        <section className="flex flex-col gap-3 p-6 rounded-2xl bg-gradient-to-b from-blue-50/80 to-indigo-50/50 border border-blue-200 shadow-xl shadow-blue-100/50 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Sparkles className="size-4 text-blue-600" />
              <span>AI Review Assistant</span>
            </div>
            <button
              type="button"
              onClick={generateAiReview}
              className="text-[11px] font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="size-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-blue-100 text-xs/relaxed text-slate-700 font-medium italic relative shadow-sm">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-slate-500 py-1">
                <Sparkles className="size-3.5 animate-spin text-blue-600" />
                <span>Crafting your authentic review...</span>
              </div>
            ) : (
              <p>{aiDraft || "Select rating and tags above to generate your review."}</p>
            )}
          </div>

          {/* Direct Copy & Post CTA Button */}
          <Button
            onClick={handleCopyAndRedirect}
            disabled={isGenerating || !aiDraft}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-300" />
                <span>Copied! Opening Google Reviews...</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy Review & Post on Google</span>
                <ExternalLink className="size-3.5 ml-1 opacity-80" />
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            Your review will be copied automatically so you can paste it directly on Google.
          </p>
        </section>
      </div>
    </div>
  );
}
