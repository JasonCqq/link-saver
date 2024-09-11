/*
  Warnings:

  - You are about to drop the column `remind` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "remind",
DROP COLUMN "updatedAt";
