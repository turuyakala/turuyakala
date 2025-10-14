-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "vendorOfferId" TEXT NOT NULL,
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
    "transport" TEXT,
    "isSurprise" BOOLEAN NOT NULL DEFAULT false,
    "requiresVisa" BOOLEAN NOT NULL DEFAULT false,
    "requiresPassport" BOOLEAN NOT NULL DEFAULT false,
    "rawJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "importedToInventory" BOOLEAN NOT NULL DEFAULT false,
    "inventoryItemId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("category", "createdAt", "currency", "from", "id", "image", "importedToInventory", "inventoryItemId", "lastSyncedAt", "priceMinor", "rawJson", "seatsLeft", "seatsTotal", "startAt", "status", "supplierId", "terms", "title", "to", "transport", "updatedAt", "vendorOfferId") SELECT "category", "createdAt", "currency", "from", "id", "image", "importedToInventory", "inventoryItemId", "lastSyncedAt", "priceMinor", "rawJson", "seatsLeft", "seatsTotal", "startAt", "status", "supplierId", "terms", "title", "to", "transport", "updatedAt", "vendorOfferId" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE INDEX "Offer_supplierId_idx" ON "Offer"("supplierId");
CREATE INDEX "Offer_status_idx" ON "Offer"("status");
CREATE INDEX "Offer_importedToInventory_idx" ON "Offer"("importedToInventory");
CREATE INDEX "Offer_startAt_idx" ON "Offer"("startAt");
CREATE INDEX "Offer_isSurprise_idx" ON "Offer"("isSurprise");
CREATE INDEX "Offer_category_idx" ON "Offer"("category");
CREATE UNIQUE INDEX "Offer_vendorOfferId_supplierId_key" ON "Offer"("vendorOfferId", "supplierId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
