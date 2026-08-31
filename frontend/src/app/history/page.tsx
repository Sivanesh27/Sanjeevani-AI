"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { historyApi } from "@/lib/api";
import { History as HistoryIcon, Clock, FileText, MessageSquareHeart, UserCheck, Activity } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    historyApi
      .getHistory(100)
      .then((res) => setHistory(res.data.data || []))
      .catch((err) => console.error("Error loading history:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredHistory = filter === "ALL" ? history : history.filter((h) => h.action_type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "REPORT_ANALYSIS":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "CHAT":
        return <MessageSquareHeart className="w-4 h-4 text-teal-600" />;
      case "PROFILE_UPDATE":
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-teal-600" />
              <span>Medical History & Activity Log</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Traceable chronological record of clinical report analyses, AI consultations, and profile updates.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs">
            {["ALL", "REPORT_ANALYSIS", "CHAT", "PROFILE_UPDATE"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === t
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <MedicalDisclaimer />

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          {isLoading ? (
            <div className="text-center py-8">
              <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-xs text-slate-500 mt-2">Loading timeline...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No activity records found.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {filteredHistory.map((item) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  </div>

                  <div className="flex-1 bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getIcon(item.action_type)}
                        <span className="text-xs font-bold text-slate-900">{item.description}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>

                    {item.entity_count > 0 && (
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                        {item.entity_count} Entities Extracted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
