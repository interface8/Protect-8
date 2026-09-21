"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  name: string;
}

let cache: CurrentUser | null = null;
let inflight: Promise<CurrentUser | null> | null = null;

// Call this on logout so the next user does not see the previous name
export function clearCurrentUser() {
  cache = null;
  inflight = null;
}

function loadUser(): Promise<CurrentUser | null> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        cache = data?.name ? { name: data.name } : null;
        return cache;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    loadUser().then((u) => {
      if (active) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}