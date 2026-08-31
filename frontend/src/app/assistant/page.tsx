"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { chatApi } from "@/lib/api";
import {
  MessageSquareHeart,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Bot,
  User as UserIcon,
  ShieldAlert,
  Info,
} from "lucide-react";

interface StructuredData {
  summary: string;
  possible_considerations?: string[];
  relevant_medical_info?: string[];
  questions_for_doctor?: string[];
  safety_warning?: string;
  is_emergency?: boolean;
  emergency_instructions?: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  structured_data?: StructuredData | null;
  model_provider?: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

const SAMPLE_PROMPTS = [
  "What are typical dietary recommendations for managing Type 2 Diabetes?",
  "Can you explain why metformin is taken with meals and its gastrointestinal profile?",
  "I am having severe crushing chest pain, shortness of breath, and left arm numbness.",
];

export default function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await chatApi.listConversations();
      const list = res.data.data || [];
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
        setMessages(list[0].messages || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      const res = await chatApi.getConversation(id);
      setMessages(res.data.data.messages || []);
    } catch (err) {
      console.error("Error loading conversation:", err);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await chatApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewConversation();
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isSending) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);

    try {
      const res = await chatApi.sendMessage(textToSend, activeConvId || undefined);
      const data = res.data.data;

      if (!activeConvId) {
        setActiveConvId(data.conversation_id);
      }

      setMessages((prev) => [...prev, data.message]);
      fetchConversations();
    } catch (err: any) {
      const errMsg: Message = {
        role: "assistant",
        content: err.response?.data?.error?.message || "Failed to reach AI assistant service.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-61px)]">
        {/* Left Sub-Sidebar: Conversation History */}
        <div className="w-full md:w-72 bg-white border-r border-slate-200/80 flex flex-col p-4 space-y-3">
          <button
            onClick={handleNewConversation}
            className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Medical Consultation</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
              Previous Consultations
            </p>
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 px-2 py-4 italic">No previous chats.</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    activeConvId === c.id
                      ? "bg-teal-50 text-teal-900 border border-teal-200 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate flex-1">{c.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Workspace */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {/* Top Banner Notice */}
          <div className="p-3 bg-white border-b border-slate-200/80">
            <MedicalDisclaimer compact />
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="max-w-xl mx-auto my-auto py-12 text-center space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                  <Bot className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-slate-900">Clinical AI Consultation Assistant</h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Ask questions about medical conditions, pharmacological mechanisms, lab reports, or drug interactions.
                  </p>
                </div>

                {/* Prompt suggestions */}
                <div className="space-y-2 text-left">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suggested Queries:</p>
                  <div className="space-y-1.5">
                    {SAMPLE_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                          i === 2
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300"
                        }`}
                      >
                        {i === 2 && <span className="font-bold text-rose-700 mr-1.5">[Emergency Triage Test]</span>}
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm ${
                    m.role === "user"
                      ? "bg-teal-600 text-white shadow-xs ml-8"
                      : "bg-white border border-slate-200/80 text-slate-800 shadow-xs mr-8 space-y-3"
                  }`}>
                    {/* Plain Text or Summary */}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                    {/* Structured AI Output Rendering */}
                    {m.structured_data && (
                      <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                        {/* Emergency Alert Box */}
                        {m.structured_data.is_emergency && (
                          <div className="p-3 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-950 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-rose-800">
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                              <span>POTENTIAL MEDICAL EMERGENCY DETECTED</span>
                            </div>
                            <p className="leading-relaxed">{m.structured_data.emergency_instructions}</p>
                          </div>
                        )}

                        {/* Clinical Considerations */}
                        {(m.structured_data.possible_considerations || []).length > 0 && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-teal-600" />
                              <span>Clinical Considerations</span>
                            </p>
                            <ul className="space-y-1 text-slate-700 pl-2">
                              {m.structured_data.possible_considerations?.map((item, i) => (
                                <li key={i} className="list-disc list-inside">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Questions for Doctor */}
                        {(m.structured_data.questions_for_doctor || []).length > 0 && (
                          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 space-y-1.5">
                            <p className="font-bold text-amber-950 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Recommended Questions for your Physician</span>
                            </p>
                            <ul className="space-y-1 text-amber-900 pl-2">
                              {m.structured_data.questions_for_doctor?.map((q, i) => (
                                <li key={i} className="list-disc list-inside">
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Model Source Pill */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>Provider: {m.model_provider || "Google Gemini / Local Engine"}</span>
                          <span>Non-Diagnostic Support</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-11">
                <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Generating clinical decision support guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200/80">
            <div className="max-w-4xl mx-auto flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about medications, symptoms, or clinical guidelines..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={isSending || !inputText.trim()}
                className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
