import * as reportRepo from "./repository";
import type { ReportSummaryDto } from "./types";
import { prisma } from "@/lib/prisma";

async function calculateSummary() {
  const [
    registeredLawyers,
    activeUsers,
    totalRequests,
    completedRequests,
    requestTimingRows,
    emergencyTotal,
    emergencyResolved,
    activeSubscriptions,
  ] = await Promise.all([
    prisma.lawyerProfile.count({
      where: {
        verificationStatus: "APPROVED",
        isMatchable: true,
      },
    }),
    prisma.user.count({
      where: {
        isActive: true,
      },
    }),
    prisma.request.count(),
    prisma.request.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.request.findMany({
      where: {
        status: {
          in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"],
        },
        assignedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        assignedAt: true,
      },
    }),
    prisma.emergencyRequest.count(),
    prisma.emergencyRequest.count({
      where: {
        status: {
          in: ["RESPONDED", "RESOLVED", "CLOSED"],
        },
      },
    }),
    prisma.subscription.aggregate({
      where: {
        status: "ACTIVE",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const averageLawyerResponseTime =
    requestTimingRows.length > 0
      ? requestTimingRows.reduce((total, row) => {
          if (!row.assignedAt) return total;
          return total + (row.assignedAt.getTime() - row.createdAt.getTime());
        }, 0) / requestTimingRows.length / 60000
      : 0;

  const emergencyResponseRate =
    emergencyTotal > 0 ? (emergencyResolved / emergencyTotal) * 100 : 0;

  const monthlyRecurringRevenue =
    activeSubscriptions._sum.amount?.toString() ?? "0";

  const caseCompletionRate =
    totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  return {
    registeredLawyers,
    activeUsers,
    averageLawyerResponseTime,
    emergencyResponseRate,
    monthlyRecurringRevenue,
    caseCompletionRate,
  };
}

export async function refreshReportSummary(): Promise<ReportSummaryDto> {
  const summary = await calculateSummary();

  return reportRepo.upsertReportSummary(summary);
}

export async function getReportSummary(): Promise<ReportSummaryDto | null> {
  return reportRepo.getLatestReportSummary();
}