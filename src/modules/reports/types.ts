export interface ReportSummaryDto {
  id: string;
  summaryKey: string;
  registeredLawyers: number;
  activeUsers: number;
  averageLawyerResponseTime: number;
  emergencyResponseRate: number;
  monthlyRecurringRevenue: string;
  caseCompletionRate: number;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}