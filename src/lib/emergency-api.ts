import { EmergencyRequestDto } from "@/types/emergency";

const CREATE_REQUEST_URL = "/api/emergency-requests";

export interface CreateEmergencyRequestPayload {
  categoryId: string;
  message?: string;
  location?: string;
  preferredLanguage?: string;
  locationConsent?: boolean;
  latitude?: number;
  longitude?: number;
}

export async function submitEmergencyRequest(
  payload: CreateEmergencyRequestPayload
): Promise<EmergencyRequestDto> {
  const res = await fetch(CREATE_REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to submit emergency request");
  }

  return res.json();
}

export async function updateEmergencyRequestStatus(
  requestId: string,
  status: "CANCELLED"
): Promise<EmergencyRequestDto> {
  const res = await fetch(
    `/api/emergency-requests/${encodeURIComponent(requestId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update request");
  }

  return res.json();
}