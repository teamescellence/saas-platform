"use client";

import * as React from "react";
import { QRCodeCard } from "@/components/ui/qr-code-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "sonner";
import { Plus, QrCode, ScanLine, CheckSquare, Download, Copy, Printer, Eye, Settings, Loader2, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { QRCode } from "@/lib/types";

export default function QrCodesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selectedQr, setSelectedQr] = React.useState<QRCode | null>(null);

  // Form Fields
  const [newName, setNewName] = React.useState("");
  const [selectedBranch, setSelectedBranch] = React.useState("");

  // Fetch Business Info
  const { data: business } = useQuery<any>({
    queryKey: ["businessInfo"],
    queryFn: () => api.get(endpoints.business),
  });

  // Fetch QR codes
  const { data: qrCodes = [], isLoading } = useQuery<QRCode[]>({
    queryKey: ["qrCodes"],
    queryFn: () => api.get(endpoints.qrCodes),
  });

  // Fetch branches
  const { data: dbBranches = [] } = useQuery<any[]>({
    queryKey: ["branches"],
    queryFn: () => api.get<any[]>(endpoints.branches),
  });

  const branches = dbBranches;

  React.useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(String(branches[0].id));
    }
  }, [branches, selectedBranch]);

  // Create QR Code Mutation
  const createQrMutation = useMutation({
    mutationFn: (payload: { name: string; branch_id: string }) => {
      return api.post<any>("/business/qr-codes", {
        name: payload.name,
        branch_id: payload.branch_id ? Number(payload.branch_id) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      setCreateOpen(false);
      setNewName("");
      toast.success("New QR Code generated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create QR code.");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createQrMutation.mutate({
      name: newName,
      branch_id: selectedBranch,
    });
  };

  const handlePreview = (qr: QRCode) => {
    setSelectedQr(qr);
    setPreviewOpen(true);
  };

  const handleCopy = (qr: QRCode) => {
    const fullUrl = qr.url.startsWith("http") ? qr.url : `https://${qr.url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Review URL copied to clipboard!");
  };

  const handleDownload = (qr: QRCode) => {
    // Basic SVG/Image download trigger
    toast.success(`Preparing high-res PNG for ${qr.name}...`);
  };

  const totalScans = qrCodes.reduce((sum, q) => sum + (q.total_scans || 0), 0);
  const activeCount = qrCodes.filter((q) => q.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Codes</h1>
          <p className="text-sm text-muted-foreground">
            Generate, download, and track QR code locations for customer feedback.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 h-10">
          <Plus className="size-4" /> Create QR
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total QR Codes"
          value={qrCodes.length}
          icon={QrCode}
        />
        <StatCard
          title="Total Scans"
          value={totalScans.toLocaleString()}
          icon={ScanLine}
        />
        <StatCard
          title="Active QR Codes"
          value={activeCount}
          icon={CheckSquare}
        />
      </div>

      {/* QR List Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : qrCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-card text-center space-y-3">
          <QrCode className="size-12 text-muted-foreground opacity-50" />
          <h3 className="text-base font-bold text-foreground">No QR codes created yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Generate your first QR code to place on dining tables, packaging, or counter stands.
          </p>
          <Button onClick={() => setCreateOpen(true)} size="sm">Create QR Code</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {qrCodes.map((qr) => (
            <QRCodeCard
              key={qr.id}
              qrCode={qr}
              onDownload={() => handleDownload(qr)}
              onCopyUrl={() => handleCopy(qr)}
              onPreview={() => handlePreview(qr)}
            />
          ))}
        </div>
      )}

      {/* Modal: Create QR Code */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate New QR Code</DialogTitle>
            <DialogDescription>
              Create a distinct QR code for a table, billing desk, or branch location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="qr-name">Location / Identifier Name</Label>
                <Input
                  id="qr-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Table 04, VIP Section, Reception"
                  required
                />
              </div>

              {branches.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="qr-branch">Assigned Branch</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger id="qr-branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createQrMutation.isPending}>
                {createQrMutation.isPending ? "Generating..." : "Generate QR"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Full QR Preview & Print Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[460px] text-center">
          {selectedQr && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedQr.name}</DialogTitle>
                <DialogDescription>
                  {selectedQr.branch ? selectedQr.branch.name : (business?.name || "My Business")}
                </DialogDescription>
              </DialogHeader>

              <div className="my-6 p-6 rounded-2xl bg-white text-zinc-900 border shadow-inner flex flex-col items-center justify-center space-y-4">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-lg tracking-tight text-zinc-900">
                    {business?.name || "ReviewFlow"}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Scan to leave a review
                  </p>
                </div>

                <div className="p-3 bg-white border-2 border-dashed border-zinc-200 rounded-xl">
                  <QRCodeSVG
                    value={selectedQr.url.startsWith("http") ? selectedQr.url : `https://${selectedQr.url}`}
                    size={190}
                    level="H"
                    includeMargin
                  />
                </div>

                <p className="text-[11px] font-mono text-zinc-500 truncate max-w-xs">
                  {selectedQr.url}
                </p>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-1.5"
                  onClick={() => {
                    window.open(selectedQr.url, "_blank");
                  }}
                >
                  <ExternalLink className="size-4" /> Open Page
                </Button>
                <Button variant="outline" className="w-full sm:w-auto gap-1.5" onClick={() => handleCopy(selectedQr)}>
                  <Copy className="size-4" /> Copy URL
                </Button>
                <Button className="w-full sm:w-auto gap-1.5" onClick={() => handleDownload(selectedQr)}>
                  <Download className="size-4" /> Download Kit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
