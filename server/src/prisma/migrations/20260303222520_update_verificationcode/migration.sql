/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `VerificationCode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "VerificationCode_createdAt_key";

-- AlterTable
ALTER TABLE "VerificationCode" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiresAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_code_key" ON "VerificationCode"("code");
