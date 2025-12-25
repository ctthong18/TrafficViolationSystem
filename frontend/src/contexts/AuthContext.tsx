"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthenticationApi } from "@/api";
import { Configuration } from "@/api/configuration";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  identification_number: string;
  phone_number?: string | null;
  department?: string | null;
  badge_number?: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    usernameOrEmail: string,
    password: string,
    identificationNumber?: string,
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  role?: string;
  identification_number?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (accessToken?: string) => {
    try {
      const tokenToUse = accessToken || token;
      if (!tokenToUse) {
        throw new Error("No access token available");
      }

      const configuration = new Configuration({
        basePath: API_BASE_URL,
        accessToken: tokenToUse,
      });
      const authApi = new AuthenticationApi(configuration);

      const response = await authApi.getCurrentUserInfoApiV1MeGet();
      const userData = response.data as User;

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token is still valid by fetching current user
          try {
            await refreshUser(storedToken);
          } catch (error) {
            // Token is invalid, clear auth state
            console.error("Token validation failed:", error);
            // logout();
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (
    usernameOrEmail: string,
    password: string,
    identificationNumber?: string,
  ) => {
    try {
      const configuration = new Configuration({
        basePath: API_BASE_URL,
      });
      const authApi = new AuthenticationApi(configuration);

      const response = await authApi.loginApiV1LoginPost({
        username_or_email: usernameOrEmail,
        password: password,
        identification_number: identificationNumber || null,
      });

      const { access_token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(access_token);
      setUser(userData as User);
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail || "Login failed. Please check your credentials.";
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const configuration = new Configuration({
        basePath: API_BASE_URL,
      });
      const authApi = new AuthenticationApi(configuration);

      await authApi.registerApiV1RegisterPost({
        username: data.username,
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone_number: data.phone_number,
        role: data.role || null,
        identification_number: data.identification_number || null,
      });

      // After successful registration, automatically log in
      await login(data.username, data.password, data.identification_number);
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail || "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
