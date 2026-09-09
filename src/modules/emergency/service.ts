import type { EmergencyRequestStatus } from "@prisma/client";
import type {
  CreateEmergencyCategoryInput,
  UpdateEmergencyCategoryInput,
} from "./types";
import * as repository from "./repository";
import { triggerEmergencyMatching } from "./matching";

const transitions: Record<
  EmergencyRequestStatus,
  EmergencyRequestStatus[]
> = {
  REQUESTED: ["MATCHED", "CANCELLED"],
  MATCHED: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  REJECTED: ["REQUESTED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function listActiveCategories() {
  return repository.listActiveCategories();
}

export async function createCategory(
  input: CreateEmergencyCategoryInput,
) {
  return repository.createCategory(input);
}

export async function updateCategory(
  id: string,
  input: UpdateEmergencyCategoryInput,
) {
  const existing = await repository.findCategoryById(id);

  if (!existing) {
    throw new Error("Emergency category not found");
  }

  return repository.updateCategory(id, input);
}

export async function createEmergencyRequest(
  userId: string,
  input: {
    categoryId: string;
    message?: string | null;
    location?: string | null;
    preferredLanguage?: string | null;
    locationConsent?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    triggerSource?: "NEED_LAWYER_NOW" | "SOS";
    sosTriggeredAt?: Date | null;
  },
) {
  const request = await repository.createRequest(
    userId,
    input,
  );

  await triggerEmergencyMatching(request.id);
  return (await repository.findRequestById(request.id)) ?? request;
}

export async function transitionEmergencyRequest(
  requestId: string,
  actor: { id: string; role: string },
  nextStatus: EmergencyRequestStatus,
) {
  const request = await repository.findRequestForActor(requestId);

  if (!request) {
    throw new Error("Emergency request not found");
  }

  const isAdmin = actor.role === "admin";
  const isCitizenOwner = actor.id === request.userId;
  const isAssignedLawyer =
    actor.role === "lawyer" && actor.id === request.assignedToId;

  if (!isAdmin && !isCitizenOwner && !isAssignedLawyer) {
    throw new Error("You are not allowed to update this request");
  }

  if (
    actor.role === "citizen" &&
    (!isCitizenOwner || nextStatus !== "CANCELLED")
  ) {
    throw new Error("Citizens can only cancel their own requests");
  }

  if (
    actor.role === "lawyer" &&
    (!isAssignedLawyer ||
      !["ACCEPTED", "REJECTED", "IN_PROGRESS", "COMPLETED"].includes(
        nextStatus,
      ))
  ) {
    throw new Error("Lawyers cannot perform this transition");
  }

  if (!transitions[request.status].includes(nextStatus)) {
    throw new Error(
      `Invalid status transition from ${request.status} to ${nextStatus}`,
    );
  }

  return repository.transitionRequestStatus(
    requestId,
    request.status,
    nextStatus,
    actor.id,
  );
}

export async function getRequestForActor(
  requestId: string,
  actor: { id: string; role: string },
) {
  const request = await repository.findRequestForActor(requestId);

  if (!request) {
    throw new Error("Emergency request not found");
  }

  if (
    actor.role !== "admin" &&
    actor.id !== request.userId &&
    actor.id !== request.assignedToId
  ) {
    throw new Error("You are not allowed to view this request");
  }

  return request;
}

export async function getRequestHistory(
  requestId: string,
  actor: { id: string; role: string },
) {
  await getRequestForActor(requestId, actor);
  return repository.listRequestHistory(requestId);
}
