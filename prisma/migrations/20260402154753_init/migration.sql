-- CreateTable
CREATE TABLE "Bed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "widthFt" INTEGER NOT NULL,
    "lengthFt" INTEGER NOT NULL,
    "sunExposure" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "cells" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bed_userId_idx" ON "Bed"("userId");
