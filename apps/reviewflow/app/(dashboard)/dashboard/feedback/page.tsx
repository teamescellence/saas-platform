"use client";

import * as React from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@repo/ui/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "sonner";
import { Search, ChevronRight, Brain, Copy, Calendar, QrCode, Building, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { Feedback } from "@/lib/types";

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);

  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["dashboardRecentFeedback"],
    queryFn: () => api.get<Feedback[]>(endpoints.dashboardRecentFeedback),
  });

  const { data: dbBranches = [] } = useQuery<any[]>({
    queryKey: ["branches"],
    queryFn: () => api.get<any[]>(endpoints.branches),
  });

  const branches = dbBranches;

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (
      searchTerm &&
      !fb.text?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !fb.topics?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    if (ratingFilter !== "all" && fb.rating.toString() !== ratingFilter) return false;
    if (branchFilter !== "all" && fb.branch_id !== branchFilter) return false;

    return true;
  });

  const handleCopyReview = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("AI draft copied!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Feedback</h1>
        <p className="text-sm text-muted-foreground">Analyze and explore raw customer submissions and AI sentiments.</p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback keywords, topics, comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            {branches.length > 0 && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks Table */}
      <Card className="border-border/50">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold">Feedback Submissions</CardTitle>
              <CardDescription>Showing {filteredFeedbacks.length} customer responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm">
              <p>No feedback entries found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rating</TableHead>
                    <TableHead>Feedback Comment</TableHead>
                    <TableHead className="w-[120px]">Sentiment</TableHead>
                    <TableHead className="w-[160px]">Topics</TableHead>
                    <TableHead className="w-[140px]">QR Code</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((fb) => (
                    <TableRow
                      key={fb.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedFeedback(fb)}
                    >
                      <TableCell>
                        <RatingStars rating={fb.rating} size="sm" />
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm font-medium text-foreground truncate">{fb.text || "—"}</p>
                      </TableCell>
                      <TableCell>
                        <SentimentBadge sentiment={fb.sentiment} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {fb.topics?.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50 capitalize"
                            >
                              {topic}
                            </span>
                          ))}
                          {(fb.topics?.length || 0) > 2 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{fb.topics.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {fb.qr_code?.name || "Main QR"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {fb.created_at ? format(new Date(fb.created_at), "dd MMM yyyy") : "Recent"}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Side Sheet */}
      <Sheet open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        {selectedFeedback && (
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <div className="flex justify-between items-center">
                <RatingStars rating={selectedFeedback.rating} size="lg" />
                <SentimentBadge sentiment={selectedFeedback.sentiment} />
              </div>
              <SheetTitle className="text-lg font-bold">Feedback Details</SheetTitle>
              <SheetDescription>
                Submitted on {selectedFeedback.created_at ? format(new Date(selectedFeedback.created_at), "PPP p") : "recently"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Customer submission */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Customer Input</h4>
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-sm text-foreground leading-relaxed">
                  &quot;{selectedFeedback.text || "No text commentary provided."}&quot;
                </div>
              </div>

              {/* AI Draft */}
              {selectedFeedback.review_draft && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Brain className="size-3.5" /> Generated AI Review Draft
                    </h4>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="h-6 gap-1 text-[10px]"
                      onClick={() => handleCopyReview(selectedFeedback.review_draft?.ai_draft || "")}
                    >
                      <Copy className="size-3" /> Copy
                    </Button>
                  </div>
                  <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground leading-relaxed">
                    {selectedFeedback.review_draft.ai_draft}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2 border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">QR Code:</span>
                    <span className="font-semibold text-foreground">{selectedFeedback.qr_code?.name || "Main QR"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                    <span className="text-muted-foreground block text-[10px]">Sentiment Score:</span>
                    <span className="font-semibold text-foreground">{selectedFeedback.sentiment === "positive" ? "0.95 (High)" : "0.50 (Neutral)"}</span>
                  </div>
                </div>
              </div>

              {/* Topics */}
              {selectedFeedback.topics && selectedFeedback.topics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topics Extracted</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFeedback.topics.map((topic) => (
                      <span key={topic} className="px-2 py-1 rounded bg-muted text-xs font-semibold text-foreground border border-border capitalize">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
