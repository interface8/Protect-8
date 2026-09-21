-- CreateTable
CREATE TABLE "mfa_rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mfa_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mfa_rate_limits_key_key" ON "mfa_rate_limits"("key");

-- CreateIndex
CREATE INDEX "mfa_rate_limits_action_idx" ON "mfa_rate_limits"("action");

-- CreateIndex
CREATE INDEX "mfa_rate_limits_expiresAt_idx" ON "mfa_rate_limits"("expiresAt");
