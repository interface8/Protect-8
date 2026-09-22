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
    if (!id) return;
    const controller = new AbortController();

    async function fetchLawyer() {
      try {
        const res = await fetch(`/api/lawyers/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError(res.status === 404 ? "Lawyer not found" : "Failed to load lawyer");
          return;
        }
        setLawyer(await res.json());
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("Failed to load lawyer");
        console.error(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchLawyer();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#c4922a]" />
          <p className="animate-pulse text-sm text-gray-500">Loading lawyer...</p>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 bg-[#f5f3f0]">
        <p className="text-red-500">{error || "Lawyer not found"}</p>
        <Link
          href="/find-a-lawyer"
          className="text-sm font-medium text-[#c4922a] hover:underline"
        >
          Back to Find a Lawyer
        </Link>
      </div>
    );
  }

  return <LawyerDetailContent lawyer={lawyer} />;
}