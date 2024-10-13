/*
  Warnings:

  - You are about to drop the column `created_at` on the `URL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "URL" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
