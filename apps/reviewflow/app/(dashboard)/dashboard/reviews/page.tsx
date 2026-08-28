"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { Feedback } from "@/lib/types";
import { RatingStars } from "@/components/ui/rating-stars";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  MoreVertical,
  Copy,
  Sparkles,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("all");

  const { data: serverFeedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["dashboardRecentFeedback"],
    queryFn: () => api.get<Feedback[]>(endpoints.dashboardRecentFeedback),
  });

  const { data: dbBranches = [] } = useQuery<any[]>({
    queryKey: ["branches"],
    queryFn: () => api.get<any[]>(endpoints.branches),
  });

  const branches = dbBranches;
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);

  React.useEffect(() => {
    if (serverFeedbacks) {
      setFeedbacks(serverFeedbacks);
    }
  }, [serverFeedbacks]);

  const handleCopyReview = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Review text copied to clipboard!");
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    // Search
    if (
      searchTerm &&
      !fb.text?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !fb.review_draft?.ai_draft?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Rating
    if (ratingFilter !== "all" && fb.rating.toString() !== ratingFilter) return false;

    // Branch
    if (branchFilter !== "all" && fb.branch_id !== branchFilter) return false;

    // Tabs
    if (activeTab === "ai_generated" && !fb.review_draft) return false;
    if (activeTab === "pending" && fb.status !== "pending") return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reviews Hub</h1>
        <p className="text-sm text-muted-foreground">Monitor generated AI review drafts and customer feedback.</p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">All Reviews ({feedbacks.length})</TabsTrigger>
            <TabsTrigger value="ai_generated">
              AI Drafted ({feedbacks.filter((f) => f.review_draft).length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({feedbacks.filter((f) => f.status === "pending").length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter Toolbar */}
        <Card className="border-border/50">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews by keywords or customer input..."
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

        {/* Reviews Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-border/50">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-bold">Customer Review Stream</CardTitle>
              <CardDescription>
                Showing {filteredFeedbacks.length} verified submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm">
                  <p>No reviews found matching your selected criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Rating</TableHead>
                        <TableHead>Customer Submission</TableHead>
                        <TableHead>AI Drafted Text</TableHead>
                        <TableHead className="w-[120px]">Sentiment</TableHead>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((fb) => (
                        <TableRow key={fb.id}>
                          <TableCell>
                            <RatingStars rating={fb.rating} size="sm" />
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-foreground line-clamp-2">{fb.text || "—"}</p>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              QR: {fb.qr_code?.name || "Main"}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-sm">
                            {fb.review_draft ? (
                              <div className="space-y-1">
                                <p className="text-xs text-foreground bg-primary/5 p-2 rounded border border-primary/10 line-clamp-2">
                                  {fb.review_draft.ai_draft}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-primary font-semibold">
                                  <Sparkles className="size-3" /> AI Generated
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No draft generated</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <SentimentBadge sentiment={fb.sentiment} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {fb.created_at ? format(new Date(fb.created_at), "dd MMM yyyy") : "Recent"}
                          </TableCell>
                          <TableCell>
                            {fb.review_draft && (
                              <DropdownMenu>
                                <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-xs font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground size-8">
                                  <MoreVertical className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleCopyReview(fb.review_draft?.ai_draft || "")}>
                                    <Copy className="size-3.5 mr-2" /> Copy AI Draft
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
