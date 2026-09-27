import { prisma } from "@/lib/prisma";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET() {
  const guard = await requireApiRole("admin");
  if (isErrorResponse(guard)) return guard;

  try {
    const [users, activeUsers, lawyerProfiles, approvedLawyers, pendingLawyers, rejectedLawyers, availableLawyers, requests, openRequests, completedRequests, emergencyRequests, unresolvedEmergencyRequests] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.lawyerProfile.count(),
      prisma.lawyerProfile.count({ where: { verificationStatus: "APPROVED", isMatchable: true } }),
      prisma.lawyerProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.lawyerProfile.count({ where: { verificationStatus: "REJECTED" } }),
      prisma.lawyerProfile.count({ where: { verificationStatus: "APPROVED", isMatchable: true, availabilityStatus: "AVAILABLE" } }),
      prisma.request.count(),
      prisma.request.count({ where: { status: "OPEN" } }),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.emergencyRequest.count(),
      prisma.emergencyRequest.count({ where: { status: { in: ["REQUESTED", "MATCHED", "ACCEPTED", "IN_PROGRESS"] } } }),
    ]);

    return jsonResponse({ users, activeUsers, lawyerProfiles, approvedLawyers, pendingLawyers, rejectedLawyers, availableLawyers, requests, openRequests, completedRequests, emergencyRequests, unresolvedEmergencyRequests, computedAt: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not load admin overview", 500);
  }
}
