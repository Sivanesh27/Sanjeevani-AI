"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  FileText,
  MessageSquareHeart,
  User,
  History,
  ShieldAlert,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Biomedical NER", href: "/ner", icon: Cpu, badge: "Local ML" },
    { name: "Medical Reports", href: "/reports", icon: FileText },
    { name: "AI Assistant", href: "/assistant", icon: MessageSquareHeart },
    { name: "Health Profile", href: "/profile", icon: User },
    { name: "Medical History", href: "/history", icon: History },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ name: "Admin & Audit", href: "/admin", icon: ShieldAlert });
  }

  // Demo walkthrough always available
  navItems.push({ name: "Mentor Demo Mode", href: "/demo", icon: Sparkles, highlight: true });

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Clinical Workspace
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.highlight
                  ? "bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-800 border border-teal-200 font-semibold"
                  : isActive
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive && !item.highlight ? "text-white" : "text-teal-600"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isActive ? "bg-teal-700 text-teal-100" : "bg-teal-100 text-teal-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Local Model Loaded
          </p>
          <p className="text-[11px] text-slate-500 font-mono">tner/roberta-large-bc5cdr</p>
        </div>
      </div>
    </aside>
  );
};
