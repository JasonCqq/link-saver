/*
  Warnings:

  - A unique constraint covering the columns `[folderId]` on the table `Share` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Share_folderId_key" ON "Share"("folderId");
