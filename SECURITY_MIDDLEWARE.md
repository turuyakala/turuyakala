# 🔒 Supplier Security Middleware

## Genel Bakış

`/api/suppliers/**` endpoint'leri için IP allowlist ve rate limiting middleware.

**Özellikler:**
- ✅ IP Allowlist (CIDR /24 support)
- ✅ Per-supplier rate limiting (requests/minute)
- ✅ Automatic audit logging
- ✅ HTTP headers (X-RateLimit-*)
- ✅ Admin UI for configuration

---

## 🎯 Features

### 1. IP Allowlist

**Supplier bazlı IP kısıtlaması:**
- JSON array of allowed IPs
- CIDR notation support (/24)
- `null` = Allow all IPs

**Example:**
```json
[
  "192.168.1.100",
  "203.0.113.0/24",
  "198.51.100.50"
]
```

### 2. Rate Limiting

**Supplier bazlı istek limiti:**
- Per-minute limit
- In-memory tracking
- Automatic reset every minute
- `null` = No limit

**Response Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-10-04T12:01:00Z
Retry-After: 42
```

### 3. Audit Logging

**Tüm security events logged:**
- `security_check_passed` - Success
- `ip_blocked` - IP not in allowlist
- `rate_limit_exceeded` - Too many requests
- `security_check_failed` - Other failures

---

## 📊 Database Schema

### Supplier Model

```prisma
model Supplier {
  // ...
  
  // Security & Rate Limiting
  ipAllowlist         String?  // JSON array of IPs
  rateLimitPerMinute  Int?     // Max requests/minute
  
  // ...
}
```

**Example Values:**
```typescript
{
  ipAllowlist: '["192.168.1.100", "203.0.113.0/24"]',
  rateLimitPerMinute: 60
}
```

---

## 🚀 Usage

### Middleware Integration

```typescript
// src/app/api/suppliers/[id]/webhook/route.ts
import { supplierSecurityMiddleware } from '@/lib/middleware/supplierSecurity';

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: supplierId } = await context.params;

  // Security checks
  const securityCheck = await supplierSecurityMiddleware(request, supplierId);
  if (securityCheck) {
    return securityCheck; // Return error response
  }

  // Proceed with normal logic
  // ...
}
```

### Helper Functions

#### getClientIP()

```typescript
import { getClientIP } from '@/lib/middleware/supplierSecurity';

const ip = getClientIP(request);
// Returns: "192.168.1.100"
```

#### isIPAllowed()

```typescript
import { isIPAllowed } from '@/lib/middleware/supplierSecurity';

const allowed = isIPAllowed('192.168.1.100', [
  '192.168.1.100',
  '203.0.113.0/24',
]);
// Returns: true
```

#### checkRateLimit()

```typescript
import { checkRateLimit } from '@/lib/middleware/supplierSecurity';

const result = checkRateLimit('supplier-1', 60);
// Returns: { allowed: true, current: 15, limit: 60, resetAt: Date }
```

#### getRateLimitStatus()

```typescript
import { getRateLimitStatus } from '@/lib/middleware/supplierSecurity';

const status = getRateLimitStatus('supplier-1', 60);
// Returns: { current: 15, limit: 60, remaining: 45, resetAt: Date }
```

---

## 🖥️ Admin UI

### Security Settings Page

**URL:** `/admin/suppliers/edit/[id]/security`

**Features:**
- 📝 IP Allowlist editor (line-separated)
- ⏱️ Rate limit configuration
- 💡 Examples and recommendations
- ✅ Current status display
- 💾 Save button

**IP Allowlist Editor:**
```
192.168.1.100
203.0.113.0/24
198.51.100.50
```

**Rate Limit Input:**
```
60  (requests/minute)
```

---

## 📋 API Responses

### 403 Forbidden (IP Blocked)

```json
{
  "error": "IP address not allowed",
  "ip": "198.51.100.99"
}
```

**AuditLog:**
```json
{
  "action": "ip_blocked",
  "entity": "supplier",
  "supplierId": "supplier-1",
  "actor": "webhook",
  "statusCode": 403,
  "error": "IP not allowed: 198.51.100.99",
  "metadata": {
    "blockedIP": "198.51.100.99",
    "allowlist": ["192.168.1.100", "203.0.113.0/24"]
  }
}
```

### 429 Too Many Requests (Rate Limit)

```json
{
  "error": "Rate limit exceeded",
  "limit": 60,
  "current": 61,
  "resetAt": "2025-10-04T12:01:00Z"
}
```

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-10-04T12:01:00Z
Retry-After: 42
```

**AuditLog:**
```json
{
  "action": "rate_limit_exceeded",
  "entity": "supplier",
  "supplierId": "supplier-1",
  "actor": "webhook",
  "statusCode": 429,
  "error": "Rate limit exceeded: 61/60 per minute",
  "metadata": {
    "current": 61,
    "limit": 60,
    "resetAt": "2025-10-04T12:01:00Z"
  }
}
```

### 200 OK (Security Check Passed)

Normal response + AuditLog:

```json
{
  "action": "security_check_passed",
  "entity": "supplier",
  "supplierId": "supplier-1",
  "actor": "webhook",
  "statusCode": 200,
  "metadata": {
    "clientIP": "192.168.1.100",
    "rateLimit": {
      "current": 15,
      "limit": 60
    }
  }
}
```

---

## 🔍 IP Allowlist Logic

### Exact Match

```typescript
isIPAllowed('192.168.1.100', ['192.168.1.100'])
// Returns: true
```

### CIDR /24 Range

```typescript
isIPAllowed('203.0.113.50', ['203.0.113.0/24'])
// Returns: true (matches 203.0.113.0 - 203.0.113.255)

isIPAllowed('203.0.114.50', ['203.0.113.0/24'])
// Returns: false (outside range)
```

### Empty Allowlist (Allow All)

```typescript
isIPAllowed('any.ip.address.here', null)
// Returns: true
```

---

## ⏱️ Rate Limiting Logic

### In-Memory Tracker

```typescript
Map<supplierId, Map<minute, count>>
```

**Example:**
```
supplierId: 'supplier-1'
  minute: 12345 → count: 45
  minute: 12346 → count: 12
```

### Per-Minute Tracking

- Current minute = `Math.floor(Date.now() / 60000)`
- Counter increments on each request
- Resets automatically next minute
- Old minutes cleaned up (keep last 5)

### Algorithm

```typescript
1. Get current minute (e.g., 12345)
2. Get request count for current minute (e.g., 45)
3. If count >= limit (e.g., 60):
   - Return 429 with Retry-After
4. Else:
   - Increment count
   - Allow request
```

---

## 📊 Monitoring

### Rate Limit Dashboard

**Check supplier rate limit status:**
```typescript
import { getRateLimitStatus } from '@/lib/middleware/supplierSecurity';

const status = getRateLimitStatus('supplier-1', 60);
console.log(`${status.current}/${status.limit} requests`);
console.log(`${status.remaining} remaining`);
console.log(`Resets at: ${status.resetAt}`);
```

### Audit Logs

**View in Admin:**
- `/admin/errors` - Filtered by actor=webhook
- `/admin/audit-logs` - All security events

**Common Queries:**
```sql
-- IP blocks (last 24h)
SELECT * FROM AuditLog
WHERE action = 'ip_blocked'
AND createdAt >= datetime('now', '-1 day');

-- Rate limit hits (last 24h)
SELECT * FROM AuditLog
WHERE action = 'rate_limit_exceeded'
AND createdAt >= datetime('now', '-1 day');

-- Top offenders
SELECT ip, COUNT(*) as count
FROM AuditLog
WHERE action IN ('ip_blocked', 'rate_limit_exceeded')
GROUP BY ip
ORDER BY count DESC
LIMIT 10;
```

---

## 🎓 Best Practices

### 1. IP Allowlist

**✅ Do:**
- Use CIDR /24 for office networks
- Whitelist known supplier IPs
- Document each IP in admin notes
- Review and update regularly

**❌ Don't:**
- Use public IPs without verification
- Allow 0.0.0.0/0 (defeats the purpose)
- Forget to test after adding IPs

### 2. Rate Limiting

**✅ Do:**
- Start conservative (60 req/min)
- Monitor actual usage
- Adjust based on load
- Set alerts for frequent 429s

**❌ Don't:**
- Set too low (breaks integration)
- Set too high (no protection)
- Ignore 429 errors in logs

### 3. Testing

**✅ Do:**
- Test with curl from allowed IP
- Test with curl from blocked IP
- Test rate limit with load testing
- Check audit logs after tests

**❌ Don't:**
- Test in production without backup
- Forget to revert test settings
- Skip error response verification

---

## 🧪 Testing Examples

### Test IP Allowlist

**Allowed IP:**
```bash
curl -X POST https://api.example.com/api/suppliers/supplier-1/webhook \
  -H "X-Signature: ..." \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"event":"test"}'

# Expected: 200 OK (or 401 if signature wrong)
```

**Blocked IP:**
```bash
curl -X POST https://api.example.com/api/suppliers/supplier-1/webhook \
  -H "X-Signature: ..." \
  -H "X-Forwarded-For: 198.51.100.99" \
  -d '{"event":"test"}'

# Expected: 403 Forbidden
```

### Test Rate Limit

**Load test:**
```bash
for i in {1..100}; do
  curl -X POST https://api.example.com/api/suppliers/supplier-1/webhook \
    -H "X-Signature: ..." \
    -d "{\"event\":\"test-$i\"}" &
done
wait

# Expected: First 60 succeed, rest get 429
```

**Check headers:**
```bash
curl -i -X POST https://api.example.com/api/suppliers/supplier-1/webhook \
  -H "X-Signature: ..." \
  -d '{"event":"test"}'

# Expected headers:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 45
# X-RateLimit-Reset: 2025-10-04T12:01:00Z
```

---

## 🐛 Troubleshooting

### Issue: All requests blocked (403)

**Check:**
1. Is IP allowlist configured?
2. Is client IP correct? (check X-Forwarded-For)
3. Is CIDR notation correct?

**Solution:**
```typescript
// Debug client IP
const ip = getClientIP(request);
console.log('Client IP:', ip);

// Check allowlist
const supplier = await prisma.supplier.findUnique({
  where: { id: supplierId },
  select: { ipAllowlist: true },
});
console.log('Allowlist:', supplier.ipAllowlist);
```

### Issue: Rate limit always 429

**Check:**
1. Is rate limit too low?
2. Is clock synchronized?
3. Is in-memory tracker persisting correctly?

**Solution:**
```typescript
// Check rate limit status
const status = getRateLimitStatus('supplier-1', 60);
console.log('Rate limit status:', status);

// Reset tracker (restart server or clear map)
rateLimitTracker.clear();
```

### Issue: Security check not logging

**Check:**
1. Is createAuditLog() being called?
2. Is database connection OK?
3. Are errors silenced?

**Solution:**
```typescript
// Add debug logging
console.log('Security check starting...');
const result = await supplierSecurityMiddleware(request, supplierId);
console.log('Security check result:', result);
```

---

## 📚 Related Files

| File | Description |
|------|-------------|
| `lib/middleware/supplierSecurity.ts` | Main middleware |
| `src/app/api/suppliers/[id]/webhook/route.ts` | Webhook with security |
| `src/app/admin/suppliers/edit/[id]/security/page.tsx` | Admin UI |
| `prisma/schema.prisma` | Supplier model (ipAllowlist, rateLimitPerMinute) |
| `lib/audit/auditLogger.ts` | Audit logging |

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

