/*
  Warnings:

  - Added the required column `nominatedYear` to the `Nomination` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nomination" ADD COLUMN     "nominatedYear" INTEGER NOT NULL;
