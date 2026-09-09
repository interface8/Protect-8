CREATE TYPE "EmergencyRequestStatus_new" AS ENUM (
  'REQUESTED',
  'MATCHED',
  'ACCEPTED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "emergency_categories" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "iconKey" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "emergency_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "emergency_categories_key_key"
  ON "emergency_categories"("key");

CREATE INDEX "emergency_categories_isActive_idx"
  ON "emergency_categories"("isActive");

CREATE INDEX "emergency_categories_sortOrder_idx"
  ON "emergency_categories"("sortOrder");

ALTER TABLE "emergency_requests"
  ADD COLUMN "categoryId" TEXT,
  ADD COLUMN "location" TEXT;

ALTER TABLE "emergency_requests"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "emergency_requests"
  ALTER COLUMN "status" TYPE "EmergencyRequestStatus_new"
  USING (
    CASE "status"::text
      WHEN 'OPEN' THEN 'REQUESTED'
      WHEN 'RESPONDED' THEN 'MATCHED'
      WHEN 'RESOLVED' THEN 'COMPLETED'
      WHEN 'CLOSED' THEN 'CANCELLED'
      ELSE 'REQUESTED'
    END
  )::"EmergencyRequestStatus_new";

DROP TYPE "EmergencyRequestStatus";

ALTER TYPE "EmergencyRequestStatus_new"
  RENAME TO "EmergencyRequestStatus";

ALTER TABLE "emergency_requests"
  ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

INSERT INTO "emergency_categories"
  ("id", "key", "label", "iconKey", "isActive", "sortOrder", "updatedAt")
VALUES
  ('traffic-stop', 'traffic-stop', 'Traffic Stop', 'traffic-stop', true, 1, CURRENT_TIMESTAMP),
  ('police-arrest', 'police-arrest', 'Police Arrest', 'police-arrest', true, 2, CURRENT_TIMESTAMP),
  ('efcc-issue', 'efcc-issue', 'EFCC Issue', 'efcc', true, 3, CURRENT_TIMESTAMP),
  ('land-dispute', 'land-dispute', 'Land Dispute', 'land-dispute', true, 4, CURRENT_TIMESTAMP),
  ('domestic-violence', 'domestic-violence', 'Domestic Violence', 'domestic-violence', true, 5, CURRENT_TIMESTAMP),
  ('security-agency', 'security-agency', 'Security Agency', 'security-agency', true, 6, CURRENT_TIMESTAMP),
  ('employment-matter', 'employment-matter', 'Employment Matter', 'employment', true, 7, CURRENT_TIMESTAMP),
  ('fraud', 'fraud', 'Fraud', 'fraud', true, 8, CURRENT_TIMESTAMP),
  ('cybercrime', 'cybercrime', 'Cybercrime', 'cybercrime', true, 9, CURRENT_TIMESTAMP),
  ('immigration', 'immigration', 'Immigration', 'immigration', true, 10, CURRENT_TIMESTAMP),
  ('other', 'other', 'Other', 'other', true, 11, CURRENT_TIMESTAMP);

UPDATE "emergency_requests"
SET "categoryId" = CASE
  WHEN LOWER("category") LIKE '%traffic%' THEN 'traffic-stop'
  WHEN LOWER("category") LIKE '%police%'
    OR LOWER("category") LIKE '%arrest%'
    OR LOWER("category") LIKE '%harassment%' THEN 'police-arrest'
  WHEN LOWER("category") LIKE '%efcc%' THEN 'efcc-issue'
  WHEN LOWER("category") LIKE '%land%'
    OR LOWER("category") LIKE '%property%' THEN 'land-dispute'
  WHEN LOWER("category") LIKE '%domestic%'
    OR LOWER("category") LIKE '%violence%' THEN 'domestic-violence'
  WHEN LOWER("category") LIKE '%security%' THEN 'security-agency'
  WHEN LOWER("category") LIKE '%employment%'
    OR LOWER("category") LIKE '%work%' THEN 'employment-matter'
  WHEN LOWER("category") LIKE '%fraud%' THEN 'fraud'
  WHEN LOWER("category") LIKE '%cyber%' THEN 'cybercrime'
  WHEN LOWER("category") LIKE '%immigration%' THEN 'immigration'
  ELSE 'other'
END
WHERE "categoryId" IS NULL;

CREATE INDEX "emergency_requests_categoryId_idx"
  ON "emergency_requests"("categoryId");

ALTER TABLE "emergency_requests"
  ADD CONSTRAINT "emergency_requests_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "emergency_categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "emergency_request_status_history" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "fromStatus" "EmergencyRequestStatus",
  "toStatus" "EmergencyRequestStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_request_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "emergency_request_status_history_requestId_createdAt_idx"
  ON "emergency_request_status_history"("requestId", "createdAt");

CREATE INDEX "emergency_request_status_history_actorId_idx"
  ON "emergency_request_status_history"("actorId");

ALTER TABLE "emergency_request_status_history"
  ADD CONSTRAINT "emergency_request_status_history_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "emergency_requests"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "emergency_request_status_history"
  ADD CONSTRAINT "emergency_request_status_history_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "emergency_request_status_history"
  ("id", "requestId", "fromStatus", "toStatus", "actorId")
SELECT
  'initial-' || er."id",
  er."id",
  NULL,
  er."status",
  er."userId"
FROM "emergency_requests" er;
