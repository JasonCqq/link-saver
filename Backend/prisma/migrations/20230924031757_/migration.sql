/*
  Warnings:

  - You are about to drop the column `Title` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `URL` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `favoritedById` on the `Link` table. All the data in the column will be lost.
  - Added the required column `bookmarked` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remind` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_favoritedById_fkey";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "Title",
DROP COLUMN "URL",
DROP COLUMN "favoritedById",
ADD COLUMN     "bookmarked" BOOLEAN NOT NULL,
ADD COLUMN     "remind" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
