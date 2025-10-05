# 🔍 Gelişmiş Audit Sistemi

## Genel Bakış

Tüm entegrasyon çağrıları ve sistem olayları detaylı olarak kaydedilir.

**Özellikler:**
- ✅ Actor tracking (scheduler, webhook, manual, api, system)
- ✅ Network info (IP, User Agent, Payload Size)
- ✅ Status code tracking
- ✅ Error flag on dashboard (last 24h)
- ✅ Filtered errors page
- ✅ Automatic logging for all integrations

---

## 📊 AuditLog Model

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique ID (cuid) |
| `action` | String | Event action (sync_started, webhook_received, etc.) |
| `entity` | String | Entity type (supplier, offer, job, integration) |
| `entityId` | String? | Entity ID |
| `userId` | String? | User who triggered (if manual) |
| `supplierId` | String? | Related supplier |
| **`actor`** | String? | **scheduler, webhook, manual, api, system** |
| **`ip`** | String? | **Client IP address** |
| **`userAgent`** | String? | **User agent string** |
| **`payloadSize`** | Int? | **Request payload size (bytes)** |
| `metadata` | String? | JSON metadata |
| `statusCode` | Int? | HTTP status code |
| `error` | String? | Error message |
| `createdAt` | DateTime | Timestamp |

### Indexes

```prisma
@@index([action])
@@index([entity])
@@index([userId])
@@index([supplierId])
@@index([actor])
@@index([statusCode])
@@index([createdAt])
```

---

## 🎯 Actor Types

| Actor | Açıklama | Örnek Kullanım |
|-------|----------|----------------|
| `scheduler` | Cron job tarafından tetiklenen | Saatlik sync, cleanup |
| `webhook` | Webhook tarafından tetiklenen | Supplier push events |
| `manual` | Admin tarafından manuel tetiklenen | Admin panel'den sync |
| `api` | API endpoint'inden tetiklenen | CSV import, bulk operations |
| `system` | Sistem tarafından otomatik | Internal processes |

---

## 📝 Audit Logger Utility

### createAuditLog()

```typescript
import { createAuditLog } from '@/lib/audit/auditLogger';

await createAuditLog({
  action: 'sync_started',
  entity: 'supplier',
  entityId: supplierId,
  supplierId,
  actor: 'scheduler',
  statusCode: 200,
  metadata: { trigger: 'cron' },
  request, // Optional NextRequest for network info
});
```

### logIntegrationCall()

```typescript
import { logIntegrationCall } from '@/lib/audit/auditLogger';

await logIntegrationCall(
  'api_call',
  'supplier-1',
  'webhook',
  200,
  {
    metadata: { endpoint: '/offers' },
    request, // NextRequest
  }
);
```

### extractNetworkInfo()

```typescript
import { extractNetworkInfo } from '@/lib/audit/auditLogger';

const { ip, userAgent, payloadSize } = extractNetworkInfo(request);
```

### getRecentErrorCount()

```typescript
import { getRecentErrorCount } from '@/lib/audit/auditLogger';

const count = await getRecentErrorCount(24); // Last 24 hours
```

---

## 🚨 Error Flag (Dashboard)

### API Endpoint

**GET /api/admin/dashboard/error-flag**

**Response:**
```json
{
  "errorCount": 42,
  "severity": "critical",
  "errorsByAction": [
    {
      "action": "sync_failed",
      "_count": { "action": 15 }
    },
    {
      "action": "webhook_rejected",
      "_count": { "action": 10 }
    }
  ]
}
```

### Severity Levels

| Error Count | Severity |
|-------------|----------|
| 0-10 | `none` |
| 11-50 | `warning` (Yellow) |
| 50+ | `critical` (Red) |

### Dashboard Display

```tsx
// Stats page shows error flag
{errorFlag && errorFlag.errorCount > 0 && (
  <div className="bg-red-50 border border-red-300 p-6">
    <h3>🚨 Son 24 Saatte Hata Tespit Edildi</h3>
    <div>{errorFlag.errorCount} Hata</div>
    <a href="/admin/errors">Hataları Görüntüle →</a>
  </div>
)}
```

---

## 🔍 Errors Page (`/admin/errors`)

### Features

**Filters:**
- Time range (1h, 24h, 7d, 30d)
- Status code (4xx, 5xx, all)
- Actor (scheduler, webhook, manual, api, system)

**Display:**
- Error count summary
- Detailed error cards
- Network info (IP, User Agent, Payload Size)
- Error message
- Metadata (JSON)

### API Endpoint

**GET /api/admin/errors**

**Query Params:**
- `statusCode`: `4xx`, `5xx`, or specific code
- `actor`: `scheduler`, `webhook`, etc.
- `timeRange`: `1h`, `24h`, `7d`, `30d`

**Response:**
```json
{
  "errors": [
    {
      "id": "...",
      "action": "sync_failed",
      "entity": "supplier",
      "actor": "scheduler",
      "statusCode": 500,
      "error": "Connection timeout",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "payloadSize": 1024,
      "metadata": "{...}",
      "createdAt": "2025-10-04T12:00:00Z",
      "supplier": { "name": "Acme Tours" }
    }
  ]
}
```

---

## 📋 Integration Points

### 1. Cron Sync (Scheduler)

```typescript
// lib/jobs/syncService.ts
await createAuditLog({
  action: 'sync_started',
  entity: 'supplier',
  supplierId,
  actor: 'scheduler',
  statusCode: 200,
  metadata: { trigger: 'cron' },
});

// On success
await createAuditLog({
  action: 'sync_completed',
  entity: 'supplier',
  supplierId,
  actor: 'scheduler',
  statusCode: 200,
  metadata: { inserted, updated, failed, duration },
});

// On error
await createAuditLog({
  action: 'sync_failed',
  entity: 'supplier',
  supplierId,
  actor: 'scheduler',
  statusCode: 500,
  error: errorMessage,
});
```

### 2. Webhook (Webhook)

```typescript
// src/app/api/suppliers/[id]/webhook/route.ts
await createAuditLog({
  action: 'webhook_received',
  entity: 'supplier',
  supplierId,
  actor: 'webhook',
  statusCode: 200,
  metadata: { event, timestamp },
  request, // Extracts IP, User Agent, Payload Size
});

// On rejection
await createAuditLog({
  action: 'webhook_rejected',
  entity: 'supplier',
  supplierId,
  actor: 'webhook',
  statusCode: 401,
  error: 'Invalid signature',
  request,
});
```

### 3. CSV Import (API)

```typescript
// src/app/api/admin/import/execute/route.ts
await createAuditLog({
  action: 'csv_import_started',
  entity: 'offer',
  userId: session.user.id,
  supplierId,
  actor: 'api',
  statusCode: 200,
  metadata: { totalRows, mappedColumns },
  request,
});

// On completion
await createAuditLog({
  action: 'csv_import_completed',
  entity: 'offer',
  userId: session.user.id,
  supplierId,
  actor: 'api',
  statusCode: 200,
  metadata: { imported, failed, duration },
});
```

### 4. Manual Sync (Manual)

```typescript
// src/app/api/admin/suppliers/[id]/sync-now/route.ts
await createAuditLog({
  action: 'manual_sync_started',
  entity: 'supplier',
  userId: session.user.id,
  supplierId,
  actor: 'manual',
  statusCode: 200,
  request,
});
```

### 5. Cleanup (System)

```typescript
// lib/jobs/cleanupService.ts
await createAuditLog({
  action: 'cleanup_completed',
  entity: 'offer',
  actor: 'system',
  statusCode: 200,
  metadata: { expired, soldOut, duration },
});
```

---

## 📊 Example Audit Logs

### Scheduler Sync

```json
{
  "action": "sync_completed",
  "entity": "supplier",
  "supplierId": "supplier-1",
  "actor": "scheduler",
  "statusCode": 200,
  "metadata": {
    "inserted": 50,
    "updated": 20,
    "failed": 2,
    "duration": 15
  },
  "createdAt": "2025-10-04T12:00:00Z"
}
```

### Webhook Received

```json
{
  "action": "webhook_received",
  "entity": "supplier",
  "supplierId": "supplier-2",
  "actor": "webhook",
  "statusCode": 200,
  "ip": "203.0.113.45",
  "userAgent": "SupplierWebhook/1.0",
  "payloadSize": 2048,
  "metadata": {
    "event": "offer.created",
    "timestamp": "2025-10-04T12:05:00Z"
  },
  "createdAt": "2025-10-04T12:05:01Z"
}
```

### Webhook Rejected (Invalid Signature)

```json
{
  "action": "webhook_rejected",
  "entity": "supplier",
  "supplierId": "supplier-2",
  "actor": "webhook",
  "statusCode": 401,
  "error": "Invalid signature",
  "ip": "198.51.100.22",
  "userAgent": "curl/7.68.0",
  "payloadSize": 1024,
  "createdAt": "2025-10-04T12:10:00Z"
}
```

### CSV Import

```json
{
  "action": "csv_import_completed",
  "entity": "offer",
  "userId": "admin-id",
  "supplierId": "manual-import",
  "actor": "api",
  "statusCode": 200,
  "ip": "192.168.1.10",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "imported": 100,
    "failed": 5,
    "duration": 30
  },
  "createdAt": "2025-10-04T12:15:00Z"
}
```

---

## 🔧 Monitoring Queries

### Recent Errors by Actor

```typescript
const errors = await prisma.auditLog.groupBy({
  by: ['actor'],
  where: {
    statusCode: { gte: 400 },
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
  _count: { actor: true },
});
```

### Most Common Errors

```typescript
const errors = await prisma.auditLog.groupBy({
  by: ['action'],
  where: {
    statusCode: { gte: 400 },
  },
  _count: { action: true },
  orderBy: { _count: { action: 'desc' } },
});
```

### Errors by Time Range

```typescript
const errors = await prisma.auditLog.findMany({
  where: {
    statusCode: { gte: 400 },
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  select: {
    createdAt: true,
    action: true,
    statusCode: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### Top Failing Suppliers

```typescript
const suppliers = await prisma.auditLog.groupBy({
  by: ['supplierId'],
  where: {
    statusCode: { gte: 400 },
    supplierId: { not: null },
  },
  _count: { supplierId: true },
  orderBy: { _count: { supplierId: 'desc' } },
  take: 10,
});
```

---

## 🎓 Best Practices

### 1. Always Log Integration Calls

```typescript
// ✅ Good
await createAuditLog({
  action: 'api_call',
  entity: 'supplier',
  supplierId,
  actor: 'webhook',
  statusCode,
  request,
});

// ❌ Bad
console.log('API called'); // No persistence
```

### 2. Include Request for Network Info

```typescript
// ✅ Good
await createAuditLog({
  action: 'webhook_received',
  actor: 'webhook',
  statusCode: 200,
  request, // Extracts IP, User Agent, Payload Size
});

// ❌ Bad
await createAuditLog({
  action: 'webhook_received',
  actor: 'webhook',
  statusCode: 200,
  // No request - missing network info
});
```

### 3. Use Appropriate Actors

```typescript
// ✅ Good
await createAuditLog({ actor: 'scheduler' }); // Cron job
await createAuditLog({ actor: 'webhook' }); // Webhook
await createAuditLog({ actor: 'manual' }); // Admin action

// ❌ Bad
await createAuditLog({ actor: 'unknown' });
```

### 4. Log Both Success and Failure

```typescript
try {
  await processWebhook();
  await createAuditLog({ statusCode: 200 }); // Success
} catch (error) {
  await createAuditLog({ statusCode: 500, error }); // Failure
}
```

### 5. Include Useful Metadata

```typescript
// ✅ Good
await createAuditLog({
  metadata: {
    inserted: 50,
    updated: 20,
    duration: 15,
    endpoint: '/api/offers',
  },
});

// ❌ Bad
await createAuditLog({
  metadata: {}, // Empty metadata
});
```

---

## 🐛 Troubleshooting

### No Logs Appearing

**Check:**
1. createAuditLog() called?
2. Database connection OK?
3. Prisma schema migrated?

**Solution:**
```bash
# Check recent logs
npx prisma studio
# Select AuditLog table
# Sort by createdAt DESC
```

### Network Info Not Captured

**Check:**
1. `request` parameter passed?
2. Headers available?

**Solution:**
```typescript
// Debug network info
const networkInfo = extractNetworkInfo(request);
console.log('Network Info:', networkInfo);
```

### Error Flag Not Showing

**Check:**
1. Errors exist in last 24h?
2. Status codes >= 400?
3. `/api/admin/dashboard/error-flag` working?

**Solution:**
```bash
curl http://localhost:3000/api/admin/dashboard/error-flag
```

---

## 📚 Related Files

| File | Description |
|------|-------------|
| `lib/audit/auditLogger.ts` | Audit logging utility |
| `src/app/api/admin/errors/route.ts` | Errors API |
| `src/app/admin/errors/page.tsx` | Errors page UI |
| `src/app/api/admin/dashboard/error-flag/route.ts` | Error flag API |
| `prisma/schema.prisma` | AuditLog model |

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

