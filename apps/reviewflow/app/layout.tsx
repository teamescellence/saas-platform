import type { Metadata } from "next";
import { Geist, Geist_Mono, Literata, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { cn } from "@repo/ui/lib/utils";
import { Providers } from "./providers";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  style: ["normal", "italic"],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReviewFlow AI - Smarter Reviews, Better Experiences",
  description: "AI-powered customer review assistant for businesses and multi-tenant SaaS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        literata.variable,
        beVietnamPro.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
