-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('KDV_DAMGA', 'GECICI_VERGI', 'STOPAJ', 'YILLIK_VERGI');

-- CreateTable
CREATE TABLE "Tax" (
    "id" SERIAL NOT NULL,
    "type" "TaxType" NOT NULL,
    "period" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2),
    "paidAt" TIMESTAMP(3),
    "paidAmount" DECIMAL(10,2),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);
