"use client";

import * as React from "react";
import { MOCK_FEEDBACK, MOCK_BRANCHES } from "@/lib/mock-data";
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
import { Search, ChevronRight, Brain, Copy, ExternalLink, Calendar, QrCode, Building } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { Feedback } from "@/lib/types";

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);

  const { data: feedbacks = MOCK_FEEDBACK } = useQuery<Feedback[]>({
    queryKey: ["dashboardRecentFeedback"],
    queryFn: () => api.get<Feedback[]>(endpoints.dashboardRecentFeedback),
  });

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (
      searchTerm &&
      !fb.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !fb.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
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

      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search raw feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="h-9 w-[130px]">
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
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {MOCK_BRANCHES.map((br) => (
                  <SelectItem key={br.id} value={br.id}>
                    {br.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Rating</TableHead>
                  <TableHead className="w-[450px]">Original Text</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((fb) => (
                    <TableRow
                      key={fb.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedFeedback(fb)}
                    >
                      <TableCell>
                        <RatingStars rating={fb.rating} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm font-medium leading-relaxed max-w-[450px] truncate">
                        {fb.text}
                      </TableCell>
                      <TableCell>
                        <SentimentBadge sentiment={fb.sentiment} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {fb.topics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] bg-secondary text-secondary-foreground font-semibold px-2 py-0.5 rounded-md"
                            >
                              {topic}
                            </span>
                          ))}
                          {fb.topics.length > 2 && (
                            <span className="text-[10px] text-muted-foreground font-bold">
                              +{fb.topics.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{fb.branch?.name || "Main"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(fb.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No feedback submissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Sheet open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        {selectedFeedback && (
          <SheetContent className="w-[450px] sm:w-[540px] space-y-6">
            <SheetHeader>
              <div className="flex items-center justify-between mt-4">
                <SheetTitle className="text-lg font-bold">Feedback Details</SheetTitle>
                <StatusBadge status={selectedFeedback.status} />
              </div>
              <SheetDescription>
                Live analysis and review draft generation details.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              {/* Context info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>{format(new Date(selectedFeedback.created_at), "dd MMM yyyy, hh:mm a")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <QrCode className="size-3.5" />
                  <span>{selectedFeedback.qr_code?.name || "Scan"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building className="size-3.5" />
                  <span>{selectedFeedback.branch?.name || "Udaipur Main"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RatingStars rating={selectedFeedback.rating} size="sm" />
                </div>
              </div>

              {/* Original Feedback */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Original Feedback</h4>
                <div className="p-4 rounded-xl border border-border bg-background text-sm leading-relaxed">
                  &quot;{selectedFeedback.text}&quot;
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="size-4 text-primary" /> AI Analysis
                </h4>
                <div className="space-y-2 border border-border rounded-xl p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Sentiment</span>
                    <SentimentBadge sentiment={selectedFeedback.sentiment} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground font-semibold">Extracted Topics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFeedback.topics.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Draft */}
              {selectedFeedback.review_draft ? (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Polished Draft</h4>
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm italic leading-relaxed text-foreground">
                    &quot;{selectedFeedback.review_draft.ai_draft}&quot;
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs gap-1.5 h-10"
                      onClick={() => handleCopyReview(selectedFeedback.review_draft!.ai_draft)}
                    >
                      <Copy className="size-4" /> Copy Draft
                    </Button>
                    <Button
                      className="flex-1 text-xs gap-1.5 h-10"
                      onClick={() => window.open("https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs", "_blank")}
                    >
                      <ExternalLink className="size-4" /> Google Review
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground mb-3">No AI review draft generated yet.</p>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Brain className="size-4 text-primary" /> Generate AI Draft
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
