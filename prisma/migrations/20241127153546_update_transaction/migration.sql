/*
  Warnings:

  - You are about to drop the column `transactionCategory` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionPaymentMethod` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transactionCategory",
DROP COLUMN "transactionPaymentMethod",
ADD COLUMN     "category" "TransactionCategory" NOT NULL,
ADD COLUMN     "paymentMethod" "TransactionPaymentMethod" NOT NULL;
