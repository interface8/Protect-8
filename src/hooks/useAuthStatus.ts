"use client";

import { useEffect, useState } from "react";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/users/me", { signal: controller.signal })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => {
        if (!controller.signal.aborted) setIsAuthenticated(false);
      });

    return () => controller.abort();
  }, []);

  // null = still checking, avoids a flash of "must sign in" before we know
  return { isAuthenticated };
}