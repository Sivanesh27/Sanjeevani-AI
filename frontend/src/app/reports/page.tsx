"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { EntityBadge } from "@/components/EntityBadge";
import { documentApi } from "@/lib/api";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Download,
  Plus,
} from "lucide-react";

export default function ReportsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await documentApi.list();
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await documentApi.upload(formData);
      setUploadSuccess(`Report '${file.name}' analyzed successfully with local BC5CDR model!`);
      fetchDocuments();
    } catch (err: any) {
      setUploadError(err.response?.data?.error?.message || "Failed to analyze medical report.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report and its analysis?")) return;
    try {
      await documentApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-600" />
              <span>Medical Reports & Document Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely upload clinical PDFs, DOCX, and discharge summaries for automated entity extraction and summarization.
            </p>
          </div>

          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? "Extracting & Analyzing..." : "Upload Medical Document"}</span>
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <MedicalDisclaimer />

        {/* Upload Notifications */}
        {uploadSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Document List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Analyzed Reports ({documents.length})</h2>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No medical reports uploaded yet.</p>
              <p className="text-[11px] text-slate-400">Supported formats: PDF, DOCX, TXT (up to 25MB).</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {doc.original_filename}
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {doc.file_type}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {doc.status}
                      </span>
                    </div>

                    {doc.analysis?.summary && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {doc.analysis.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(doc.analysis?.detected_conditions || []).slice(0, 3).map((c: string) => (
                        <EntityBadge key={c} label="DISEASE" text={c} />
                      ))}
                      {(doc.analysis?.detected_medications || []).slice(0, 3).map((m: string) => (
                        <EntityBadge key={m} label="CHEMICAL" text={m} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Link
                      href={`/reports/${doc.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Analysis</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
