"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Phone,
  Video,
  MessageCircle,
  Clock,
  Languages,
  Award,
} from "lucide-react";
import { LawyerDetail } from "@/types/lawyers";
import BookingModal from "./BookingModal";
import RatingModal from "./RatingModal";

interface LawyerDetailContentProps {
  lawyer: LawyerDetail;
}

export default function LawyerDetailContent({ lawyer }: LawyerDetailContentProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(lawyer.consultationFee);

  return (
    <div className="w-full min-h-screen bg-[#f3f4f6]">
      {/* Black Header */}
      <div className="w-full bg-[#0a0a0a]">
        <div className="w-full px-4 md:px-8 xl:w-[65%] xl:mx-auto pt-12 pb-10 space-y-8">
          <Link
            href="/find-a-lawyer"
            className="inline-flex items-center gap-1 text-lg text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Lawyers</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-[#c4922a]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              {lawyer.avatar ? (
                <img src={lawyer.avatar} alt={lawyer.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold text-white">{lawyer.name.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-semibold text-white">{lawyer.name}</h1>
                {lawyer.verified && (
                  <CheckCircle className="w-6 h-6 text-[#c4922a]" />
                )}
              </div>
              <p className="text-xl text-[#6B7280] font-normal">{lawyer.practiceArea}</p>
              <div>
                <span className="text-base font-medium text-[#1f7550] bg-[#1a1a1a] px-4 py-1.5 rounded-full">
                  {lawyer.availabilityStatus === "AVAILABLE"
                    ? "Available now"
                    : lawyer.availabilityStatus === "BUSY"
                    ? "Busy"
                    : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Light Gray Content */}
      <div className="w-full px-4 md:px-8 xl:w-[60%] xl:mx-auto py-10 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl px-2 md:px-8 py-4 md:py-6 shadow-sm text-center">
            <p className="text-base md:text-3xl font-normal text-black">{lawyer.rating}</p>
            <p className="text-xs md:text-base text-black/60">{lawyer.ratingCount} reviews</p>
          </div>
          <div className="bg-white rounded-2xl px-2 md:px-8 py-4 md:py-6 shadow-sm text-center">
            <p className="text-base md:text-3xl font-normal text-black">{lawyer.yearsOfExperience}yr</p>
            <p className="text-xs md:text-base text-black/60">Qualified</p>
          </div>
          <div className="bg-white rounded-2xl px-2 md:px-8 py-4 md:py-6 shadow-sm text-center">
            <p className="text-base md:text-3xl font-normal text-black">{formattedPrice}</p>
            <p className="text-xs md:text-base text-black/60">Per session</p>
          </div>
        </div>

        {/* Info Row */}
        <div className="bg-white rounded-xl px-4 md:px-10 py-4 md:py-7 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-base md:text-xl text-black">
            <Award className="w-4 h-4 md:w-6 md:h-6 text-[#554116]/40" />
            <span>Bar #{lawyer.barMembership}</span>
          </div>
          <div className="flex items-center gap-3 text-base md:text-xl text-black">
            <Languages className="w-4 h-4 md:w-6 md:h-6 text-[#554116]/40" />
            <span>{lawyer.languages.join(", ")}</span>
          </div>
          <div className="flex items-center gap-3 text-base md:text-xl text-black">
            <Clock className="w-4 h-4 md:w-6 md:h-6 text-[#554116]/40" />
            <span>Responds in {lawyer.responseTimeEstimate}</span>
          </div>
        </div>

        {/* Practice Areas */}
        <div className="bg-white rounded-xl px-4 md:px-10 py-4 md:py-7 shadow-sm">
          <h3 className="text-xs md:text-base font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
            Practice Areas
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {lawyer.specialtyTags.map((area) => (
              <span
                key={area}
                className="px-3 md:px-5 py-1 md:py-2.5 bg-[#f3f4f6] rounded-full text-xs md:text-xl font-normal text-black"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl px-4 md:px-5 py-3 shadow-sm">
          <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-auto py-3 md:py-6 rounded-xl md:rounded-2xl font-semibold text-xs md:text-lg flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer transition-colors">
                <Phone className="w-5 h-5 md:w-7 md:h-7" />
                Voice Call
              </div>
              <div className="bg-[#c4922a] hover:bg-[#2a2a2a] text-white h-auto py-3 md:py-6 rounded-xl md:rounded-2xl font-semibold text-xs md:text-lg flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer transition-colors">
                <Video className="w-5 h-5 md:w-7 md:h-7" />
                Video Call
              </div>
              <div className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-auto py-3 md:py-6 rounded-xl md:rounded-2xl font-semibold text-xs md:text-lg flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer transition-colors">
                <MessageCircle className="w-5 h-5 md:w-7 md:h-7" />
                Chat
              </div>
            </div>
            <div
              onClick={() => setIsBookingOpen(true)}
              className="w-full bg-transparent hover:bg-black border border-black text-black hover:text-white h-auto py-3 md:py-6 rounded-xl md:rounded-2xl font-semibold text-xs md:text-lg flex items-center justify-center transition-colors cursor-pointer"
            >
              Book a Consultation
            </div>

            {/* TEST RATING BUTTON - Remove this when APIs are ready */}
            <div
              onClick={() => setIsRatingOpen(true)}
              className="w-full bg-transparent hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-black h-auto py-2 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer mt-2"
            >
              Test Rating (remove me)
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        lawyerName={lawyer.name}
        lawyerId={lawyer.id}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        lawyerName={lawyer.name}
        lawyerId={lawyer.id}
        requestId="test-request-id"
      />
    </div>
  );
}