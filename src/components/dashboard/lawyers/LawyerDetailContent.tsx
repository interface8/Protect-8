"use client";

import Link from "next/link";
import { ArrowLeft, Star, CheckCircle, Phone, Video, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LawyerDetail } from "@/types/lawyers";

interface LawyerDetailContentProps {
  lawyer: LawyerDetail;
}

export default function LawyerDetailContent({ lawyer }: LawyerDetailContentProps) {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(lawyer.price);

  return (
    <div className="w-full bg-[#f3f4f6] min-h-screen">
      <div className="w-full px-4 md:px-6 xl:w-[55%] xl:mx-auto py-8">
        {/* Back link */}
        <Link
          href="/find-a-lawyer"
          className="inline-flex items-center gap-1 text-sm text-[#554116]/60 hover:text-[#554116] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Find a Lawyer</span>
        </Link>

        {/* Main Profile Card */}
        <Card className="p-6 md:p-8 bg-white shadow-lg rounded-2xl">
          {/* Top Section: Name + Specialty + Availability */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#554116]">
                {lawyer.name}
              </h1>
              <p className="text-base text-[#c4922a] font-medium">{lawyer.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Available now</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[#c4922a] text-[#c4922a]" />
                <span className="text-lg font-bold text-[#0a0a0a]/80">{lawyer.rating}</span>
                <span className="text-sm text-[#0a0a0a]/50">({lawyer.reviews} reviews)</span>
              </div>
              <p className="text-sm text-[#0a0a0a]/60">{lawyer.experience}yr · {formattedPrice} per session</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[#554116]/10 mb-4">
            <div>
              <p className="text-xs text-[#0a0a0a]/40">Location</p>
              <p className="text-sm font-medium text-[#0a0a0a]/80">{lawyer.location}</p>
            </div>
            <div>
              <p className="text-xs text-[#0a0a0a]/40">Bar Number</p>
              <p className="text-sm font-medium text-[#0a0a0a]/80">{lawyer.barNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#0a0a0a]/40">Languages</p>
              <p className="text-sm font-medium text-[#0a0a0a]/80">{lawyer.languages.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs text-[#0a0a0a]/40">Response Time</p>
              <p className="text-sm font-medium text-[#0a0a0a]/80">Responds in {lawyer.responseTime}</p>
            </div>
          </div>

          {/* About */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#554116] mb-1">About</h3>
            <p className="text-sm text-[#0a0a0a]/70">{lawyer.about}</p>
          </div>

          {/* Practice Areas */}
          <div>
            <h3 className="text-sm font-semibold text-[#554116] mb-2">Practice Areas</h3>
            <div className="flex flex-wrap gap-2">
              {lawyer.practiceAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-[#efe2c7]/50 rounded-full text-xs font-medium text-[#554116]"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons - All Black */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            Voice Call
          </Button>
          <Button className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Video className="w-4 h-4" />
            Video Call
          </Button>
          <Button className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat
          </Button>
          <Button className="bg-[#0a0a0a] hover:bg-[#2a2a2a] text-white h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Book a Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}