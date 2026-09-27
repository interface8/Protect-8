"use client";

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      credentials: "same-origin",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/** Retry an API request once after refreshing an expired access cookie. */
export async function fetchWithSession(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const requestInit: RequestInit = { ...init, credentials: "same-origin" };
  const response = await fetch(input, requestInit);
  if (response.status !== 401 || !(await refreshSession())) return response;
  return fetch(input, requestInit);
}
