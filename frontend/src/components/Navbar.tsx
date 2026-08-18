"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { healthApi } from "@/lib/api";
import { Activity, ShieldCheck, User as UserIcon, LogOut, ChevronDown, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin, isAuthenticated } = useAuth();
  const [modelStatus, setModelStatus] = useState<string>("Checking...");
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    healthApi
      .getReady()
      .then((res) => {
        if (res.data.status === "ready") {
          setModelStatus("RoBERTa-large BC5CDR Online");
        } else {
          setModelStatus("ML Engine Ready");
        }
      })
      .catch(() => setModelStatus("Mock LLM Mode"));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Sanjeevani<span className="text-teal-600">AI</span>
                <span className="text-[10px] uppercase tracking-widest font-extrabold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">AI-Powered Healthcare Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Model Status & Actions */}
        <div className="flex items-center gap-3">
          {/* ML Status indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-[11px]">{modelStatus}</span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg transition-colors border border-slate-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Roles</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 text-xs">
                <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Quick Demo Login</p>
                <button
                  onClick={() => {
                    quickLogin("patient");
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-teal-50 rounded-lg text-slate-800 font-medium flex items-center justify-between"
                >
                  <span>Patient (Alex Mercer)</span>
                  <span className="text-[10px] bg-slate-100 px-1 rounded">52y M</span>
                </button>
                <button
                  onClick={() => {
                    quickLogin("doctor");
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-teal-50 rounded-lg text-slate-800 font-medium flex items-center justify-between"
                >
                  <span>Dr. Sarah Jenkins</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">MD</span>
                </button>
                <button
                  onClick={() => {
                    quickLogin("admin");
                    setShowDemoMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-teal-50 rounded-lg text-slate-800 font-medium flex items-center justify-between"
                >
                  <span>Administrator</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1 rounded">Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* User Auth Info */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-teal-600 uppercase tracking-wider font-bold">{user.role}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
