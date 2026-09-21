import * as lawyerRepo from "./repository";
import type {
  LawyerListFilters,
  SubmitLawyerOnboardingInput,
} from "./types";

function notifyLawyer(user: {
  email: string | null;
  name: string;
}, message: string) {
  console.log(`[LAWYER NOTIFY] To ${user.email ?? user.name}: ${message}`);
}

export async function submitOnboarding(
  userId: string,
  input: SubmitLawyerOnboardingInput,
) {
  const existing = await lawyerRepo.findLawyerProfileByUserId(userId);

  if (existing) {
    return lawyerRepo.updateLawyerProfile(userId, input);
  }

  return lawyerRepo.createLawyerProfile(userId, input);
}

export async function getMyLawyerProfile(userId: string) {
  const profile = await lawyerRepo.findLawyerProfileByUserId(userId);
  if (!profile) {
    throw new Error("Lawyer profile not found");
  }
  return profile;
}

export async function listPendingLawyers(filters: LawyerListFilters) {
  return lawyerRepo.listLawyerProfiles(filters);
}

export async function approveLawyer(id: string, reviewerId: string) {
  const profile = await lawyerRepo.findLawyerProfileById(id);
  if (!profile) {
    throw new Error("Lawyer profile not found");
  }

  const updated = await lawyerRepo.approveLawyerProfile(id, reviewerId);

  notifyLawyer(updated.user, "Your lawyer onboarding has been approved.");
  return updated;
}

export async function rejectLawyer(
  id: string,
  reviewerId: string,
  reason: string,
) {
  const profile = await lawyerRepo.findLawyerProfileById(id);
  if (!profile) {
    throw new Error("Lawyer profile not found");
  }

  const updated = await lawyerRepo.rejectLawyerProfile(id, reviewerId, reason);

  notifyLawyer(
    updated.user,
    `Your lawyer onboarding has been rejected. Reason: ${reason}`,
  );
  return updated;
}