"use client";

import * as React from "react";
import { MOCK_QR_CODES } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

export default function AdminQrCodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Global QR Codes</h1>
          <p className="text-sm text-muted-foreground">Monitor scans and routing tokens generated across all businesses.</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>System QR Codes</CardTitle>
          <CardDescription>Comprehensive list of generated routing endpoints</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">QR Code</TableHead>
                  <TableHead>Location / Name</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Total Scans</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_QR_CODES.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div className="p-1 bg-white border border-border rounded-lg inline-block">
                        <QRCodeSVG value={`https://${qr.url}`} size={50} level="M" />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{qr.name}</TableCell>
                    <TableCell className="font-mono text-xs text-primary truncate max-w-[250px]">
                      https://{qr.url}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{qr.total_scans}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(qr.created_at), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
