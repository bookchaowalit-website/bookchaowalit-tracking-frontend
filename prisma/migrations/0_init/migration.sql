-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('ANIME', 'MANGA', 'MOVIE', 'TV_SHOW', 'BOOK', 'WEBSITE', 'PODCAST', 'GAME', 'OTHER');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED');

-- CreateEnum
CREATE TYPE "RatingScale" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "externalUrl" TEXT,
    "category" "ContentCategory" NOT NULL,
    "author" TEXT,
    "year" INTEGER,
    "genres" TEXT[],
    "totalEpisodes" INTEGER,
    "totalChapters" INTEGER,
    "totalBooks" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" "TrackingStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "rating" "RatingScale",
    "progress" INTEGER,
    "startDate" TIMESTAMP(3),
    "finishDate" TIMESTAMP(3),
    "priority" INTEGER,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "itemTitle" TEXT NOT NULL,
    "category" "ContentCategory" NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "TrackingItem_category_idx" ON "TrackingItem"("category");

-- CreateIndex
CREATE INDEX "TrackingItem_title_idx" ON "TrackingItem"("title");

-- CreateIndex
CREATE UNIQUE INDEX "title_category" ON "TrackingItem"("title", "category");

-- CreateIndex
CREATE INDEX "UserTracking_userId_idx" ON "UserTracking"("userId");

-- CreateIndex
CREATE INDEX "UserTracking_itemId_idx" ON "UserTracking"("itemId");

-- CreateIndex
CREATE INDEX "UserTracking_status_idx" ON "UserTracking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserTracking_userId_itemId_key" ON "UserTracking"("userId", "itemId");

-- CreateIndex
CREATE INDEX "TrackingNote_userId_idx" ON "TrackingNote"("userId");

-- CreateIndex
CREATE INDEX "TrackingNote_itemId_idx" ON "TrackingNote"("itemId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "UserTracking" ADD CONSTRAINT "UserTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTracking" ADD CONSTRAINT "UserTracking_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "TrackingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingNote" ADD CONSTRAINT "TrackingNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingNote" ADD CONSTRAINT "TrackingNote_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "TrackingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

