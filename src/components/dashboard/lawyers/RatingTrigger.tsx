"use client";

import { useState, useEffect, useRef } from "react";
import RatingModal from "./RatingModal";

interface PendingRating {
  requestId: string;
  lawyerId: string;
  lawyerName: string;
}

interface RequestItem {
  id: string;
  status: string;
  lawyer: {
    id: string;
    name: string;
  } | null;
}

const POLL_INTERVAL_MS = 15000;
const STORAGE_KEY = "protect8_shown_ratings";

export default function RatingTrigger() {
  const [pending, setPending] = useState<PendingRating | null>(null);
  const shownRequestIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          shownRequestIds.current = new Set(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load shown rating IDs", err);
    }
  }, []);

  function persistShownIds() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(shownRequestIds.current))
      );
    } catch (err) {
      console.error("Failed to save shown rating IDs", err);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function checkForPendingRatings() {
      try {
        const res = await fetch("/api/requests");
        if (!res.ok) return;

        const data = await res.json();
        const requests: RequestItem[] = data.data ?? [];

        const completedRequest = requests.find(
          (req) =>
            req.status === "COMPLETED" &&
            !shownRequestIds.current.has(req.id) &&
            req.lawyer
        );

        if (completedRequest && completedRequest.lawyer && isMounted) {
          setPending({
            requestId: completedRequest.id,
            lawyerId: completedRequest.lawyer.id,
            lawyerName: completedRequest.lawyer.name,
          });
        }
      } catch (err) {
        console.error("Failed to check for pending ratings", err);
      }
    }

    checkForPendingRatings();

    const interval = setInterval(checkForPendingRatings, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkForPendingRatings();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);


  function handleRated() {
    if (pending) {
      shownRequestIds.current.add(pending.requestId);
      persistShownIds();
    }
    setPending(null);
  }

 
  function handleClose() {
    setPending(null);
  }

  if (!pending) return null;

  return (
    <RatingModal
      isOpen={true}
      onClose={handleClose}
      onRated={handleRated}
      lawyerName={pending.lawyerName}
      lawyerId={pending.lawyerId}
      requestId={pending.requestId}
    />
  );
}