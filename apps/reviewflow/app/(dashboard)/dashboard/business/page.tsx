"use client";

import * as React from "react";
import { BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";

// ── Types & Available Tag Icons ──────────────────────────────────────────────
export interface ReviewTagItem {
  label: string;
  icon: string;
}

export const AVAILABLE_TAG_ICONS = [
  { id: "UtensilsCrossed", label: "Food / Taste", Icon: LucideIcons.UtensilsCrossed },
  { id: "Coffee", label: "Coffee & Drinks", Icon: LucideIcons.Coffee },
  { id: "Wine", label: "Bar & Beverages", Icon: LucideIcons.Wine },
  { id: "Users", label: "Staff & Service", Icon: LucideIcons.Users },
  { id: "Sparkles", label: "Ambience & Vibe", Icon: LucideIcons.Sparkles },
  { id: "Zap", label: "Fast Service", Icon: LucideIcons.Zap },
  { id: "Heart", label: "Overall Experience", Icon: LucideIcons.Heart },
  { id: "Truck", label: "Delivery & Takeaway", Icon: LucideIcons.Truck },
  { id: "ShieldCheck", label: "Hygiene & Cleanliness", Icon: LucideIcons.ShieldCheck },
  { id: "BadgePercent", label: "Value for Money", Icon: LucideIcons.BadgePercent },
  { id: "Music", label: "Music & Vibe", Icon: LucideIcons.Music },
  { id: "Wifi", label: "High-Speed Wi-Fi", Icon: LucideIcons.Wifi },
  { id: "Car", label: "Parking & Valet", Icon: LucideIcons.Car },
  { id: "Smile", label: "Family Friendly", Icon: LucideIcons.Smile },
  { id: "Clock", label: "Punctuality", Icon: LucideIcons.Clock },
  { id: "Star", label: "Premium Quality", Icon: LucideIcons.Star },
  { id: "Award", label: "Chef Special", Icon: LucideIcons.Award },
  { id: "Flame", label: "Hot & Fresh", Icon: LucideIcons.Flame },
  { id: "ThumbsUp", label: "Recommended", Icon: LucideIcons.ThumbsUp },
  { id: "ShoppingBag", label: "Packaging", Icon: LucideIcons.ShoppingBag },
];

export const PRESET_TAG_SUGGESTIONS: ReviewTagItem[] = [
  { label: "Taste", icon: "UtensilsCrossed" },
  { label: "Staff", icon: "Users" },
  { label: "Ambience", icon: "Sparkles" },
  { label: "Service", icon: "Zap" },
  { label: "Overall", icon: "Heart" },
  { label: "Delivery", icon: "Truck" },
  { label: "Cleanliness", icon: "ShieldCheck" },
  { label: "Value for Money", icon: "BadgePercent" },
  { label: "Coffee", icon: "Coffee" },
  { label: "Music", icon: "Music" },
  { label: "Parking", icon: "Car" },
  { label: "Wi-Fi", icon: "Wifi" },
];

export function suggestIconForTag(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes("deliver") || lower.includes("takeaway") || lower.includes("parcel") || lower.includes("order")) return "Truck";
  if (lower.includes("taste") || lower.includes("food") || lower.includes("dish") || lower.includes("meal") || lower.includes("menu")) return "UtensilsCrossed";
  if (lower.includes("coffee") || lower.includes("tea") || lower.includes("cafe") || lower.includes("drink") || lower.includes("beverage")) return "Coffee";
  if (lower.includes("wine") || lower.includes("bar") || lower.includes("cocktail") || lower.includes("beer")) return "Wine";
  if (lower.includes("staff") || lower.includes("people") || lower.includes("team") || lower.includes("host") || lower.includes("crew") || lower.includes("waiter") || lower.includes("hospitality")) return "Users";
  if (lower.includes("ambience") || lower.includes("vibe") || lower.includes("decor") || lower.includes("atmosphere") || lower.includes("interior")) return "Sparkles";
  if (lower.includes("service") || lower.includes("speed") || lower.includes("quick") || lower.includes("fast") || lower.includes("prompt")) return "Zap";
  if (lower.includes("clean") || lower.includes("hygiene") || lower.includes("sanit") || lower.includes("neat")) return "ShieldCheck";
  if (lower.includes("price") || lower.includes("value") || lower.includes("affordable") || lower.includes("cost") || lower.includes("cheap")) return "BadgePercent";
  if (lower.includes("music") || lower.includes("sound") || lower.includes("song") || lower.includes("dj")) return "Music";
  if (lower.includes("wifi") || lower.includes("internet") || lower.includes("net")) return "Wifi";
  if (lower.includes("park") || lower.includes("car") || lower.includes("valet")) return "Car";
  if (lower.includes("kid") || lower.includes("family") || lower.includes("friendly") || lower.includes("smile") || lower.includes("welcome")) return "Smile";
  if (lower.includes("time") || lower.includes("wait") || lower.includes("hour") || lower.includes("punctual")) return "Clock";
  if (lower.includes("star") || lower.includes("quality") || lower.includes("best") || lower.includes("top")) return "Star";
  if (lower.includes("chef") || lower.includes("award") || lower.includes("special")) return "Award";
  if (lower.includes("hot") || lower.includes("fresh") || lower.includes("spic") || lower.includes("warm")) return "Flame";
  if (lower.includes("pack") || lower.includes("box") || lower.includes("bag")) return "ShoppingBag";
  if (lower.includes("love") || lower.includes("heart") || lower.includes("overall") || lower.includes("great") || lower.includes("experience")) return "Heart";
  return "Sparkles";
}

export function normalizeTagItem(tag: any): ReviewTagItem {
  if (typeof tag === "string") {
    return { label: tag, icon: suggestIconForTag(tag) };
  }
  if (tag && typeof tag === "object" && tag.label) {
    return {
      label: tag.label,
      icon: tag.icon || suggestIconForTag(tag.label),
    };
  }
  return { label: String(tag || ""), icon: "Sparkles" };
}

export function getTagLucideIcon(iconId: string): React.ComponentType<{ className?: string }> {
  const found = AVAILABLE_TAG_ICONS.find((i) => i.id === iconId);
  if (found) return found.Icon;
  return (LucideIcons as any)[iconId] || LucideIcons.Sparkles;
}

export default function BusinessProfilePage() {
  const queryClient = useQueryClient();

  const { data: business, isLoading } = useQuery<any>({
    queryKey: ["business"],
    queryFn: () => api.get<any>(endpoints.business),
  });

  // Form states
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("cafe");
  const [description, setDescription] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");

  const [googleUrl, setGoogleUrl] = React.useState("");
  const [tripadvisorUrl, setTripadvisorUrl] = React.useState("");
  const [makemytripUrl, setMakemytripUrl] = React.useState("");

  // Review tags with custom icon support
  const [reviewTags, setReviewTags] = React.useState<ReviewTagItem[]>([]);
  const [newTagInput, setNewTagInput] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState<string>("Sparkles");
  const [hasUserChosenIcon, setHasUserChosenIcon] = React.useState(false);
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);

  const [language, setLanguage] = React.useState("en");
  const [aiTone, setAiTone] = React.useState("casual");
  const [reviewLength, setReviewLength] = React.useState("medium");
  const [customAiInstructions, setCustomAiInstructions] = React.useState("");

  // Populate state when backend data loads
  React.useEffect(() => {
    if (business) {
      setName(business.name || "");
      setCategory(business.category || "cafe");
      setDescription(business.description || "");
      setWebsite(business.website || "");
      setPhone(business.phone || "");
      setAddress(business.address || "");
      setCity(business.city || "");
      setState(business.state || "");
      setPostalCode(business.postal_code || "");
      setGoogleUrl(business.google_review_url || "");
      setTripadvisorUrl(business.tripadvisor_url || "");
      setMakemytripUrl(business.makemytrip_url || "");
      
      const rawTags = Array.isArray(business.review_tags) ? business.review_tags : [];
      setReviewTags(rawTags.map(normalizeTagItem));

      setLanguage(business.default_language || "en");
      setAiTone(business.ai_tone || "casual");
      setReviewLength(business.review_length || "medium");
      setCustomAiInstructions(business.custom_ai_instructions || "");
    }
  }, [business]);

  const saveMutation = useMutation({
    mutationFn: (updatedData: any) => api.patch(endpoints.businessUpdate, updatedData),
    onSuccess: (data) => {
      queryClient.setQueryData(["business"], data);
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success("Business profile updated successfully!");
    },
    onError: (err: any) => {
      const errorMsg = err.errors
        ? Object.values(err.errors).flat().join(" ")
        : err.message || "Failed to save profile changes.";
      toast.error(errorMsg);
    },
  });

  // Handle typing in tag input with real-time icon suggestion
  const handleTagInputChange = (val: string) => {
    setNewTagInput(val);
    if (!hasUserChosenIcon && val.trim().length > 0) {
      const suggested = suggestIconForTag(val);
      setSelectedIcon(suggested);
    }
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const label = newTagInput.trim();
    if (!label) return;

    // Check if tag label already exists
    if (reviewTags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      toast.error(`Tag "${label}" already exists`);
      return;
    }

    const iconToUse = selectedIcon || suggestIconForTag(label);
    setReviewTags([...reviewTags, { label, icon: iconToUse }]);
    setNewTagInput("");
    setHasUserChosenIcon(false);
    setSelectedIcon("Sparkles");
  };

  const handleAddPresetTag = (preset: ReviewTagItem) => {
    if (reviewTags.some((t) => t.label.toLowerCase() === preset.label.toLowerCase())) {
      toast.info(`Tag "${preset.label}" is already added`);
      return;
    }
    setReviewTags([...reviewTags, preset]);
    toast.success(`Added "${preset.label}"`);
  };

  const handleRemoveTag = (labelToRemove: string) => {
    setReviewTags(reviewTags.filter((t) => t.label !== labelToRemove));
  };

  const handleClearTags = () => {
    setReviewTags([]);
  };

  const handleSaveTagsDirectly = () => {
    saveMutation.mutate({
      name,
      category,
      description,
      website,
      phone,
      address,
      city,
      state,
      postal_code: postalCode,
      google_review_url: googleUrl,
      tripadvisor_url: tripadvisorUrl,
      makemytrip_url: makemytripUrl,
      review_tags: reviewTags,
      default_language: language,
      ai_tone: aiTone,
      review_length: reviewLength,
      custom_ai_instructions: customAiInstructions,
    });
  };

  const handleSave = (e?: React.SyntheticEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    saveMutation.mutate({
      name,
      category,
      description,
      website,
      phone,
      address,
      city,
      state,
      postal_code: postalCode,
      google_review_url: googleUrl,
      tripadvisor_url: tripadvisorUrl,
      makemytrip_url: makemytripUrl,
      review_tags: reviewTags,
      default_language: language,
      ai_tone: aiTone,
      review_length: reviewLength,
      custom_ai_instructions: customAiInstructions,
    });
  };

  const SelectedIconComponent = getTagLucideIcon(selectedIcon);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideIcons.Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 py-3.5 sm:px-6 lg:px-8 bg-background/90 backdrop-blur-md border-b border-border/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs transition-all">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Business Profile</h1>
          <p className="text-xs text-muted-foreground">Manage your brand info, customer review tags with icons, and platform links.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="gap-1.5 cursor-pointer shadow-sm"
          >
            {saveMutation.isPending ? (
              <>
                <LucideIcons.Loader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <LucideIcons.Save className="size-4" /> Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <LucideIcons.Building className="size-4.5 text-primary" /> Basic Information
            </CardTitle>
            <CardDescription>Update your public business identity and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border">
              <BusinessAvatar
                name={name || "Business"}
                logoUrl={business?.logo}
                className="size-20 text-2xl border-2 border-border shadow-sm shrink-0"
              />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm">Business Avatar &amp; Logo</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Logos are displayed on QR code stands, review landing pages, and AI generated review prompts.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
                    <LucideIcons.ImageIcon className="size-3.5" /> Upload Logo
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">Business Name</Label>
                <Input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-category">Category</Label>
                <Select key={`cat-${category}`} value={category} onValueChange={setCategory}>
                  <SelectTrigger id="biz-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-phone">Phone Number</Label>
                <Input id="biz-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <Label htmlFor="biz-web">Website</Label>
                <Input id="biz-web" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <Label htmlFor="biz-desc">Description</Label>
                <Textarea
                  id="biz-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* Customer Review Tags with SVG Icons */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <LucideIcons.Tag className="size-4.5 text-primary" /> Customer Review Tags (What Stood Out)
                </CardTitle>
                <CardDescription>
                  Custom experience chips with SVG icons displayed on your customer review page.
                </CardDescription>
              </div>
              {reviewTags.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleClearTags}
                  className="gap-1 text-xs text-muted-foreground self-start sm:self-auto hover:text-destructive cursor-pointer"
                >
                  <LucideIcons.X className="size-3" /> Clear All
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Active Tags Display */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground block mb-2">
                Active Tags ({reviewTags.length})
              </Label>
              <div className="flex flex-wrap gap-2 items-center p-3.5 rounded-xl bg-muted/40 border border-border min-h-[58px]">
                {reviewTags.map((tag) => {
                  const TagIcon = getTagLucideIcon(tag.icon);
                  return (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs"
                    >
                      <TagIcon className="size-3.5" />
                      <span>{tag.label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.label)}
                        className="hover:text-destructive transition-colors focus:outline-none cursor-pointer ml-0.5"
                        aria-label={`Remove ${tag.label}`}
                      >
                        <LucideIcons.X className="size-3" />
                      </button>
                    </span>
                  );
                })}
                {reviewTags.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    No review tags added yet. Choose from suggestions below or create custom tags.
                  </span>
                )}
              </div>
            </div>

            {/* Custom Tag Creator with Icon Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground block">
                Add Custom Tag
              </Label>
              <div className="flex gap-2 items-center">
                {/* Icon Selector Popover */}
                <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 px-2.5 h-9 shrink-0 cursor-pointer bg-background"
                      title="Choose Tag Icon"
                    >
                      <SelectedIconComponent className="size-4 text-primary" />
                      <LucideIcons.ChevronDown className="size-3 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <p className="text-xs font-bold text-foreground">Select Tag Icon</p>
                        <span className="text-[10px] text-muted-foreground">Lucide SVG</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1">
                        {AVAILABLE_TAG_ICONS.map((item) => {
                          const IconComp = item.Icon;
                          const isCur = selectedIcon === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedIcon(item.id);
                                setHasUserChosenIcon(true);
                                setIconPickerOpen(false);
                              }}
                              title={item.label}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                                isCur
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/40 hover:bg-muted text-foreground border-transparent hover:border-border"
                              }`}
                            >
                              <IconComp className="size-4" />
                              <span className="text-[9px] mt-1 truncate max-w-full text-center">
                                {item.id}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Tag Input */}
                <Input
                  placeholder="Tag label (e.g. Delivery, Cleanliness, Ambience, Taste)..."
                  value={newTagInput}
                  onChange={(e) => handleTagInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="text-xs h-9"
                />

                {/* Add Tag Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag()}
                  className="gap-1 shrink-0 h-9 cursor-pointer"
                >
                  <LucideIcons.Plus className="size-3.5" /> Add Tag
                </Button>
              </div>
            </div>

            {/* Quick Preset Suggestions (1-Click Add) */}
            <div className="space-y-2 pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <LucideIcons.Sparkles className="size-3.5 text-amber-500" />
                <span>Suggested Tags (1-Click to Add)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAG_SUGGESTIONS.map((preset) => {
                  const PresetIcon = getTagLucideIcon(preset.icon);
                  const isAdded = reviewTags.some(
                    (t) => t.label.toLowerCase() === preset.label.toLowerCase()
                  );
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddPresetTag(preset)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        isAdded
                          ? "opacity-40 bg-muted/30 text-muted-foreground border-dashed cursor-not-allowed"
                          : "bg-background hover:bg-muted hover:border-primary/40 text-foreground border-border active:scale-95"
                      }`}
                    >
                      <PresetIcon className="size-3 text-muted-foreground" />
                      <span>{preset.label}</span>
                      {!isAdded && <LucideIcons.Plus className="size-2.5 opacity-60" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {reviewTags.length} tag{reviewTags.length === 1 ? "" : "s"} configured
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveTagsDirectly}
              disabled={saveMutation.isPending}
              className="gap-1.5 cursor-pointer"
            >
              <LucideIcons.Save className="size-3.5" /> {saveMutation.isPending ? "Saving..." : "Save Tags"}
            </Button>
          </CardFooter>
        </Card>

        {/* Address */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <LucideIcons.MapPin className="size-4.5 text-primary" /> Address
            </CardTitle>
            <CardDescription>Configure physical location settings</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="biz-addr">Street Address</Label>
              <Input id="biz-addr" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biz-city">City</Label>
              <Input id="biz-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biz-state">State</Label>
              <Input id="biz-state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biz-zip">Postal Code</Label>
              <Input id="biz-zip" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Review Platforms & Destinations */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <LucideIcons.Globe className="size-4.5 text-primary" /> Review Platforms &amp; Destinations
                </CardTitle>
                <CardDescription>
                  {category.toLowerCase().includes("hotel")
                    ? "Connect your Google, TripAdvisor, and MakeMyTrip pages for hotel guests."
                    : "Connect your public Google review profile to collect verified customer ratings."}
                </CardDescription>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono self-start sm:self-auto capitalize">
                Category: {category.replace(/[-_]/g, " ")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="biz-google" className="flex items-center gap-1.5 text-xs font-semibold">
                <LucideIcons.Globe className="size-3.5 text-blue-500" /> Google Review Link
              </Label>
              <Input
                id="biz-google"
                type="url"
                placeholder="https://g.page/r/..."
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Get this from your Google Business Profile &gt; &quot;Ask for reviews&quot; button.
              </p>
            </div>

            {/* Travel & Hospitality specific platforms */}
            {category.toLowerCase().includes("hotel") && (
              <>
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <Label htmlFor="biz-tripadvisor" className="flex items-center gap-1.5 text-xs font-semibold">
                    <LucideIcons.Compass className="size-3.5 text-emerald-600" /> TripAdvisor Review Link (Hotel &amp; Hospitality)
                  </Label>
                  <Input
                    id="biz-tripadvisor"
                    type="url"
                    placeholder="https://www.tripadvisor.com/UserReviewEdit-..."
                    value={tripadvisorUrl}
                    onChange={(e) => setTripadvisorUrl(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Direct hotel and resort guests to your TripAdvisor listing.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="biz-makemytrip" className="flex items-center gap-1.5 text-xs font-semibold">
                    <LucideIcons.Plane className="size-3.5 text-red-500" /> MakeMyTrip Review Link (Hotel &amp; Hospitality)
                  </Label>
                  <Input
                    id="biz-makemytrip"
                    type="url"
                    placeholder="https://www.makemytrip.com/hotels/..."
                    value={makemytripUrl}
                    onChange={(e) => setMakemytripUrl(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Direct verified domestic travelers to your MakeMyTrip property page.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <LucideIcons.Sparkles className="size-4.5 text-primary" /> AI Review Assistant Settings
                </CardTitle>
                <CardDescription>
                  Customize how the AI crafts customer reviews to match your brand style.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Language */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-lang" className="text-xs font-semibold">Default Language</Label>
                <Select key={`lang-${language}`} value={language || "en"} onValueChange={setLanguage}>
                  <SelectTrigger id="biz-lang" className="w-full text-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US/UK)</SelectItem>
                    <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="hinglish">Hinglish (Hindi in English)</SelectItem>
                    <SelectItem value="es">Spanish (Español)</SelectItem>
                    <SelectItem value="fr">French (Français)</SelectItem>
                    <SelectItem value="de">German (Deutsch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-tone" className="text-xs font-semibold">Review Tone</Label>
                <Select key={`tone-${aiTone}`} value={aiTone || "casual"} onValueChange={setAiTone}>
                  <SelectTrigger id="biz-tone" className="w-full text-xs">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual (Texting a friend)</SelectItem>
                    <SelectItem value="friendly">Friendly &amp; Warm</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic &amp; Hyped</SelectItem>
                    <SelectItem value="concise">Short &amp; Direct</SelectItem>
                    <SelectItem value="professional">Polite &amp; Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Length */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-len" className="text-xs font-semibold">Target Length</Label>
                <Select key={`len-${reviewLength}`} value={reviewLength || "medium"} onValueChange={setReviewLength}>
                  <SelectTrigger id="biz-len" className="w-full text-xs">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1–2 sentences, ~20 words)</SelectItem>
                    <SelectItem value="medium">Medium (2–3 sentences, ~35 words)</SelectItem>
                    <SelectItem value="detailed">Detailed (3–4 sentences, ~50 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Guidelines */}
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="biz-ai-custom" className="text-xs font-semibold flex items-center gap-1.5">
                <LucideIcons.SlidersHorizontal className="size-3.5 text-primary" /> Special Business Highlights &amp; Guidelines (Optional)
              </Label>
              <Textarea
                id="biz-ai-custom"
                placeholder="e.g. Mention our rooftop dining, pet-friendly seating, freshly roasted coffee beans, or free valet parking when relevant..."
                value={customAiInstructions}
                onChange={(e) => setCustomAiInstructions(e.target.value)}
                rows={2}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Give the AI key business perks to weave naturally into customer reviews without sounding promotional.
              </p>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Applied automatically to all customer QR scans
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-1.5 cursor-pointer"
            >
              <LucideIcons.Save className="size-3.5" /> {saveMutation.isPending ? "Saving..." : "Save AI Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
