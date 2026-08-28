"use client";

import * as React from "react";
import { BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { Building, MapPin, Globe, Sparkles, Image as ImageIcon, Save, ShieldAlert, Loader2 } from "lucide-react";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";

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
  const [language, setLanguage] = React.useState("en");
  const [aiTone, setAiTone] = React.useState("friendly");
  const [reviewLength, setReviewLength] = React.useState("medium");

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
      setLanguage(business.default_language || "en");
      setAiTone(business.ai_tone || "friendly");
      setReviewLength(business.review_length || "medium");
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
      default_language: language,
      ai_tone: aiTone,
      review_length: reviewLength,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your brand info, Google integrations and AI configurations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Building className="size-4.5 text-primary" /> Basic Information
            </CardTitle>
            <CardDescription>Update your public business identity and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="flex flex-col items-center gap-2">
                <BusinessAvatar name={name || "Business"} size="lg" className="size-20" />
                <Button variant="outline" size="xs" type="button" className="gap-1">
                  <ImageIcon className="size-3" /> Change Logo
                </Button>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <Label htmlFor="biz-name">Business Name</Label>
                  <Input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="biz-cat">Category</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val)}>
                    <SelectTrigger id="biz-cat">
                      <SelectValue placeholder="Select Category" />
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
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <MapPin className="size-4.5 text-primary" /> Address
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
              <Label htmlFor="biz-pc">Postal Code</Label>
              <Input id="biz-pc" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biz-country">Country</Label>
              <Input id="biz-country" value="India" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Google review settings */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Globe className="size-4.5 text-primary" /> Google Business Integration
            </CardTitle>
            <CardDescription>Direct link to Google reviews page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="biz-g-url">Google Review URL</Label>
              <Input
                id="biz-g-url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                ReviewFlow will copy the AI-improved review draft to clipboard and direct verified customers to this URL.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Experience AI setup */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Sparkles className="size-4.5 text-primary" /> AI Review Assistant Settings
            </CardTitle>
            <CardDescription>Configure tone, language, and guidelines for AI drafting</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="biz-ai-lang">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="biz-ai-lang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biz-ai-tone">AI Tone</Label>
              <Select value={aiTone} onValueChange={(val) => setAiTone(val)}>
                <SelectTrigger id="biz-ai-tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly & Warm</SelectItem>
                  <SelectItem value="casual">Casual & Conversational</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="formal">Formal & Polite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="biz-ai-len">Review Length</Label>
              <Select value={reviewLength} onValueChange={(val) => setReviewLength(val)}>
                <SelectTrigger id="biz-ai-len">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (3-4 sentences)</SelectItem>
                  <SelectItem value="long">Long (Detailed paragraph)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3 rounded-lg border border-dashed border-border p-4 flex gap-3 bg-muted/20">
              <ShieldAlert className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">AI Policy & Integrity</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ReviewFlow enforces honest customer reviews. AI rewriting cannot fabricate ratings, invent false claims, or hide negative details. Users will always review and approve the final text before submission.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t border-border/50 p-4 flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending} className="gap-1.5">
              <Save className="size-4" /> {saveMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
