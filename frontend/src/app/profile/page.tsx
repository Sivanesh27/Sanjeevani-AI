"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { profileApi } from "@/lib/api";
import {
  User,
  Heart,
  AlertTriangle,
  Pill,
  Activity,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({
    age: "",
    gender: "",
    blood_group: "",
    height_cm: "",
    weight_kg: "",
    known_allergies: [],
    chronic_conditions: [],
    current_medications: [],
    emergency_contact: "",
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [medicationInput, setMedicationInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileApi
      .getProfile()
      .then((res) => {
        if (res.data.data) {
          setProfile({
            age: res.data.data.age || "",
            gender: res.data.data.gender || "",
            blood_group: res.data.data.blood_group || "",
            height_cm: res.data.data.height_cm || "",
            weight_kg: res.data.data.weight_kg || "",
            known_allergies: res.data.data.known_allergies || [],
            chronic_conditions: res.data.data.chronic_conditions || [],
            current_medications: res.data.data.current_medications || [],
            emergency_contact: res.data.data.emergency_contact || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const calculateBMI = () => {
    const h = parseFloat(profile.height_cm);
    const w = parseFloat(profile.weight_kg);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const bmi = w / Math.pow(h / 100, 2);
    return bmi.toFixed(1);
  };

  const handleAddChip = (field: string, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setProfile((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    setter("");
  };

  const handleRemoveChip = (field: string, index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        blood_group: profile.blood_group || null,
        height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
        weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
        known_allergies: profile.known_allergies,
        chronic_conditions: profile.chronic_conditions,
        current_medications: profile.current_medications,
        emergency_contact: profile.emergency_contact || null,
      };
      await profileApi.updateProfile(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const bmi = calculateBMI();

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-teal-600" />
              <span>Patient Health Profile</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain physiological parameters, allergy profiles, and chronic conditions for clinical AI context.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Health Profile"}</span>
          </button>
        </div>

        <MedicalDisclaimer />

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Health profile saved successfully! Context will be used in clinical AI consultations.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Physiological Metrics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Vitals & Anthropometrics</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={profile.blood_group}
                  onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated BMI</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                  {bmi ? `${bmi} kg/m²` : "--"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.height_cm}
                  onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                  placeholder="e.g. 175"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                  placeholder="e.g. 74.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profile.emergency_contact}
                    onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                    placeholder="Name - +1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allergies, Conditions, Medications Chips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Allergies */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Known Allergies</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChip("known_allergies", allergyInput, setAllergyInput))}
                  placeholder="e.g. Penicillin"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddChip("known_allergies", allergyInput, setAllergyInput)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                {profile.known_allergies.map((a: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-xs font-medium">
                    <span>{a}</span>
                    <button type="button" onClick={() => handleRemoveChip("known_allergies", i)} className="hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Chronic Conditions</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChip("chronic_conditions", conditionInput, setConditionInput))}
                  placeholder="e.g. Hypertension"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddChip("chronic_conditions", conditionInput, setConditionInput)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                {profile.chronic_conditions.map((c: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-900 rounded-md text-xs font-medium">
                    <span>{c}</span>
                    <button type="button" onClick={() => handleRemoveChip("chronic_conditions", i)} className="hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" />
                <span>Active Medications</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChip("current_medications", medicationInput, setMedicationInput))}
                  placeholder="e.g. Metformin 500mg"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddChip("current_medications", medicationInput, setMedicationInput)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                {profile.current_medications.map((m: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-xs font-medium">
                    <span>{m}</span>
                    <button type="button" onClick={() => handleRemoveChip("current_medications", i)} className="hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
