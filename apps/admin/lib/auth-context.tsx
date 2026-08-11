"use client";

import * as React from "react";
import { toast } from "sonner";
import { MOCK_ADMIN_USER } from "./mock-data";

interface AuthContextType {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<any>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Automatically log in the mock admin user on mount so the dashboard works out-of-the-box
    setUser({
      id: MOCK_ADMIN_USER.id,
      name: MOCK_ADMIN_USER.name,
      email: MOCK_ADMIN_USER.email,
      roles: ["super-admin"],
      organization_id: null,
      organization_slug: null,
    });
    setToken("mock-admin-token");
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setUser({
      id: MOCK_ADMIN_USER.id,
      name: MOCK_ADMIN_USER.name,
      email: MOCK_ADMIN_USER.email,
      roles: ["super-admin"],
      organization_id: null,
      organization_slug: null,
    });
    setToken("mock-admin-token");
    toast.success(`Welcome back, ${MOCK_ADMIN_USER.name}!`);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    toast.success("Successfully logged out.");
  };

  const hasRole = (role: string) => {
    return role === "super-admin";
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.includes("super-admin");
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
