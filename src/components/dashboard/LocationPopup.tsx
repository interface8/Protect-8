"use client";

import { X, CheckCircle, Shield, Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onContinue: () => void;
}

export default function LocationPopup({
  isOpen,
  onClose,
  onAllow,
  onContinue,
}: LocationPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white rounded-2xl p-6 md:p-8 relative shadow-2xl border-t-4 border-t-[#c4922a]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-start mb-5">
          <div className="w-16 h-16 bg-[#c4922a]/10 rounded-full flex items-center justify-center">
            <MapPin className="w-9 h-9 text-[#c4922a]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
          Allow Location Access
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Sharing your location helps us find the nearest available lawyer so they can reach you quickly.
        </p>

        {/* Privacy Info */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-3 text-base text-gray-600">
            <CheckCircle className="w-5 h-5 text-[#c4922a] flex-shrink-0" />
            <span>Used only during active legal emergencies</span>
          </div>
          <div className="flex items-center gap-3 text-base text-gray-600">
            <Shield className="w-5 h-5 text-[#c4922a] flex-shrink-0" />
            <span>Never stored or shared without consent</span>
          </div>
          <div className="flex items-center gap-3 text-base text-gray-600">
            <Lock className="w-5 h-5 text-[#c4922a] flex-shrink-0" />
            <span>Encrypted end-to-end</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onAllow}
            className="w-full bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-12 rounded-xl font-semibold text-lg"
          >
            Allow Location Access
          </Button>
          <Button
            onClick={onContinue}
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:text-[#0a0a0a] hover:bg-gray-50 h-12 rounded-xl font-semibold text-lg"
          >
            Continue without location
          </Button>
        </div>
      </Card>
    </div>
  );
}