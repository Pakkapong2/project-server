/*
  Warnings:

  - You are about to alter the column `price_per_day` on the `car` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `car` MODIFY `price_per_day` INTEGER NOT NULL;
