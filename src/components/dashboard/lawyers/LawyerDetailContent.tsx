"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { LawyerDetail } from "@/types/lawyers";

interface LawyerDetailHeaderProps {
  lawyer: LawyerDetail;
}

export default function LawyerDetailHeader({ lawyer }: LawyerDetailHeaderProps) {
  return (
    <div className="w-full bg-[#0a0a0a]">
      <div className="w-full px-4 md:px-8 xl:w-[65%] xl:mx-auto pt-12 pb-10 space-y-8">
        {/* Back link */}
        <Link
          href="/find-a-lawyer"
          className="inline-flex items-center gap-1 text-lg text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Lawyers</span>
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-6">
          {/* Avatar Image - Square with rounded corners */}
          <div className="w-24 h-24 rounded-xl bg-[#c4922a]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {lawyer.avatar ? (
              <img
                src={lawyer.avatar}
                alt={lawyer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-white">
                {lawyer.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Name + Verified Badge */}
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                {lawyer.name}
              </h1>
              <CheckCircle className="w-6 h-6 text-[#c4922a]" />
            </div>
            <p className="text-xl text-[#6B7280] font-normal">{lawyer.specialty}</p>
            <div>
              <span className="text-base font-medium text-[#1f7550] bg-[#1a1a1a] px-4 py-1.5 rounded-full">
                Available now
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}