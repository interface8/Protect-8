"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CircleCheckBig,
  Award,
  Languages,
  Clock,
  Phone,
  Video,
  MessageCircle,
} from "lucide-react";
import { LawyerDetail } from "@/types/lawyers";
import { formatNGN } from "@/lib/format";
import LawyerAvatar, { getAvailability } from "./LawyerAvatar";
import BookingModal from "./BookingModal";
import RatingModal from "./RatingModal";

interface LawyerDetailContentProps {
  lawyer: LawyerDetail;
}

export default function LawyerDetailContent({ lawyer }: LawyerDetailContentProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const availability = getAvailability(lawyer.availabilityStatus);

  const stats = [
    {
      value: lawyer.rating.toFixed(1),
      label: `${lawyer.ratingCount} reviews`,
      gold: true,
    },
    { value: `${lawyer.yearsOfExperience}yr`, label: "Qualified", gold: false },
    { value: formatNGN(lawyer.consultationFee), label: "Per session", gold: false },
  ];

  const info = [
    { icon: Award, text: `Bar #${lawyer.barMembership}` },
    { icon: Languages, text: lawyer.languages.join(", ") },
    { icon: Clock, text: `Responds in ${lawyer.responseTimeEstimate}` },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#f5f3f0]">
      {/* Dark header */}
      <div className="w-full bg-[#0a0a0a]">
        <div className="mx-auto w-[90%] max-w-3xl pb-7 pt-10">
          <Link
            href="/find-a-lawyer"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Lawyers
          </Link>

          <div className="mt-6 flex items-center gap-4">
            <LawyerAvatar
              name={lawyer.name}
              src={lawyer.avatar}
              status={lawyer.availabilityStatus}
              size="lg"
              dotBorderClass="border-[#0a0a0a]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-medium leading-7 text-white">
                  {lawyer.name}
                </h1>
                {lawyer.verified && (
                  <CircleCheckBig className="h-4 w-4 text-[#c4922a]" />
                )}
              </div>
              <p className="mt-1.5 text-sm text-white/40">{lawyer.practiceArea}</p>
              <span
                className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs ${availability.pill}`}
              >
                {availability.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-[90%] max-w-[688px] space-y-4 pb-10 pt-7">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-black/[0.06] bg-white px-2 py-4 text-center"
            >
              <p
                className={`text-lg leading-7 ${
                  stat.gold ? "text-[#c4922a]" : "text-[#0a0a0a]"
                }`}
              >
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="space-y-3.5 rounded-xl border border-black/[0.06] bg-white p-5">
          {info.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 text-sm text-[#0a0a0a]/80"
            >
              <Icon className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Practice areas */}
        <div className="rounded-xl border border-black/[0.06] bg-white p-5">
          <h3 className="mb-3.5 text-xs font-medium uppercase tracking-widest text-gray-500">
            Practice Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {lawyer.specialtyTags.map((area) => (
              <span
                key={area}
                className="rounded-full border border-black/[0.05] bg-[#f0eeea] px-3.5 py-1 text-sm text-[#0a0a0a]/80"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#0a0a0a] py-4 text-xs font-medium text-white transition-colors hover:bg-[#1f1f1f]"
          >
            <Phone className="h-5 w-5" />
            Voice Call
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#c4922a] py-4 text-xs font-medium text-white transition-colors hover:bg-[#b3841f]"
          >
            <Video className="h-5 w-5" />
            Video Call
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#1a1a1a] py-4 text-xs font-medium text-white transition-colors hover:bg-[#2a2a2a]"
          >
            <MessageCircle className="h-5 w-5" />
            Chat
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="h-[52px] w-full rounded-2xl border border-[#0a0a0a] bg-transparent text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
        >
          Book a Consultation
        </button>

        {/* Dev-only rating test, never shipped to production */}
        {process.env.NODE_ENV === "development" && (
          <button
            type="button"
            onClick={() => setIsRatingOpen(true)}
            className="w-full rounded-xl border border-gray-300 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-black"
          >
            Test Rating (dev only)
          </button>
        )}
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        lawyerName={lawyer.name}
        lawyerId={lawyer.id}
      />

      {process.env.NODE_ENV === "development" && (
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          lawyerName={lawyer.name}
          lawyerId={lawyer.id}
          requestId="test-request-id"
        />
      )}
    </div>
  );
}