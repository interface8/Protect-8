import { prisma } from "@/lib/prisma";
import type { ReportSummaryDto } from "./types";

type ReportSummaryRecord = {
  id: string;
  summaryKey: string;
  registeredLawyers: number;
  activeUsers: number;
  averageLawyerResponseTime: number;
  emergencyResponseRate: number;
  monthlyRecurringRevenue: {
    toString(): string;
  };
  caseCompletionRate: number;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function toReportSummaryDto(summary: ReportSummaryRecord): ReportSummaryDto {
  return {
    id: summary.id,
    summaryKey: summary.summaryKey,
    registeredLawyers: summary.registeredLawyers,
    activeUsers: summary.activeUsers,
    averageLawyerResponseTime: summary.averageLawyerResponseTime,
    emergencyResponseRate: summary.emergencyResponseRate,
    monthlyRecurringRevenue: summary.monthlyRecurringRevenue.toString(),
    caseCompletionRate: summary.caseCompletionRate,
    computedAt: summary.computedAt,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
  };
}

export async function getLatestReportSummary(): Promise<ReportSummaryDto | null> {
  const summary = await prisma.reportSummary.findUnique({
    where: { summaryKey: "platform_summary" },
  });

  return summary ? toReportSummaryDto(summary as ReportSummaryRecord) : null;
}

export async function upsertReportSummary(input: {
  registeredLawyers: number;
  activeUsers: number;
  averageLawyerResponseTime: number;
  emergencyResponseRate: number;
  monthlyRecurringRevenue: string | number;
  caseCompletionRate: number;
}): Promise<ReportSummaryDto> {
  const summary = await prisma.reportSummary.upsert({
    where: { summaryKey: "platform_summary" },
    create: {
      summaryKey: "platform_summary",
      registeredLawyers: input.registeredLawyers,
      activeUsers: input.activeUsers,
      averageLawyerResponseTime: input.averageLawyerResponseTime,
      emergencyResponseRate: input.emergencyResponseRate,
      monthlyRecurringRevenue: input.monthlyRecurringRevenue.toString(),
      caseCompletionRate: input.caseCompletionRate,
      computedAt: new Date(),
    },
    update: {
      registeredLawyers: input.registeredLawyers,
      activeUsers: input.activeUsers,
      averageLawyerResponseTime: input.averageLawyerResponseTime,
      emergencyResponseRate: input.emergencyResponseRate,
      monthlyRecurringRevenue: input.monthlyRecurringRevenue.toString(),
      caseCompletionRate: input.caseCompletionRate,
      computedAt: new Date(),
    },
  });

  return toReportSummaryDto(summary as ReportSummaryRecord);
}