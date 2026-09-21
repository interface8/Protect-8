import { prisma } from "@/lib/prisma";
import { userService } from "@/modules/users";
import { createActionLog } from "./repository";
import { createEmergencyRequest } from "./service";

interface SosInput {
  categoryId: string;
  message?: string | null;
  location?: string | null;
  preferredLanguage?: string | null;
  locationConsent: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

async function notifyMatchedLawyer(requestId: string) {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id: requestId },
    select: { assignedToId: true },
  });

  if (!request?.assignedToId) {
    throw new Error("No matched lawyer is available to notify");
  }

  console.log(
    `[SOS] Notify lawyer ${request.assignedToId} for request ${requestId}`,
  );
}

async function captureGpsSnapshot(input: SosInput) {
  if (!input.locationConsent) return "skipped";
  if (input.latitude == null || input.longitude == null) {
    throw new Error("GPS coordinates were not provided");
  }

  return "captured";
}

async function packageEmergencyDetails(
  requestId: string,
  input: SosInput,
) {
  return {
    requestId,
    categoryId: input.categoryId,
    message: input.message ?? null,
    location: input.location ?? null,
  };
}

async function notifySavedContacts(userId: string, requestId: string) {
  const contacts = await userService.getEmergencyContactsForUser(userId);

  console.log(
    `[SOS] Notify ${contacts.length} saved contacts for request ${requestId}`,
  );

  return contacts.length;
}

async function runAction(
  requestId: string,
  actionType:
    | "LAWYER_NOTIFICATION"
    | "GPS_CAPTURE"
    | "EMERGENCY_DETAILS_PACKAGED"
    | "CONTACT_NOTIFICATION",
  action: () => Promise<unknown>,
) {
  try {
    const result = await action();

    await createActionLog({
      requestId,
      actionType,
      status: result === "skipped" ? "SKIPPED" : "SUCCEEDED",
      metadata:
        result === "skipped"
          ? { reason: "No location consent" }
          : undefined,
    });

    return {
      actionType,
      status: result === "skipped" ? ("SKIPPED" as const) : ("SUCCEEDED" as const),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";

    await createActionLog({
      requestId,
      actionType,
      status: "FAILED",
      errorMessage: message,
    });

    return { actionType, status: "FAILED" as const, error: message };
  }
}

export async function triggerSos(userId: string, input: SosInput) {
  const request = await createEmergencyRequest(userId, {
    ...input,
    triggerSource: "SOS",
    sosTriggeredAt: new Date(),
  });

  await createActionLog({
    requestId: request.id,
    actionType: "LOCATION_CONSENT",
    status: input.locationConsent ? "SUCCEEDED" : "SKIPPED",
    metadata: { consentGiven: input.locationConsent },
  });

  const actions = await Promise.all([
    runAction(request.id, "LAWYER_NOTIFICATION", () =>
      notifyMatchedLawyer(request.id),
    ),
    runAction(request.id, "GPS_CAPTURE", () =>
      captureGpsSnapshot(input),
    ),
    runAction(request.id, "EMERGENCY_DETAILS_PACKAGED", () =>
      packageEmergencyDetails(request.id, input),
    ),
    runAction(request.id, "CONTACT_NOTIFICATION", () =>
      notifySavedContacts(userId, request.id),
    ),
  ]);

  return {
    request,
    actions,
  };
}
