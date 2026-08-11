"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { Feedback } from "@/lib/types";
import { MOCK_FEEDBACK, MOCK_BRANCHES } from "@/lib/mock-data";
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
  Filter,
  MoreVertical,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("all");

  const { data: serverFeedbacks = MOCK_FEEDBACK, isLoading } = useQuery<Feedback[]>({
    queryKey: ["dashboardRecentFeedback"],
    queryFn: () => api.get<Feedback[]>(endpoints.dashboardRecentFeedback),
  });

  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>(MOCK_FEEDBACK);

  React.useEffect(() => {
    if (serverFeedbacks) {
      setFeedbacks(serverFeedbacks);
    }
  }, [serverFeedbacks]);

  const handleCopyReview = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Review text copied to clipboard!");
  };

  const handleOpenGoogle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    toast.info("Opening Google Review Page...");
  };

  const handleGenerateDraft = (id: string) => {
    setFeedbacks((prev) =>
      prev.map((fb) => {
        if (fb.id === id) {
          return {
            ...fb,
            status: "draft_generated" as const,
            review_draft: {
              id: `rd_${Date.now()}`,
              feedback_id: id,
              original_text: fb.text,
              ai_draft: `I visited Brew & Bliss and loved it! The ${fb.topics.join(" and ").toLowerCase() || "experience"} was outstanding. Recommend to everyone.`,
              is_edited: false,
              status: "generated" as const,
              created_at: new Date().toISOString(),
            },
          };
        }
        return fb;
      })
    );
    toast.success("AI review draft generated!");
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    // Tab sentiment filter
    if (activeTab !== "all" && fb.sentiment !== activeTab) return false;

    // Search term
    if (
      searchTerm &&
      !fb.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !fb.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    // Rating filter
    if (ratingFilter !== "all" && fb.rating.toString() !== ratingFilter) return false;

    // Branch filter
    if (branchFilter !== "all" && fb.branch_id !== branchFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reviews</h1>
          <p className="text-sm text-muted-foreground">View and manage customer review actions and drafts.</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
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

            {/* Tab selector */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 h-9">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="positive" className="text-xs">Positive</TabsTrigger>
                <TabsTrigger value="neutral" className="text-xs">Neutral</TabsTrigger>
                <TabsTrigger value="negative" className="text-xs">Negative</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Rating</TableHead>
                  <TableHead className="w-[300px]">Feedback</TableHead>
                  <TableHead className="w-[300px]">AI Draft</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((fb) => (
                    <TableRow key={fb.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <RatingStars rating={fb.rating} size="sm" />
                          <SentimentBadge sentiment={fb.sentiment} />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium leading-relaxed max-w-[300px]">
                        <p className="line-clamp-3">{fb.text}</p>
                      </TableCell>
                      <TableCell className="text-sm italic leading-relaxed text-muted-foreground max-w-[300px]">
                        {fb.review_draft ? (
                          <p className="line-clamp-3">&quot;{fb.review_draft.ai_draft}&quot;</p>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground/40 not-italic">No draft generated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={fb.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(fb.created_at), "dd MMM yyyy, hh:mm a")}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {fb.qr_code?.name || "Scan"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-xs font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground size-8">
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {fb.review_draft ? (
                              <>
                                <DropdownMenuItem onClick={() => handleCopyReview(fb.review_draft!.ai_draft)}>
                                  <Copy className="size-3.5 mr-2" /> Copy AI Draft
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenGoogle("https://search.google.com/local/writereview?placeid=ChIJTY-4QhBrrjsRIqHp8MDYbHs")}>
                                  <ExternalLink className="size-3.5 mr-2" /> Open Google review
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => handleGenerateDraft(fb.id)}>
                                <Sparkles className="size-3.5 mr-2 text-primary" /> Generate AI Draft
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
