-- CreateEnum
CREATE TYPE "LawyerAvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- AlterTable
ALTER TABLE "lawyer_profiles" ADD COLUMN     "availabilityStatus" "LawyerAvailabilityStatus" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "availabilityUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "consultationFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "responseTimeSeconds" INTEGER NOT NULL DEFAULT 120;

-- CreateIndex
CREATE INDEX "lawyer_profiles_availabilityStatus_idx" ON "lawyer_profiles"("availabilityStatus");

-- CreateIndex
CREATE INDEX "lawyer_profiles_lastActivityAt_idx" ON "lawyer_profiles"("lastActivityAt");
