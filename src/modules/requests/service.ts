import * as requestRepo from "./repository";
import * as lawyerRepo from "@/modules/lawyers/repository";
import type {
  CreateRequestInput,
  RequestDto,
  RequestFilters,
  UpdateRequestInput,
} from "./types";

export async function listRequests(filters: RequestFilters = {}) {
  return requestRepo.listRequests(filters);
}

export async function getRequestById(id: string): Promise<RequestDto> {
  const request = await requestRepo.findRequestById(id);
  if (!request) {
    throw new Error("Request not found");
  }
  return request;
}

export async function createRequest(input: CreateRequestInput) {
  if (input.lawyerId) {
    const lawyerProfile = await lawyerRepo.findLawyerProfileByUserId(
      input.lawyerId,
    );

    if (!lawyerProfile || !lawyerProfile.isMatchable) {
      throw new Error("Lawyer is not eligible for assignment");
    }
  }

  return requestRepo.createRequest(input);
}

export async function updateRequest(id: string, input: UpdateRequestInput) {
  const existing = await requestRepo.findRequestById(id);
  if (!existing) {
    throw new Error("Request not found");
  }

  return requestRepo.updateRequest(id, input);
}

export async function assignLawyer(id: string, lawyerId: string) {
  const existing = await requestRepo.findRequestById(id);
  if (!existing) {
    throw new Error("Request not found");
  }

  if (existing.status !== "OPEN") {
    throw new Error("Only open requests can be assigned");
  }

  return requestRepo.assignLawyerToRequest(id, lawyerId);
}

export async function startRequest(id: string) {
  const existing = await requestRepo.findRequestById(id);
  if (!existing) {
    throw new Error("Request not found");
  }

  if (existing.status !== "ASSIGNED") {
    throw new Error("Only assigned requests can start");
  }

  return requestRepo.startRequest(id);
}

export async function completeRequest(id: string) {
  const existing = await requestRepo.findRequestById(id);
  if (!existing) {
    throw new Error("Request not found");
  }

  if (existing.status !== "IN_PROGRESS" && existing.status !== "ASSIGNED") {
    throw new Error("Only active requests can be completed");
  }

  return requestRepo.completeRequest(id);
}

export async function cancelRequest(id: string) {
  const existing = await requestRepo.findRequestById(id);
  if (!existing) {
    throw new Error("Request not found");
  }

  if (existing.status === "COMPLETED") {
    throw new Error("Completed requests cannot be cancelled");
  }

  return requestRepo.cancelRequest(id);
}