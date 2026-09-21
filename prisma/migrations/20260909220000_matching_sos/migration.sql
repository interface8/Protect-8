CREATE TYPE "EmergencyRequestTriggerSource" AS ENUM ('NEED_LAWYER_NOW', 'SOS');

CREATE TYPE "EmergencyHistoryActorType" AS ENUM ('USER', 'SYSTEM');

CREATE TYPE "EmergencyActionType" AS ENUM (
  'MATCHING',
  'LAWYER_NOTIFICATION',
  'GPS_CAPTURE',
  'EMERGENCY_DETAILS_PACKAGED',
  'CONTACT_NOTIFICATION',
  'LOCATION_CONSENT'
);

CREATE TYPE "EmergencyActionStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'SKIPPED');

ALTER TABLE "lawyer_profiles"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "locationUpdatedAt" TIMESTAMP(3);

ALTER TABLE "emergency_requests"
  ADD COLUMN "triggerSource" "EmergencyRequestTriggerSource" NOT NULL DEFAULT 'NEED_LAWYER_NOW',
  ADD COLUMN "preferredLanguage" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "locationConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sosTriggeredAt" TIMESTAMP(3);

ALTER TABLE "emergency_request_status_history"
  DROP CONSTRAINT "emergency_request_status_history_actorId_fkey";

ALTER TABLE "emergency_request_status_history"
  ALTER COLUMN "actorId" DROP NOT NULL,
  ADD COLUMN "actorType" "EmergencyHistoryActorType" NOT NULL DEFAULT 'USER';

ALTER TABLE "emergency_request_status_history"
  ADD CONSTRAINT "emergency_request_status_history_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "emergency_action_logs" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actionType" "EmergencyActionType" NOT NULL,
  "status" "EmergencyActionStatus" NOT NULL,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_action_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "emergency_action_logs_requestId_createdAt_idx"
  ON "emergency_action_logs"("requestId", "createdAt");

CREATE INDEX "emergency_action_logs_actionType_idx"
  ON "emergency_action_logs"("actionType");

ALTER TABLE "emergency_action_logs"
  ADD CONSTRAINT "emergency_action_logs_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "emergency_requests"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
