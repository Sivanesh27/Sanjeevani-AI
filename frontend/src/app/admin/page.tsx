"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MetricCard } from "@/components/MetricCard";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/api";
import {
  ShieldAlert,
  Users,
  FileText,
  Cpu,
  Lock,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export default function AdminPage() {
  const { user, quickLogin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      Promise.allSettled([adminApi.getStats(), adminApi.getAuditLogs(50)])
        .then(([statsRes, logsRes]) => {
          if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
          if (logsRes.status === "fulfilled") setAuditLogs(logsRes.value.data.data || []);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 max-w-2xl mx-auto my-auto space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Administrator Access Required</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This module displays privileged platform health metrics, neural model telemetry, and immutable security audit logs.
          </p>
          <button
            onClick={() => quickLogin("admin")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch to Demo Admin Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
            System Administration
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            <span>Platform Operations & Security Audit</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor model telemetry, aggregate clinical entities, and inspect access logs.
          </p>
        </div>

        <MedicalDisclaimer />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={stats?.total_users ?? "--"}
            subtitle="Registered accounts"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Processed Documents"
            value={stats?.total_documents ?? "--"}
            subtitle="Clinical reports in DB"
            icon={FileText}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />
          <MetricCard
            title="Biomedical Entities"
            value={stats?.total_entities_extracted ?? "--"}
            subtitle="BC5CDR extractions"
            icon={Cpu}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <MetricCard
            title="Model Status"
            value="RoBERTa-large"
            subtitle={stats?.model_status?.device ? `Device: ${stats.model_status.device}` : "Active"}
            icon={ShieldAlert}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* Security Audit Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Security & Access Audit Trail</span>
          </h2>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No audit logs recorded.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Action</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Details</th>
                    <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{log.action}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-sans text-xs">{log.details || "--"}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
