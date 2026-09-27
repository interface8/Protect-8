"use client";

import { useEffect, useState } from "react";

export interface EmergencyCategoryOption {
  id: string;
  key: string;
  label: string;
  iconKey: string;
}

export function useEmergencyCategories() {
  const [categories, setCategories] = useState<EmergencyCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/emergency-categories", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data) => setCategories(data.data ?? []))
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load emergency categories", err);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { categories, loading, error };
}