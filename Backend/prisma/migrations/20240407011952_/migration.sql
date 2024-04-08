/*
  Warnings:

  - You are about to drop the `OTP` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `otp` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpCreatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" INTEGER NOT NULL,
ADD COLUMN     "otpCreatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "OTP";
