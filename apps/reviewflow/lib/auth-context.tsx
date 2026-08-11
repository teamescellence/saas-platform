"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, endpoints } from "./api";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  organization_id: number | null;
  organization_slug: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize auth from localStorage on mount
  React.useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("rf_token");
      const storedUser = localStorage.getItem("rf_user");

      if (storedToken && storedUser) {
        try {
          api.setToken(storedToken);
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify/refresh user state from backend to ensure token is still valid
          const data = await api.get<{ user: User }>(endpoints.me);
          setUser(data.user);
          localStorage.setItem("rf_user", JSON.stringify(data.user));
        } catch (err) {
          // Token expired or invalid, clean up
          localStorage.removeItem("rf_token");
          localStorage.removeItem("rf_user");
          api.setToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Route protection rules
  React.useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password");
    const isAdminRoute = pathname.startsWith("/admin");
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isPublicReviewRoute = pathname.startsWith("/q");

    if (isPublicReviewRoute) {
      // Public review page is always accessible, do not redirect
      return;
    }

    if (!user) {
      // Guest users: restrict dashboard and admin access
      if (isAdminRoute || isDashboardRoute) {
        router.push("/login");
      }
    } else {
      // Logged-in users: prevent access to auth routes
      if (isAuthRoute) {
        if (user.roles.includes("super-admin")) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }

      // Restrict admin routes to super-admin
      if (isAdminRoute && !user.roles.includes("super-admin")) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/dashboard");
      }

      // Restrict dashboard routes to tenant users
      if (isDashboardRoute && user.roles.includes("super-admin")) {
        router.push("/admin");
      }
    }
  }, [user, pathname, isLoading, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.post<{ token: string; user: User }>(endpoints.login, { email, password });
      
      localStorage.setItem("rf_token", data.token);
      localStorage.setItem("rf_user", JSON.stringify(data.user));
      
      api.setToken(data.token);
      setToken(data.token);
      setUser(data.user);

      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.roles.includes("super-admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post(endpoints.logout);
    } catch (err) {
      // Ignore network errors on logout to ensure user gets cleared locally
    } finally {
      localStorage.removeItem("rf_token");
      localStorage.removeItem("rf_user");
      api.setToken(null);
      setToken(null);
      setUser(null);
      toast.success("Successfully logged out.");
      router.push("/login");
      setIsLoading(false);
    }
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return user?.roles.some((role) => roles.includes(role)) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
