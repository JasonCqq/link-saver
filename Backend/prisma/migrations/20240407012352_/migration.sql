/*
  Warnings:

  - You are about to drop the column `otpCreatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `otpExpiresAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpCreatedAt",
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3) NOT NULL;
