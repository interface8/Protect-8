"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Guide } from "@/types/rights";
import { iconMap } from "@/lib/icon-map";

const DISCLOSURE =
  "This is general legal information, not legal advice. Always comply with lawful instructions while protecting your rights.";

interface RightsDetailContentProps {
  guide: Guide;
}

export default function RightsDetailContent({ guide }: RightsDetailContentProps) {
  const router = useRouter();
  const Icon = iconMap[guide.iconKey];

  return (
    <div className="w-full bg-[#f3f4f6] min-h-screen">
      <div className="w-full px-4 md:w-[55%] md:mx-auto py-8">
        {/* Back link */}
        <Link
          href="/know-your-rights"
          className="inline-flex items-center gap-1 text-sm text-[#554116]/60 hover:text-[#554116] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Know Your Rights</span>
        </Link>

        {/* Disclosure Block */}
        <div className="bg-[#c4922a]/10 border border-[#c4922a]/30 rounded-lg p-4 mb-6">
          <p className="text-xs text-[#554116]/80 text-center">
            ⚠️ {DISCLOSURE}
          </p>
        </div>

        {/* Main Content */}
        <Card className="p-6 md:p-8 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#efe2c7] rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#554116]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#554116]">
                {guide.title}
              </h1>
              <p className="text-sm text-[#0a0a0a]/60">
                {guide.shortDescription}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[#0a0a0a]/80 whitespace-pre-wrap">
            {guide.body}
          </div>

          <div className="mt-8 pt-6 border-t border-[#554116]/10">
            <p className="text-xs text-[#554116]/60 text-center">
              ⚠️ {DISCLOSURE}
            </p>
          </div>
        </Card>

        {/* Connect to a Lawyer Now Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push("/emergency")}
            className="bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 px-8 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#c4922a]/25"
          >
            Connect to a Lawyer Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}