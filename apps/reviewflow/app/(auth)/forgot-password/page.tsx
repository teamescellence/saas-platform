"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success("Password reset link sent to your email!");
    }, 1000);
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                <ArrowLeft className="mr-1 size-3" /> Back to Login
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4 pt-4 text-center">
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
            <p className="text-sm font-medium">Check your inbox</p>
            <p className="text-xs text-muted-foreground mt-1">
              We have sent a password reset link to <strong className="text-foreground">{email}</strong>.
            </p>
          </div>
          <div className="text-center mt-4">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              <ArrowLeft className="mr-1 size-3" /> Back to Login
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
