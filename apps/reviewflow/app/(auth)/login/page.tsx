"use client";

import * as React from "react";
import { LoginForm } from "@repo/ui/components/login-form";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("rahul@brewbliss.in");
  const [password, setPassword] = React.useState("password123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // Toast notifications are handled in auth-context
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    toast.info(`OAuth login via ${provider} coming soon!`);
  };

  return (
    <LoginForm
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      onGoogleLogin={() => handleOAuth("Google")}
      onAppleLogin={() => handleOAuth("Apple")}
      signUpHref="/register"
      forgotPasswordHref="/forgot-password"
      className="w-full max-w-sm mx-auto"
    />
  );
}
