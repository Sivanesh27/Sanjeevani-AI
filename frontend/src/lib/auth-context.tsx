"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "./api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "USER" | "PATIENT" | "DOCTOR" | "ADMIN";
  is_active: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role?: string) => Promise<void>;
  logout: () => void;
  quickLogin: (role: "patient" | "doctor" | "admin") => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("sanjeevani_token");
    const savedUser = localStorage.getItem("sanjeevani_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("sanjeevani_token");
        localStorage.removeItem("sanjeevani_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const data = res.data.data;
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("sanjeevani_token", data.access_token);
      localStorage.setItem("sanjeevani_refresh_token", data.refresh_token);
      localStorage.setItem("sanjeevani_user", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, full_name: string, role = "PATIENT") => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ email, password, full_name, role });
      const data = res.data.data;
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("sanjeevani_token", data.access_token);
      localStorage.setItem("sanjeevani_refresh_token", data.refresh_token);
      localStorage.setItem("sanjeevani_user", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: "patient" | "doctor" | "admin") => {
    const credentials = {
      patient: { email: "demo.patient@sanjeevani.ai", password: "DemoPatient2026!" },
      doctor: { email: "demo.doctor@sanjeevani.ai", password: "DemoDoctor2026!" },
      admin: { email: "demo.admin@sanjeevani.ai", password: "DemoAdmin2026!" },
    };
    const cred = credentials[role];
    await login(cred.email, cred.password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("sanjeevani_token");
    localStorage.removeItem("sanjeevani_refresh_token");
    localStorage.removeItem("sanjeevani_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
