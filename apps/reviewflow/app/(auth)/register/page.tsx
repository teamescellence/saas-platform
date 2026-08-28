"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, User, Building, Phone, Loader2, ArrowRight } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(7, "Please enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await registerUser({
      name: values.name,
      business_name: values.businessName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Get started with ReviewFlow for your business
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-3.5">
          {/* Owner Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Owner Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Rahul Sharma"
                className={`pl-9 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="businessName"
                placeholder="Brew & Bliss Cafe"
                className={`pl-9 ${errors.businessName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                {...register("businessName")}
              />
            </div>
            {errors.businessName && (
              <p className="text-xs text-destructive font-medium">{errors.businessName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="rahul@brewbliss.in"
                className={`pl-9 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98290 12345"
                className={`pl-9 ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-9 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-9 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Register & Continue to Setup <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
