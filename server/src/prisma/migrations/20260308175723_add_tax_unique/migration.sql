/*
  Warnings:

  - A unique constraint covering the columns `[period,type]` on the table `Tax` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tax_period_type_key" ON "Tax"("period", "type");
