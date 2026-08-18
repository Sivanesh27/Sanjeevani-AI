import React from "react";
import { Pill, Activity, Tag } from "lucide-react";

interface EntityBadgeProps {
  label: string;
  text: string;
  confidence?: number | null;
  className?: string;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({
  label,
  text,
  confidence,
  className = "",
}) => {
  const isChemical = label.toUpperCase() === "CHEMICAL" || label.toUpperCase() === "MEDICINE";
  const isDisease = label.toUpperCase() === "DISEASE" || label.toUpperCase() === "CONDITION";

  if (isChemical) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-xs ${className}`}
      >
        <Pill className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold">{text}</span>
        <span className="text-[10px] uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
          Chemical
        </span>
        {confidence !== undefined && confidence !== null && (
          <span className="text-[10px] text-emerald-700 ml-0.5 font-mono">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </span>
    );
  }

  if (isDisease) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-300/80 shadow-xs ${className}`}
      >
        <Activity className="w-3.5 h-3.5 text-rose-600" />
        <span className="font-semibold">{text}</span>
        <span className="text-[10px] uppercase tracking-wider bg-rose-200/60 text-rose-900 px-1.5 py-0.5 rounded font-bold">
          Disease
        </span>
        {confidence !== undefined && confidence !== null && (
          <span className="text-[10px] text-rose-700 ml-0.5 font-mono">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300 ${className}`}
    >
      <Tag className="w-3 h-3 text-slate-500" />
      <span>{text}</span>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
    </span>
  );
};
