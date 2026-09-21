import * as requestRepo from "./repository";
import * as lawyerRepo from "@/modules/lawyers/repository";
import type {
  CreateRequestInput,
  RequestDto,
  RequestFilters,
  UpdateRequestInput,
} from "./types";

export async function listRequests(
  filters: RequestFilters = {},
  viewerId?: string,
) {
  return requestRepo.listRequests(filters, viewerId);
}

export async function getRequestById(id: string): Promise<RequestDto> {
  const request = await requestRepo.findRequestById(id);
  if (!request) {
    throw new Error("Request not found");
  }
  return request;
}

async function getEligibleLawyerProfile(lawyerProfileId: string) {
  const lawyerProfile = await lawyerRepo.findLawyerProfileById(
    lawyerProfileId,
  );

  const isEligible =
    lawyerProfile &&
    lawyerProfile.verificationStatus === "APPROVED" &&
    lawyerProfile.isMatchable &&
    lawyerProfile.user.role.name === "lawyer";

  if (!isEligible) {
    throw new Error("Lawyer is not eligible for assignment");
  }

  return lawyerProfile;
}

export async function createRequest(input: CreateRequestInput) {
  if (!input.lawyerProfileId) {
    return requestRepo.createRequest({
      citizenId: input.citizenId,
      category: input.category,
      title: input.title,
      description: input.description,
    });
  }

  const lawyerProfile = await getEligibleLawyerProfile(
    input.lawyerProfileId,
  );

  return requestRepo.createRequest({
    citizenId: input.citizenId,
    lawyerId: lawyerProfile.userId,
    category: input.category,
    title: input.title,
    description: input.description,
  });
}

export async function updateRequest(id: string, input: UpdateRequestInput) {
  const existing = await requestRepo.findRequestById(id);
  if (!existing) {
    throw new Error("Request not found");
  }

  return requestRepo.updateRequest(id, input);
}

export async function assignLawyer(
  id: string,
  lawyerProfileId: string,
) {
  const existing = await requestRepo.findRequestById(id);

  if (!existing) {
    throw new Error("Request not found");
  }

  if (existing.status !== "OPEN") {
    throw new Error("Only open requests can be assigned");
  }

  const lawyerProfile = await getEligibleLawyerProfile(lawyerProfileId);

  return requestRepo.assignLawyerToRequest(id, lawyerProfile.userId);
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