-- CreateEnum
CREATE TYPE "RatingRaterType" AS ENUM ('CITIZEN', 'LAWYER');

-- CreateEnum
CREATE TYPE "AssistantConversationStatus" AS ENUM ('ACTIVE', 'ESCALATED', 'CLOSED');

-- AlterTable
ALTER TABLE "lawyer_profiles" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rights_guides" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rights_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_ratings" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "raterUserId" TEXT NOT NULL,
    "raterType" "RatingRaterType" NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT,
    "status" "AssistantConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistant_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assistant_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "disclosure" TEXT,
    "isEscalation" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistant_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rights_guides_slug_key" ON "rights_guides"("slug");

-- CreateIndex
CREATE INDEX "rights_guides_isActive_idx" ON "rights_guides"("isActive");

-- CreateIndex
CREATE INDEX "rights_guides_order_idx" ON "rights_guides"("order");

-- CreateIndex
CREATE INDEX "request_ratings_requestId_idx" ON "request_ratings"("requestId");

-- CreateIndex
CREATE INDEX "request_ratings_targetUserId_idx" ON "request_ratings"("targetUserId");

-- CreateIndex
CREATE INDEX "request_ratings_raterUserId_idx" ON "request_ratings"("raterUserId");

-- CreateIndex
CREATE UNIQUE INDEX "request_ratings_requestId_raterUserId_raterType_key" ON "request_ratings"("requestId", "raterUserId", "raterType");

-- CreateIndex
CREATE INDEX "assistant_conversations_userId_idx" ON "assistant_conversations"("userId");

-- CreateIndex
CREATE INDEX "assistant_conversations_status_idx" ON "assistant_conversations"("status");

-- CreateIndex
CREATE INDEX "assistant_messages_conversationId_idx" ON "assistant_messages"("conversationId");

-- CreateIndex
CREATE INDEX "assistant_messages_role_idx" ON "assistant_messages"("role");

-- AddForeignKey
ALTER TABLE "assistant_conversations" ADD CONSTRAINT "assistant_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_messages" ADD CONSTRAINT "assistant_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "assistant_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
