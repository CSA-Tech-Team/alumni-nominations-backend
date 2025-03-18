/*
  Warnings:

  - Added the required column `rollNo` to the `Nominee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rollNo` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nominee" ADD COLUMN     "rollNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "rollNo" TEXT NOT NULL;
