import React from "react";
import { AlertCircle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-md text-amber-800 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Clinical Notice:</strong> SanjeevaniAI provides AI-assisted decision-support information, not definitive diagnosis.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-lg p-3.5 flex items-start gap-3 shadow-xs">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold text-amber-950 mb-0.5">Important Medical Information & Decision-Support Notice</p>
        <p>
          SanjeevaniAI is designed to assist healthcare professionals and patients with biomedical information extraction,
          document summarization, and clinical decision support. It is <strong>not an autonomous diagnostic device</strong> and is
          not a substitute for direct clinical examination, laboratory diagnosis, or emergency medical treatment.
        </p>
      </div>
    </div>
  );
};
