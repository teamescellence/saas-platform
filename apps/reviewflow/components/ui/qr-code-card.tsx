"use client";

import { cn } from "@repo/ui/lib/utils";
import { QrCode as QrCodeIcon, Link, Download, Eye, Settings, ScanLine } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import type { QRCode } from "@/lib/types";

interface QRCodeCardProps {
  qrCode: QRCode;
  onDownload?: () => void;
  onCopyUrl?: () => void;
  onPreview?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function QRCodeCard({
  qrCode,
  onDownload,
  onCopyUrl,
  onPreview,
  onEdit,
  className,
}: QRCodeCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 flex flex-col gap-4",
        !qrCode.is_active && "opacity-60",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <QrCodeIcon className="size-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{qrCode.name}</h4>
            {qrCode.branch && (
              <p className="text-xs text-muted-foreground">{qrCode.branch.name}</p>
            )}
          </div>
        </div>
        {!qrCode.is_active && (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            Disabled
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
        <Link className="size-3 shrink-0" />
        <span className="truncate font-mono">{qrCode.url}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ScanLine className="size-4" />
        <span className="font-semibold text-foreground">{qrCode.total_scans.toLocaleString("en-IN")}</span>
        <span>scans</span>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onDownload} className="gap-1 text-xs">
          <Download className="size-3" /> Download
        </Button>
        <Button variant="ghost" size="sm" onClick={onCopyUrl} className="gap-1 text-xs">
          <Link className="size-3" /> Copy URL
        </Button>
        <Button variant="ghost" size="sm" onClick={onPreview} className="gap-1 text-xs">
          <Eye className="size-3" /> Preview
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <Settings className="size-3" />
        </Button>
      </div>
    </div>
  );
}
