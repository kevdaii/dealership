/*
  Warnings:

  - A unique constraint covering the columns `[vin]` on the table `Cars` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cars" ADD COLUMN     "vin" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cars_vin_key" ON "Cars"("vin");
