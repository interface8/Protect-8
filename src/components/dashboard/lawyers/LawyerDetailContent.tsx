"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchWithSession } from "@/lib/auth/fetchWithSession";
import {
  ChevronLeft,
  CircleCheckBig,
  MapPin,
  Award,
  Languages,
  Clock,
  Phone,
  Video,
  MessageCircle,
  X,
  Loader2,
} from "lucide-react";
import { LawyerDetail } from "@/types/lawyers";
import { formatNGN } from "@/lib/format";
import LawyerAvatar, { getAvailability } from "./LawyerAvatar";
import BookingModal from "./BookingModal";
import RatingModal from "./RatingModal";

interface LawyerDetailContentProps {
  lawyer: LawyerDetail;
  enquiryCategory?: string;
}

export default function LawyerDetailContent({ lawyer, enquiryCategory }: LawyerDetailContentProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [chatError, setChatError] = useState("");
  const router = useRouter();

  const availability = getAvailability(lawyer.availabilityStatus);

  async function startChat() {
    setChatLoading(true);
    setChatError("");
    try {
      const response = await fetchWithSession(`/api/lawyers/${encodeURIComponent(lawyer.id)}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: enquiryCategory }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setAuthModal(true);
        return;
      }
      if (!response.ok) throw new Error(body.message ?? "Could not start a chat");
      router.push(`/requests/${encodeURIComponent(body.requestId)}/chat`);
    } catch (cause) {
      setChatError(cause instanceof Error ? cause.message : "Could not start a chat");
    } finally { setChatLoading(false); }
  }

  const profileReturnTo = `/find-a-lawyer/${encodeURIComponent(lawyer.id)}${enquiryCategory ? `?${new URLSearchParams({ category: enquiryCategory })}` : ""}`;

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
  lawyer.location ? { icon: MapPin, text: lawyer.location } : null,
  { icon: Award, text: `Bar #${lawyer.barMembership}` },
  { icon: Languages, text: lawyer.languages.join(", ") },
  { icon: Clock, text: `Responds in ${lawyer.responseTimeEstimate}` },
].filter((row): row is { icon: typeof Award; text: string } => Boolean(row));

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
            onClick={() => void startChat()}
            disabled={chatLoading}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#1a1a1a] py-4 text-xs font-medium text-white transition-colors hover:bg-[#2a2a2a] disabled:opacity-60"
          >
            {chatLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            {chatLoading ? "Opening" : "Chat"}
          </button>
        </div>
        {chatError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{chatError}</p>}

        <button
          type="button"
          onClick={() => setIsBookingOpen(true)}
          className="h-[52px] w-full rounded-2xl border border-[#0a0a0a] bg-transparent text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white"
        >
          {enquiryCategory ? `Enquire about ${enquiryCategory}` : "Book a Consultation"}
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
        category={enquiryCategory}
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
      {authModal && <div role="dialog" aria-modal="true" aria-labelledby="chat-auth-title" className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"><div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><button type="button" aria-label="Close" onClick={() => setAuthModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button><h2 id="chat-auth-title" className="text-xl font-semibold">Sign in to chat</h2><p className="mt-2 text-sm text-gray-500">Create an account or sign in to start a secure conversation with {lawyer.name}.</p><div className="mt-6 grid grid-cols-2 gap-3"><Link href={`/login?returnTo=${encodeURIComponent(profileReturnTo)}`} className="flex h-11 items-center justify-center rounded-xl bg-[#111] text-sm font-medium text-white">Sign in</Link><Link href={`/register?returnTo=${encodeURIComponent(profileReturnTo)}`} className="flex h-11 items-center justify-center rounded-xl border border-black/10 text-sm font-medium">Sign up</Link></div></div></div>}
    </div>
  );
}
