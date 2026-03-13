/*
  Warnings:

  - You are about to drop the column `minQuantity` on the `ProductSalePrice` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ProductSalePrice` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ProductSalePrice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProductSalePrice` table. All the data in the column will be lost.
  - Added the required column `label` to the `ProductSalePrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductSalePrice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductSalePrice" DROP COLUMN "minQuantity",
DROP COLUMN "quantity",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;
