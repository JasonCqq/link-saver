/*
  Warnings:

  - You are about to drop the column `emailNotifications` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "emailNotifications";

-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "folderId" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
