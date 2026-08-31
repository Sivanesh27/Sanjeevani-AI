import React from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  FileText,
  MessageSquareHeart,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 text-center font-medium">
        <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded mr-2 font-mono text-[10px] uppercase tracking-wider">
          Industry-Grade Clinical AI
        </span>
        Decision-support intelligence powered by verified local RoBERTa-large BC5CDR models.
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>SanjeevaniAI Platform v1.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            AI-Powered Healthcare <br />
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Intelligence & Decision Support
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A production-quality clinical AI system providing biomedical Named Entity Recognition (NER),
            automated medical document analysis, structured clinical summarization, and interactive AI consultation.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all text-sm"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold shadow-xs transition-all text-sm"
            >
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Test Local NER Model</span>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-sm transition-all"
            >
              <span>Mentor Demo Mode</span>
            </Link>
          </div>

          {/* Prominent Medical Disclaimer */}
          <div className="pt-6 max-w-2xl mx-auto text-left">
            <MedicalDisclaimer />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Core Clinical AI Capabilities</h2>
            <p className="text-slate-500 text-sm mt-2">
              Engineered with medical privacy principles, reproducible ML inference, and explicit safety boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Local Biomedical NER</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Powered by a locally fine-tuned <strong>tner/roberta-large-bc5cdr</strong> token classification model.
                Extracts <span className="text-emerald-700 font-semibold">CHEMICAL</span> and{" "}
                <span className="text-rose-700 font-semibold">DISEASE</span> entities with exact offsets and confidence scores.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Medical Document Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Secure multi-format PDF and text pipeline with SHA-256 integrity verification, automated clinical
                findings extraction, and structured pharmacological summarization.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Clinical AI Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-provider LLM abstraction (Gemini + MockLLM) adhering to non-diagnostic safety guardrails,
                automatic emergency red-flag triage, and patient profile context awareness.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Health Profile & History</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patient longitudinal timeline tracking medications, allergies, chronic conditions, and chronological
                analysis logs with audit traceability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Security & RBAC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Role-based access control (PATIENT, DOCTOR, ADMIN), bcrypt password hashing, JWT session management,
                and comprehensive security audit logging.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Emergency Triage Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Heuristic emergency symptom detection identifying critical cardiovascular and respiratory red flags
                with instant emergency escalation notices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>SanjeevaniAI</span>
          </div>
          <p className="text-center sm:text-left">
            Designed with healthcare-data privacy and clinical safety principles in mind.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/demo" className="hover:text-teal-300">Mentor Demo</Link>
            <Link href="/ner" className="hover:text-teal-300">NER Demo</Link>
            <Link href="/dashboard" className="hover:text-teal-300">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
