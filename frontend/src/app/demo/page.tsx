"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { useAuth } from "@/lib/auth-context";
import {
  Sparkles,
  Cpu,
  FileText,
  MessageSquareHeart,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function DemoPage() {
  const { quickLogin } = useAuth();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "1. Verified Local ML Engine",
      subtitle: "RoBERTa-large BC5CDR Token Classification",
      desc: "Demonstrate that the model is loaded entirely locally from disk (models/bc5cdr-ner) with zero external cloud NER dependencies.",
      link: "/ner",
      actionText: "Open NER Inference Visualizer",
      icon: Cpu,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      id: 2,
      title: "2. Medical Document Analysis",
      subtitle: "Multi-Format PDF/Text Extraction & Summarization",
      desc: "Upload or inspect clinical reports to see automated chemical and disease extraction, key findings, and non-diagnostic summaries.",
      link: "/reports",
      actionText: "Open Document Intelligence",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: 3,
      title: "3. Clinical AI Consultation & Emergency Triage",
      subtitle: "Decision Support & Non-Diagnostic Guardrails",
      desc: "Interact with the medical assistant. Test the heuristic red-flag detector with acute symptom queries (e.g. chest pain) to see emergency triage notices.",
      link: "/assistant",
      actionText: "Open AI Assistant",
      icon: MessageSquareHeart,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      id: 4,
      title: "4. Longitudinal Health Profile & Timeline",
      subtitle: "Patient Anthropometrics & Allergy Tracking",
      desc: "Review patient physiological indicators, chronic conditions, and chronological activity records with full traceability.",
      link: "/profile",
      actionText: "Open Health Profile",
      icon: User,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: 5,
      title: "5. Security, RBAC & Immutable Audit Logs",
      subtitle: "Role-Based Access & Operation Traceability",
      desc: "Switch to the Admin account to view platform statistics and tamper-evident audit logs of all authentication and document activities.",
      link: "/admin",
      actionText: "Open Admin & Audit Logs",
      icon: ShieldCheck,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-3 shadow-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mentor Presentation Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SanjeevaniAI Demonstration Walkthrough
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Follow this 5-step guided walkthrough to demonstrate every architectural component, local neural model inference,
            clinical safety guardrails, and secure document processing to your technical mentor.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => quickLogin("patient")}
              className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Demo as Patient (Alex Mercer)
            </button>
            <button
              onClick={() => quickLogin("doctor")}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Demo as Doctor (Dr. Jenkins)
            </button>
            <button
              onClick={() => quickLogin("admin")}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Demo as Admin
            </button>
          </div>
        </div>

        <MedicalDisclaimer />

        {/* Guided Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${step.bg} ${step.color} flex-shrink-0 mt-0.5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {step.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{step.desc}</p>
                  </div>
                </div>

                <Link
                  href={step.link}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start md:self-center whitespace-nowrap"
                >
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
