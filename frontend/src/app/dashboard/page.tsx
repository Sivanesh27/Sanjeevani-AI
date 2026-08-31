"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { MetricCard } from "@/components/MetricCard";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { EntityBadge } from "@/components/EntityBadge";
import { useAuth } from "@/lib/auth-context";
import { documentApi, profileApi, historyApi } from "@/lib/api";
import {
  FileText,
  Activity,
  Pill,
  MessageSquareHeart,
  Upload,
  Cpu,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, profileRes, historyRes] = await Promise.allSettled([
          documentApi.list(),
          profileApi.getProfile(),
          historyApi.getHistory(5),
        ]);

        if (docsRes.status === "fulfilled") setDocuments(docsRes.value.data.data || []);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value.data.data || null);
        if (historyRes.status === "fulfilled") setHistory(historyRes.value.data.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Aggregate conditions and medications from documents and profile
  const conditions = Array.from(
    new Set([
      ...(profile?.chronic_conditions || []),
      ...documents.flatMap((d) => d.analysis?.detected_conditions || []),
    ])
  );

  const medications = Array.from(
    new Set([
      ...(profile?.current_medications || []),
      ...documents.flatMap((d) => d.analysis?.detected_medications || []),
    ])
  );

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-800">{user?.full_name || "Guest Clinician"}</span>.
              Here is your active healthcare summary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ner"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span>Biomedical NER</span>
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Report</span>
            </Link>
          </div>
        </div>

        <MedicalDisclaimer />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Reports Analyzed"
            value={documents.length}
            subtitle="Clinical documents parsed"
            icon={FileText}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Detected Conditions"
            value={conditions.length}
            subtitle="Clinical indications"
            icon={Activity}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
          <MetricCard
            title="Active Medications"
            value={medications.length}
            subtitle="Pharmaceutical agents"
            icon={Pill}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <MetricCard
            title="AI Model Status"
            value="BC5CDR"
            subtitle="RoBERTa-large Local GPU"
            icon={Cpu}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />
        </div>

        {/* 2-Column Content: Reports & Entities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Documents */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Recent Analyzed Medical Reports</span>
              </h2>
              <Link href="/reports" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No medical reports uploaded yet.</p>
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold"
                >
                  Upload First Report
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {doc.original_filename}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          {doc.status}
                        </span>
                      </div>
                      {doc.analysis?.summary && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {doc.analysis.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(doc.analysis?.detected_conditions || []).slice(0, 2).map((c: string) => (
                          <EntityBadge key={c} label="DISEASE" text={c} />
                        ))}
                        {(doc.analysis?.detected_medications || []).slice(0, 2).map((m: string) => (
                          <EntityBadge key={m} label="CHEMICAL" text={m} />
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/reports/${doc.id}`}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 self-center whitespace-nowrap"
                    >
                      View Report →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Extracted Health Entities & Activity */}
          <div className="space-y-6">
            {/* Extracted Conditions & Meds */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Extracted Entities</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Conditions</p>
                  {conditions.length === 0 ? (
                    <p className="text-xs text-slate-400">None detected yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {conditions.map((c: any) => (
                        <EntityBadge key={c} label="DISEASE" text={c} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Medications</p>
                  {medications.length === 0 ? (
                    <p className="text-xs text-slate-400">None detected yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {medications.map((m: any) => (
                        <EntityBadge key={m} label="CHEMICAL" text={m} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Recent Activity</span>
              </h2>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400">No recent activity recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-800 font-medium">{h.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
