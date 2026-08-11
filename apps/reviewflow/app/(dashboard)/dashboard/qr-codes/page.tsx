"use client";

import * as React from "react";
import { MOCK_QR_CODES, MOCK_BRANCHES } from "@/lib/mock-data";
import { QRCodeCard } from "@/components/ui/qr-code-card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "sonner";
import { Plus, QrCode, ScanLine, CheckSquare, Download, Copy, Printer, Eye, Settings } from "lucide-react";
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
  const [selectedBranch, setSelectedBranch] = React.useState("br_1");

  // Fetch Business Info
  const { data: business } = useQuery<any>({
    queryKey: ["businessInfo"],
    queryFn: () => api.get(endpoints.business),
  });

  // Fetch QR codes
  const { data: qrCodes = MOCK_QR_CODES } = useQuery<QRCode[]>({
    queryKey: ["qrCodes"],
    queryFn: () => api.get(endpoints.qrCodes),
  });

  // Create QR Code Mutation
  const createQrMutation = useMutation({
    mutationFn: (payload: { name: string; branch_id: string }) => {
      return api.post<any>("/business/qr-codes", {
        business_id: business?.id,
        branch_id: payload.branch_id,
        name: payload.name,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      toast.success("QR Code created successfully!");
      setCreateOpen(false);
      setNewName("");
      if (res.data) {
        // Map backend response fields to local shape
        const newQr: QRCode = {
          id: res.data.id,
          business_id: res.data.business_id,
          branch_id: res.data.branch_id,
          name: res.data.name,
          token: res.data.token_hash,
          url: `${window.location.hostname}/q/${res.data.token_hash}`,
          total_scans: 0,
          is_active: true,
          created_at: res.data.created_at,
        };
        setSelectedQr(newQr);
        setPreviewOpen(true);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create QR Code");
    },
  });

  const activeQrs = qrCodes.filter((qr) => qr.is_active);
  const totalScans = qrCodes.reduce((acc, curr) => acc + (curr.total_scans || 0), 0);

  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createQrMutation.mutate({
      name: newName,
      branch_id: selectedBranch,
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    toast.success("URL copied to clipboard!");
  };

  const handleDownloadPNG = (token: string, name: string) => {
    const svgElement = document.getElementById(`qr-svg-${token}`);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx?.drawImage(img, 0, 0, 500, 500);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `reviewflow-qr-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("Download started!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Codes</h1>
          <p className="text-sm text-muted-foreground">Generate, download, and track QR code locations for customer feedback.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 h-10">
          <Plus className="size-4" /> Create QR
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total QR Codes" value={qrCodes.length} icon={QrCode} />
        <StatCard label="Total Scans" value={totalScans} icon={ScanLine} />
        <StatCard label="Active QR Codes" value={activeQrs.length} icon={CheckSquare} />
      </div>

      {/* QR Code Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qr) => (
          <div key={qr.id} className="relative group">
            <QRCodeCard
              qrCode={qr}
              onDownload={() => handleDownloadPNG(qr.token, qr.name)}
              onCopyUrl={() => handleCopyUrl(qr.url)}
              onPreview={() => {
                setSelectedQr(qr);
                setPreviewOpen(true);
              }}
              onEdit={() => {
                toast.info("Edit features coming soon!");
              }}
            />
            {/* hidden SVG for download logic */}
            <div className="hidden">
              <QRCodeSVG
                id={`qr-svg-${qr.token}`}
                value={`https://${qr.url}`}
                size={500}
                level="H"
              />
            </div>
            <Link
              href={`/dashboard/qr-codes/${qr.id}/brand-kit`}
              className="absolute top-4 right-14 inline-flex items-center justify-center size-7 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground text-xs font-semibold shadow-sm"
              title="Brand Kit"
            >
              <Eye className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Create QR Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create QR Code</DialogTitle>
            <DialogDescription>
              Assign a new QR code to a table, counter, or packaging.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateQr}>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="qr-name">Location / Table Name</Label>
                <Input
                  id="qr-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Table 05, Billing Counter, Takeaway"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qr-branch">Select Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger id="qr-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_BRANCHES.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create QR Code</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        {selectedQr && (
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="text-center">{selectedQr.name} QR Code</DialogTitle>
              <DialogDescription className="text-center">
                Scan preview for {selectedQr.branch?.name || "Main Branch"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6 gap-6">
              <div className="p-4 bg-white border-2 border-primary/20 rounded-2xl shadow-md">
                <QRCodeSVG
                  value={`https://${selectedQr.url}`}
                  size={200}
                  level="H"
                />
              </div>
              <div className="w-full space-y-1.5 text-center text-xs font-mono bg-muted p-2.5 rounded-lg truncate">
                https://{selectedQr.url}
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                  variant="outline"
                  className="gap-1.5 h-10"
                  onClick={() => handleDownloadPNG(selectedQr.token, selectedQr.name)}
                >
                  <Download className="size-4" /> Download PNG
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 h-10"
                  onClick={() => handleCopyUrl(selectedQr.url)}
                >
                  <Copy className="size-4" /> Copy URL
                </Button>
                <Button
                  className="col-span-2 gap-1.5 h-10"
                  asChild
                >
                  <Link href={`/dashboard/qr-codes/${selectedQr.id}/brand-kit`}>
                    <Eye className="size-4" /> Open Print Brand Kit
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
