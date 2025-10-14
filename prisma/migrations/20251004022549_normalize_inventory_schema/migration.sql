/*
  Warnings:

  - You are about to drop the column `price` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `InventoryItem` table. All the data in the column will be lost.
  - Added the required column `priceMinor` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT,
    "vendorOfferId" TEXT,
    "sellerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "seatsTotal" INTEGER NOT NULL,
    "seatsLeft" INTEGER NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "image" TEXT,
    "terms" TEXT,
    "contact" TEXT,
    "transport" TEXT,
    "isSurprise" BOOLEAN NOT NULL DEFAULT false,
    "requiresVisa" BOOLEAN NOT NULL DEFAULT false,
    "requiresPassport" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "rawJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("category", "contact", "createdAt", "currency", "from", "id", "image", "isSurprise", "requiresPassport", "requiresVisa", "seatsLeft", "seatsTotal", "sellerId", "startAt", "terms", "title", "to", "transport", "updatedAt") SELECT "category", "contact", "createdAt", "currency", "from", "id", "image", "isSurprise", "requiresPassport", "requiresVisa", "seatsLeft", "seatsTotal", "sellerId", "startAt", "terms", "title", "to", "transport", "updatedAt" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
CREATE INDEX "InventoryItem_category_startAt_idx" ON "InventoryItem"("category", "startAt");
CREATE INDEX "InventoryItem_isSurprise_idx" ON "InventoryItem"("isSurprise");
CREATE INDEX "InventoryItem_status_idx" ON "InventoryItem"("status");
CREATE INDEX "InventoryItem_supplierId_idx" ON "InventoryItem"("supplierId");
CREATE UNIQUE INDEX "InventoryItem_vendorOfferId_supplierId_key" ON "InventoryItem"("vendorOfferId", "supplierId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
