-- CreateTable
CREATE TABLE "Offer" (
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
    "rawJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "importedToInventory" BOOLEAN NOT NULL DEFAULT false,
    "inventoryItemId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Offer_supplierId_idx" ON "Offer"("supplierId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_importedToInventory_idx" ON "Offer"("importedToInventory");

-- CreateIndex
CREATE INDEX "Offer_startAt_idx" ON "Offer"("startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_vendorOfferId_supplierId_key" ON "Offer"("vendorOfferId", "supplierId");
