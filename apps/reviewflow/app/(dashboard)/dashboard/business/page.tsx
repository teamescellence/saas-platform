"use client";

import * as React from "react";
import { MOCK_BUSINESS, BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { Building, MapPin, Globe, Sparkles, Image as ImageIcon, Save, ShieldAlert } from "lucide-react";
import { BusinessAvatar } from "@/components/ui/business-avatar";

export default function BusinessProfilePage() {
  const [isSaving, setIsSaving] = React.useState(false);

  // Form states
  const [name, setName] = React.useState(MOCK_BUSINESS.name);
  const [category, setCategory] = React.useState(MOCK_BUSINESS.category);
  const [description, setDescription] = React.useState(MOCK_BUSINESS.description || "");
  const [website, setWebsite] = React.useState(MOCK_BUSINESS.website || "");
  const [phone, setPhone] = React.useState(MOCK_BUSINESS.phone || "");

  const [address, setAddress] = React.useState(MOCK_BUSINESS.address || "");
  const [city, setCity] = React.useState(MOCK_BUSINESS.city || "");
  const [state, setState] = React.useState(MOCK_BUSINESS.state || "");
  const [postalCode, setPostalCode] = React.useState(MOCK_BUSINESS.postal_code || "");

  const [googleUrl, setGoogleUrl] = React.useState(MOCK_BUSINESS.google_review_url || "");

  const [language, setLanguage] = React.useState(MOCK_BUSINESS.default_language);
  const [aiTone, setAiTone] = React.useState(MOCK_BUSINESS.ai_tone);
  const [reviewLength, setReviewLength] = React.useState(MOCK_BUSINESS.review_length);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Business profile updated successfully!");
    }, 1000);
  };

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
                <BusinessAvatar name={name} size="lg" className="size-20" />
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
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
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
              <Label htmlFor="biz-g-url">Google review URL</Label>
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
              <Select value={aiTone} onValueChange={(val: any) => setAiTone(val)}>
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
              <Select value={reviewLength} onValueChange={(val: any) => setReviewLength(val)}>
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
            <Button type="submit" disabled={isSaving} className="gap-1.5">
              <Save className="size-4" /> {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
