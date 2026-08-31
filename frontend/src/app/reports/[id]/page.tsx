"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { EntityBadge } from "@/components/EntityBadge";
import { documentApi } from "@/lib/api";
import {
  FileText,
  ArrowLeft,
  Activity,
  Pill,
  Clock,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Cpu,
  Layers,
} from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const docId = params.id as string;

  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!docId) return;
    documentApi
      .getById(docId)
      .then((res) => setDoc(res.data.data))
      .catch((err) => console.error("Error fetching report details:", err))
      .finally(() => setIsLoading(false));
  }, [docId]);

  const handleCopyText = () => {
    if (!doc?.analysis?.raw_text) return;
    navigator.clipboard.writeText(doc.analysis.raw_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <span className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="text-xs text-slate-500 font-medium">Loading report analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-4">
          <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">Report Not Found</p>
            <p className="text-xs text-slate-500">The requested medical report does not exist or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  const analysis = doc.analysis;

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Navigation & Title */}
        <div className="space-y-3">
          <Link href="/reports" className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{doc.original_filename}</h1>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {doc.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                <span>Format: {doc.file_type.toUpperCase()}</span>
                <span>•</span>
                <span>Size: {Math.round(doc.file_size / 1024)} KB</span>
                <span>•</span>
                <span>SHA-256: {doc.file_hash.substring(0, 16)}...</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Extracted Text"}</span>
              </button>
            </div>
          </div>
        </div>

        <MedicalDisclaimer />

        {/* Clinical Summary & Findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Automated Clinical Summary</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {analysis?.summary || "Summary not generated."}
            </p>
          </div>

          {/* Important Findings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Key Clinical Findings</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-700">
              {(analysis?.important_findings || []).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Extracted Conditions & Medications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>Biomedical Entities Identified (RoBERTa-large BC5CDR)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-xl space-y-2">
              <p className="text-xs font-bold text-rose-900 uppercase tracking-wider">Identified Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysis?.detected_conditions || []).map((c: string) => (
                  <EntityBadge key={c} label="DISEASE" text={c} />
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-2">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Pharmaceutical Agents</p>
              <div className="flex flex-wrap gap-1.5">
                {(analysis?.detected_medications || []).map((m: string) => (
                  <EntityBadge key={m} label="CHEMICAL" text={m} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Raw Text Viewer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Extracted Document Text</span>
          </h2>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {analysis?.raw_text || "No text available."}
          </pre>
        </div>
      </div>
    </div>
  );
}
