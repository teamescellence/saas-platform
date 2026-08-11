"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_QR_CODES, MOCK_BUSINESS } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Download, Printer, Palette, Type, Sliders, Sparkles, Coffee } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrBrandKitPage() {
  const params = useParams();
  const router = useRouter();
  const qrId = params.id as string;
  const qrCode = MOCK_QR_CODES.find((q) => q.id === qrId) || MOCK_QR_CODES[0];

  // Customization State
  const [bizName, setBizName] = React.useState(MOCK_BUSINESS.name);
  const [customMsg, setCustomMsg] = React.useState("Enjoyed your experience? Scan to share your feedback.");
  const [bgColor, setBgColor] = React.useState("#FAF6F0"); // Warm premium cream
  const [textColor, setTextColor] = React.useState("#3A2A1A"); // Dark warm brown
  const [qrSize, setQrSize] = React.useState(180);
  const [activeTab, setActiveTab] = React.useState("table_card");

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Downloading printable kit package as PDF...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="size-9 shrink-0">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Brand Kit</h1>
            <p className="text-sm text-muted-foreground">Print custom table cards, stickers, and stands for {qrCode.name}.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5 h-10" onClick={handleDownload}>
            <Download className="size-4" /> Download PDF
          </Button>
          <Button className="gap-1.5 h-10" onClick={handlePrint}>
            <Printer className="size-4" /> Print Assets
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Customize settings */}
        <Card className="lg:col-span-1 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Sliders className="size-4.5 text-primary" /> Customize Template
            </CardTitle>
            <CardDescription>Adjust colors, message, and QR dimensions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="kit-name">Business Name</Label>
              <Input
                id="kit-name"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kit-msg">Custom Message</Label>
              <Input
                id="kit-msg"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kit-bg" className="flex items-center gap-1">
                  <Palette className="size-3.5" /> Background
                </Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    id="kit-bg"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-9 p-0.5 cursor-pointer rounded-md shrink-0"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono text-xs h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kit-text" className="flex items-center gap-1">
                  <Type className="size-3.5" /> Text Color
                </Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    id="kit-text"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-9 p-0.5 cursor-pointer rounded-md shrink-0"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="font-mono text-xs h-9"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex justify-between">
                <span>QR Code Size</span>
                <span className="font-mono text-xs">{qrSize}px</span>
              </Label>
              <input
                type="range"
                min="120"
                max="240"
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Visual Asset Previews */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 h-10 w-full bg-muted/50 p-1">
              <TabsTrigger value="table_card" className="text-xs">Table Card</TabsTrigger>
              <TabsTrigger value="counter_stand" className="text-xs">Counter Stand</TabsTrigger>
              <TabsTrigger value="sticker" className="text-xs">Sticker</TabsTrigger>
              <TabsTrigger value="takeaway" className="text-xs">Takeaway Card</TabsTrigger>
            </TabsList>

            {/* Previews containers */}
            <div className="mt-6 flex justify-center p-8 bg-muted/30 border border-border/50 rounded-2xl">
              {/* Table Card Preview */}
              {activeTab === "table_card" && (
                <div
                  id="print-area-table"
                  className="w-[320px] aspect-[1/1.4] rounded-2xl shadow-xl flex flex-col items-center justify-between p-6 text-center border transition-all duration-300"
                  style={{ backgroundColor: bgColor, color: textColor, borderColor: `${textColor}20` }}
                >
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <div className="size-10 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center border border-black/5">
                      <Coffee className="size-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg tracking-tight">{bizName}</h3>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl shadow-md border border-black/5">
                    <QRCodeSVG value={`https://${qrCode.url}`} size={qrSize} level="H" />
                  </div>

                  <div className="space-y-1 mb-2">
                    <p className="font-bold text-xs uppercase tracking-wider opacity-75">Scan to share</p>
                    <p className="font-medium text-sm leading-snug px-4">{customMsg}</p>
                  </div>
                </div>
              )}

              {/* Counter Stand Preview */}
              {activeTab === "counter_stand" && (
                <div
                  id="print-area-stand"
                  className="w-[280px] aspect-[1/1.6] rounded-2xl shadow-xl flex flex-col items-center justify-between p-6 text-center border transition-all duration-300"
                  style={{ backgroundColor: bgColor, color: textColor, borderColor: `${textColor}20` }}
                >
                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      Review Us On Google
                    </span>
                    <h3 className="font-extrabold text-xl tracking-tight mt-1">{bizName}</h3>
                  </div>

                  <div className="p-4 bg-white rounded-xl shadow-lg border border-black/5">
                    <QRCodeSVG value={`https://${qrCode.url}`} size={qrSize} level="H" />
                  </div>

                  <div className="space-y-1.5 mb-2">
                    <p className="font-bold text-xs leading-snug">{customMsg}</p>
                    <p className="text-[10px] opacity-60 font-semibold uppercase tracking-wider">No app or registration required</p>
                  </div>
                </div>
              )}

              {/* Sticker Preview */}
              {activeTab === "sticker" && (
                <div
                  id="print-area-sticker"
                  className="w-[300px] aspect-square rounded-full shadow-xl flex flex-col items-center justify-center p-6 text-center border transition-all duration-300 relative overflow-hidden"
                  style={{ backgroundColor: bgColor, color: textColor, borderColor: `${textColor}20` }}
                >
                  {/* Circular border details */}
                  <div className="absolute inset-2 border-2 border-dashed rounded-full opacity-20 pointer-events-none" style={{ borderColor: textColor }} />

                  <div className="flex flex-col items-center gap-3 z-10">
                    <h3 className="font-extrabold text-sm tracking-tight">{bizName}</h3>
                    <div className="p-3 bg-white rounded-xl shadow-md border border-black/5">
                      <QRCodeSVG value={`https://${qrCode.url}`} size={qrSize - 20} level="H" />
                    </div>
                    <p className="font-bold text-[9px] uppercase tracking-wider opacity-75 max-w-[150px]">
                      Scan to share feedback
                    </p>
                  </div>
                </div>
              )}

              {/* Takeaway Card Preview */}
              {activeTab === "takeaway" && (
                <div
                  id="print-area-takeaway"
                  className="w-[420px] aspect-[1.8/1] rounded-2xl shadow-xl flex items-center justify-between p-6 text-left border transition-all duration-300 gap-4"
                  style={{ backgroundColor: bgColor, color: textColor, borderColor: `${textColor}20` }}
                >
                  <div className="flex flex-col justify-between h-full flex-1">
                    <div>
                      <h3 className="font-extrabold text-lg tracking-tight">{bizName}</h3>
                      <p className="text-xs opacity-75 mt-1 leading-relaxed">{customMsg}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Follow us on social</p>
                      <p className="text-[10px] font-semibold opacity-75">reviewflow.in/{MOCK_BUSINESS.slug}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl shadow-md border border-black/5 shrink-0">
                    <QRCodeSVG value={`https://${qrCode.url}`} size={qrSize - 40} level="H" />
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
