import Link from "next/link";
import { Star } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
          <Star className="size-4.5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">ReviewFlow</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
