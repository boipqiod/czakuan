/*
  Warnings:

  - Added the required column `reason` to the `ReportToComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `ReportToPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReportToComment" ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReportToPost" ADD COLUMN     "reason" TEXT NOT NULL;
