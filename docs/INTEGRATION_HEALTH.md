# 🔌 Integration Health Monitor

## Genel Bakış

Tedarikçi entegrasyonlarının sağlık durumunu izleyen sistem.

**Özellikler:**
- ✅ Son başarılı pull zamanı
- ✅ Son webhook zamanı
- ✅ Sıradaki cron zamanı
- ✅ Sağlık durumu (healthy/warning/critical)
- ✅ Dashboard widget
- ✅ Detaylı sayfa
- ✅ Auto-refresh (30 saniye)

---

## 🎯 API Endpoint

### GET /api/health/integrations

**Description:** Get integration health status for all active suppliers

**Authentication:** Admin only

**Response:**
```json
{
  "integrationHealth": [
    {
      "supplier": {
        "id": "supplier-1",
        "name": "Acme Tours",
        "integrationMode": "pull"
      },
      "lastSuccessfulPull": "2025-10-04T12:00:00Z",
      "lastWebhook": null,
      "nextCronTime": "2025-10-04T12:15:00Z",
      "healthStatus": "healthy",
      "healthMessage": "Normal",
      "pullEnabled": true
    }
  ],
  "timestamp": "2025-10-04T12:10:00Z"
}
```

---

## 📊 Health Status Levels

### Healthy (✅)

**Criteria:**
- Pull-enabled: Last pull within 1 hour
- Push-enabled: Last webhook within 24 hours
- No errors

**Badge:** Green

### Warning (⚠️)

**Criteria:**
- Pull-enabled: Last pull 1-2 hours ago
- Push-enabled: Last webhook > 24 hours ago

**Badge:** Yellow

### Critical (🚨)

**Criteria:**
- Pull-enabled: Last pull > 2 hours ago
- Any integration errors

**Badge:** Red

---

## 🖥️ Admin UI

### Dashboard Widget

**Location:** `/admin/stats`

**Features:**
- Summary counts (Healthy/Warning/Critical)
- Top 4 suppliers with mini cards
- Quick metrics (Last pull, Last webhook, Next cron)
- Link to detailed page

**Auto-refresh:** No (uses main page data)

### Detailed Page

**Location:** `/admin/integrations-health`

**Features:**
- All suppliers displayed as cards
- Health status badges
- Last pull/webhook times (relative + absolute)
- Next cron countdown
- Integration mode badge
- Link to supplier settings
- Manual refresh button

**Auto-refresh:** Every 30 seconds

---

## 📋 Metrics Explained

### Last Successful Pull

**Source:** `AuditLog` where `action='sync_completed'` and `statusCode=200`

**Display:**
- Relative: "5 dakika önce", "2 saat önce"
- Absolute: "04.10.2025 12:00"

**Only shown for:** Pull-enabled suppliers

### Last Webhook

**Source:** `AuditLog` where `action='webhook_received'` and `statusCode=200`

**Display:**
- Relative: "10 dakika önce", "1 gün önce"
- Absolute: "04.10.2025 12:05"

**Only shown for:** Push-mode suppliers

### Next Cron Time

**Calculation:**
```typescript
// Simple 15-minute interval calculation
const lastPullTime = lastSuccessfulPull?.createdAt || new Date(0);
const minutesSinceLastPull = (now - lastPullTime) / 60000;
const minutesUntilNext = 15 - (minutesSinceLastPull % 15);
const nextCronTime = now + (minutesUntilNext * 60000);
```

**Display:**
- Relative: "5 dakika", "1 saat 12 dakika"
- Absolute: "04.10.2025 12:15"

**Only shown for:** Pull-enabled suppliers with schedule

---

## 🎨 UI Components

### Dashboard Widget (`IntegrationHealthWidget`)

```tsx
// src/app/admin/components/IntegrationHealthWidget.tsx
<div className="bg-white rounded-lg shadow-md p-6">
  {/* Summary Grid */}
  <div className="grid grid-cols-3 gap-3">
    <div className="bg-green-50 rounded p-3 text-center">
      <div className="text-2xl font-bold text-green-700">{healthyCount}</div>
      <div className="text-xs text-green-600">Sağlıklı</div>
    </div>
    {/* ... */}
  </div>
  
  {/* Supplier Cards */}
  <div className="space-y-3">
    {health.slice(0, 4).map(supplier => (
      <SupplierMiniCard key={supplier.id} {...supplier} />
    ))}
  </div>
</div>
```

**Features:**
- Compact display (4 suppliers max)
- Color-coded borders
- Essential metrics only
- Link to detailed page

### Detailed Page (`IntegrationsHealthPage`)

```tsx
// src/app/admin/integrations-health/page.tsx
<div className="space-y-6">
  {/* Summary Cards */}
  <div className="grid grid-cols-3 gap-4">
    <SummaryCard status="healthy" count={healthyCount} />
    <SummaryCard status="warning" count={warningCount} />
    <SummaryCard status="critical" count={criticalCount} />
  </div>
  
  {/* Supplier Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {health.map(supplier => (
      <SupplierCard key={supplier.id} {...supplier} />
    ))}
  </div>
</div>
```

**Features:**
- Full supplier display
- Detailed metrics
- Auto-refresh
- Manual refresh button

---

## 🔄 Auto-Refresh

### Dashboard Widget

**Refresh:** Depends on parent page refresh

**Why:** To avoid duplicate API calls

### Detailed Page

**Refresh:** Every 30 seconds

**Implementation:**
```typescript
useEffect(() => {
  fetchHealth();
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(fetchHealth, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────┐
│   Admin Dashboard / Health Page     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   GET /api/health/integrations      │
│   - Fetch active suppliers          │
│   - Query AuditLog for each         │
│   - Calculate health status         │
│   - Calculate next cron time        │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐  ┌──────────────┐
│  Dashboard  │  │ Detailed Page│
│   Widget    │  │  (Full View) │
└─────────────┘  └──────────────┘
```

---

## 🧪 Example Scenarios

### Scenario 1: Healthy Pull Integration

```json
{
  "supplier": {
    "id": "supplier-1",
    "name": "Acme Tours",
    "integrationMode": "pull"
  },
  "lastSuccessfulPull": "2025-10-04T12:00:00Z",
  "lastWebhook": null,
  "nextCronTime": "2025-10-04T12:15:00Z",
  "healthStatus": "healthy",
  "healthMessage": "Normal",
  "pullEnabled": true
}
```

**Display:**
- Status: ✅ Healthy
- Last Pull: 10 dakika önce
- Next Cron: 5 dakika

### Scenario 2: Warning - Late Pull

```json
{
  "supplier": {
    "id": "supplier-2",
    "name": "Beta Travel",
    "integrationMode": "pull"
  },
  "lastSuccessfulPull": "2025-10-04T10:30:00Z",
  "lastWebhook": null,
  "nextCronTime": "2025-10-04T12:15:00Z",
  "healthStatus": "warning",
  "healthMessage": "Son pull 1 saat önce",
  "pullEnabled": true
}
```

**Display:**
- Status: ⚠️ Warning
- Last Pull: 1 saat önce
- Next Cron: 5 dakika

### Scenario 3: Critical - No Recent Pull

```json
{
  "supplier": {
    "id": "supplier-3",
    "name": "Gamma Holidays",
    "integrationMode": "pull"
  },
  "lastSuccessfulPull": "2025-10-04T08:00:00Z",
  "lastWebhook": null,
  "nextCronTime": "2025-10-04T12:15:00Z",
  "healthStatus": "critical",
  "healthMessage": "Son pull 4 saat önce",
  "pullEnabled": true
}
```

**Display:**
- Status: 🚨 Critical
- Last Pull: 4 saat önce
- Next Cron: 5 dakika

### Scenario 4: Push Integration (Webhook)

```json
{
  "supplier": {
    "id": "supplier-4",
    "name": "Delta Cruises",
    "integrationMode": "push"
  },
  "lastSuccessfulPull": null,
  "lastWebhook": "2025-10-04T11:50:00Z",
  "nextCronTime": null,
  "healthStatus": "healthy",
  "healthMessage": "Normal",
  "pullEnabled": false
}
```

**Display:**
- Status: ✅ Healthy
- Last Webhook: 20 dakika önce
- Next Cron: N/A

---

## 🎓 Best Practices

### 1. Monitor Regularly

**✅ Do:**
- Check dashboard daily
- Set up alerts for critical status
- Review weekly trends

**❌ Don't:**
- Ignore warning statuses
- Wait for critical before action
- Disable suppliers without investigation

### 2. Investigate Issues

**When status is warning/critical:**
1. Check audit logs: `/admin/audit-logs`
2. Review errors: `/admin/errors`
3. Check supplier settings
4. Test connection manually
5. Review rate limits

### 3. Optimize Schedules

**✅ Do:**
- Adjust pull schedules based on data freshness
- Balance between freshness and load
- Consider supplier rate limits

**❌ Don't:**
- Pull too frequently (wastes resources)
- Pull too rarely (stale data)
- Ignore supplier recommendations

---

## 🐛 Troubleshooting

### Issue: All suppliers showing "Critical"

**Possible Causes:**
1. Cron jobs not running
2. Supplier APIs down
3. Database connection issues

**Solution:**
```bash
# Check cron status
# Dev: Check instrumentation.ts logs
# Prod: Check cloud cron logs (AWS EventBridge)

# Test supplier manually
curl /api/admin/suppliers/[id]/sync-now

# Check audit logs
# Look for sync_failed events
```

### Issue: Next cron time incorrect

**Possible Causes:**
1. Cron schedule changed
2. Last pull time missing
3. Calculation logic issue

**Solution:**
```typescript
// Update calculation in /api/health/integrations
// Currently assumes 15-minute interval
// Enhance with actual cron parser if needed
```

### Issue: Health status not updating

**Possible Causes:**
1. Auto-refresh not working
2. API errors
3. Browser cache

**Solution:**
```typescript
// Check browser console for errors
// Try manual refresh button
// Clear cache and reload
```

---

## 📚 Related Files

| File | Description |
|------|-------------|
| `src/app/api/health/integrations/route.ts` | Health API endpoint |
| `src/app/admin/integrations-health/page.tsx` | Detailed health page |
| `src/app/admin/components/IntegrationHealthWidget.tsx` | Dashboard widget |
| `src/app/admin/stats/page.tsx` | Dashboard (includes widget) |
| `src/app/admin/layout.tsx` | Navigation link |

---

## 🔮 Future Enhancements

### 1. Real-time Updates

**Idea:** WebSocket or Server-Sent Events for live status

**Benefits:**
- Instant status updates
- No polling overhead
- Better UX

### 2. Historical Trends

**Idea:** Store health snapshots over time

**Benefits:**
- Identify patterns
- Predict issues
- Performance analytics

### 3. Alerts & Notifications

**Idea:** Email/Slack alerts for critical status

**Benefits:**
- Proactive monitoring
- Faster response
- Reduced downtime

### 4. Advanced Cron Parsing

**Idea:** Use cron-parser library for accurate next run time

**Benefits:**
- Support any cron expression
- More accurate predictions
- Better scheduling

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

