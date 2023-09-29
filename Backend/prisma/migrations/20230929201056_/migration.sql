/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Folder_name_key";

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "trash" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "Folder_userId_key" ON "Folder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_userId_key" ON "Link"("userId");
