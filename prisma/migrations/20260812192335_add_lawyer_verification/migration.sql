-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "lawyer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barEnrollmentNumber" TEXT NOT NULL,
    "practiceLicenseUrl" TEXT NOT NULL,
    "idDocumentUrl" TEXT NOT NULL,
    "practiceAreas" TEXT[],
    "languages" TEXT[],
    "yearsOfExperience" INTEGER NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "isMatchable" BOOLEAN NOT NULL DEFAULT false,
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_profiles_userId_key" ON "lawyer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_profiles_barEnrollmentNumber_key" ON "lawyer_profiles"("barEnrollmentNumber");

-- CreateIndex
CREATE INDEX "lawyer_profiles_verificationStatus_idx" ON "lawyer_profiles"("verificationStatus");

-- CreateIndex
CREATE INDEX "lawyer_profiles_isMatchable_idx" ON "lawyer_profiles"("isMatchable");

-- AddForeignKey
ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
