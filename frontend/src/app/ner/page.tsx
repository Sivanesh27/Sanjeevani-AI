"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { EntityBadge } from "@/components/EntityBadge";
import { nerApi } from "@/lib/api";
import {
  Cpu,
  Sparkles,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  Activity,
  Layers,
  Copy,
  Check,
} from "lucide-react";

interface NEREntity {
  text: string;
  label: string;
  start: number;
  end: number;
  confidence?: number | null;
  model: string;
}

interface NERResult {
  request_id: string;
  model: {
    name: string;
    version: string;
    provider: string;
    device: string;
    status: string;
  };
  entities: NEREntity[];
  entity_count: number;
  processing_time_ms: number;
  text_length: number;
}

const PRESETS = [
  {
    title: "Diabetes & Hypertension (Standard Case)",
    text: "The patient was prescribed metformin 500mg and lisinopril 10mg for type 2 diabetes mellitus and secondary hypertension.",
  },
  {
    title: "Cardiology Acute Coronary Syndrome",
    text: "Following acute myocardial infarction, the patient received loading doses of aspirin, clopidogrel, and unfractionated heparin.",
  },
  {
    title: "Rheumatology & Autoimmune Therapy",
    text: "Patient diagnosed with active rheumatoid arthritis was initiated on methotrexate alongside daily folic acid supplementation.",
  },
  {
    title: "Oncology & Chemotherapy Protocol",
    text: "Patient with metastatic colorectal cancer undergoing treatment with oxaliplatin, fluorouracil, and leucovorin with peripheral neuropathy monitoring.",
  },
];

export default function NERPage() {
  const [text, setText] = useState<string>(PRESETS[0].text);
  const [result, setResult] = useState<NERResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAnalyze = async (inputText?: string) => {
    const textToAnalyze = inputText !== undefined ? inputText : text;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await nerApi.analyze(textToAnalyze);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to execute NER model inference.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render text with highlighted entities
  const renderHighlightedText = () => {
    if (!result || result.entities.length === 0) {
      return <p className="text-sm text-slate-700 leading-relaxed font-mono">{text}</p>;
    }

    // Sort entities by start offset
    const sorted = [...result.entities].sort((a, b) => a.start - b.start);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((ent, i) => {
      // Add plain text before entity
      if (ent.start > lastIndex) {
        elements.push(
          <span key={`plain-${lastIndex}`}>{text.substring(lastIndex, ent.start)}</span>
        );
      }

      // Add highlighted entity
      const isChemical = ent.label === "CHEMICAL";
      elements.push(
        <mark
          key={`ent-${i}`}
          className={`px-1.5 py-0.5 rounded-md font-semibold text-xs transition-all cursor-help border inline-block my-0.5 ${
            isChemical
              ? "bg-emerald-100/90 text-emerald-950 border-emerald-400"
              : "bg-rose-100/90 text-rose-950 border-rose-400"
          }`}
          title={`${ent.label} (Confidence: ${ent.confidence ? Math.round(ent.confidence * 100) + "%" : "N/A"})`}
        >
          {text.substring(ent.start, ent.end)}
          <span
            className={`ml-1 text-[9px] uppercase font-bold px-1 py-0.2 rounded ${
              isChemical ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
            }`}
          >
            {ent.label}
          </span>
        </mark>
      );

      lastIndex = ent.end;
    });

    // Add remaining plain text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`plain-${lastIndex}`}>{text.substring(lastIndex)}</span>
      );
    }

    return <div className="text-sm leading-loose font-mono bg-slate-50/70 p-4 rounded-xl border border-slate-200">{elements}</div>;
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Page Header with Model Spec Badge */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-extrabold uppercase tracking-wider">
                Pretrained ML Engine
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Loaded Locally (D:\SanjeevaniAI\models\bc5cdr-ner)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-teal-600" />
              <span>Biomedical Named Entity Recognition (NER)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live token classification using RoBERTa-large fine-tuned on BioCreative V CDR (BC5CDR).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white border border-slate-200 p-2 rounded-xl shadow-xs">
            <span className="font-bold text-slate-800">Architecture:</span>
            <span>RobertaForTokenClassification (1.4 GB)</span>
          </div>
        </div>

        <MedicalDisclaimer />

        {/* Presets Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Mentor Demonstration Presets:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setText(p.text);
                  handleAnalyze(p.text);
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all text-left"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Inference Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Input Text Area */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Input Clinical Text</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{text.length} characters</span>
            </div>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter patient notes, clinical summaries, or medical text containing diseases and medications..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> CHEMICAL
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> DISEASE
                </span>
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading || !text.trim()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Running Inference...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run BC5CDR Inference</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Visualizer & Entity Output */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Extracted Entities & Visualizer</span>
              </h2>

              {result && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <strong>{result.processing_time_ms} ms</strong>
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Copy JSON response"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!result && !isLoading && !error && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                <Cpu className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-medium">Click &quot;Run BC5CDR Inference&quot; or choose a preset.</p>
                <p className="text-[11px] text-slate-400">Tokens are processed by the local neural model.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 flex-1">
                {/* Visual Highlight Rendering */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Token Span Highlighting
                  </p>
                  {renderHighlightedText()}
                </div>

                {/* Entity Table */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Detected Biomedical Entities ({result.entity_count})
                  </p>
                  {result.entities.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No chemical or disease entities detected in text.</p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 font-semibold">Entity Text</th>
                            <th className="py-2 px-3 font-semibold">Class</th>
                            <th className="py-2 px-3 font-semibold">Char Spans</th>
                            <th className="py-2 px-3 font-semibold">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {result.entities.map((ent, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2 px-3 font-bold text-slate-900">{ent.text}</td>
                              <td className="py-2 px-3">
                                {ent.label === "CHEMICAL" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    <Pill className="w-3 h-3 text-emerald-600" />
                                    Chemical
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                                    <Activity className="w-3 h-3 text-rose-600" />
                                    Disease
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-500 text-[11px]">
                                [{ent.start}:{ent.end}]
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-800">
                                {ent.confidence ? `${Math.round(ent.confidence * 100)}%` : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
