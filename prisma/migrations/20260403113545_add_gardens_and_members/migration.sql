-- AlterTable
ALTER TABLE "Bed" ADD COLUMN     "gardenId" TEXT;

-- CreateTable
CREATE TABLE "Garden" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#84A98C',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenMember" (
    "id" TEXT NOT NULL,
    "gardenId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "inviteToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GardenMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Garden_userId_idx" ON "Garden"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GardenMember_inviteToken_key" ON "GardenMember"("inviteToken");

-- CreateIndex
CREATE INDEX "GardenMember_gardenId_idx" ON "GardenMember"("gardenId");

-- CreateIndex
CREATE INDEX "GardenMember_userId_idx" ON "GardenMember"("userId");

-- CreateIndex
CREATE INDEX "Bed_gardenId_idx" ON "Bed"("gardenId");

-- AddForeignKey
ALTER TABLE "GardenMember" ADD CONSTRAINT "GardenMember_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE SET NULL ON UPDATE CASCADE;
