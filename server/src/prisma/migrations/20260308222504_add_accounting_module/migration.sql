-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "brokenCash" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cardAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedExpenseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedExpenseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyFixedExpense" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "templateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdditionalIncomeTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdditionalIncomeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyAdditionalIncome" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "spentAmount" DECIMAL(10,2),
    "date" TIMESTAMP(3),
    "templateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyAdditionalIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyCarryover" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyCarryover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_date_key" ON "DailyEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FixedExpenseTemplate_name_key" ON "FixedExpenseTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFixedExpense_year_month_description_key" ON "MonthlyFixedExpense"("year", "month", "description");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyCarryover_year_month_key" ON "MonthlyCarryover"("year", "month");

-- AddForeignKey
ALTER TABLE "MonthlyFixedExpense" ADD CONSTRAINT "MonthlyFixedExpense_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FixedExpenseTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAdditionalIncome" ADD CONSTRAINT "MonthlyAdditionalIncome_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "AdditionalIncomeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
