CREATE TABLE "request_messages" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "request_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "request_messages_requestId_createdAt_idx" ON "request_messages"("requestId", "createdAt");
CREATE INDEX "request_messages_senderId_idx" ON "request_messages"("senderId");

ALTER TABLE "request_messages" ADD CONSTRAINT "request_messages_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "request_messages" ADD CONSTRAINT "request_messages_senderId_fkey"
FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
