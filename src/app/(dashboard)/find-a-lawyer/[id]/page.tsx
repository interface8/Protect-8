"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import LawyerDetailContent from "@/components/dashboard/lawyers/LawyerDetailContent";
import { LawyerDetail } from "@/types/lawyers";

export default function LawyerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [lawyer, setLawyer] = useState<LawyerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLawyer() {
      try {
        const res = await fetch(`/api/lawyers/${id}`);
        if (!res.ok) throw new Error("Lawyer not found");
        const data = await res.json();
        setLawyer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lawyer");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchLawyer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-[#c4922a] animate-spin" />
          <p className="text-sm text-[#554116]/60 animate-pulse">Loading lawyer...</p>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="w-full bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Lawyer not found"}</p>
          <Link
            href="/find-a-lawyer"
            className="text-[#c4922a] hover:underline text-sm mt-4 inline-block"
          >
            ← Back to Find a Lawyer
          </Link>
        </div>
      </div>
    );
  }

  return <LawyerDetailContent lawyer={lawyer} />;
}