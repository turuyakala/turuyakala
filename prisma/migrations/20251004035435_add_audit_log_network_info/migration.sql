-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN "actor" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "ip" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "payloadSize" INTEGER;
ALTER TABLE "AuditLog" ADD COLUMN "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_actor_idx" ON "AuditLog"("actor");

-- CreateIndex
CREATE INDEX "AuditLog_statusCode_idx" ON "AuditLog"("statusCode");
