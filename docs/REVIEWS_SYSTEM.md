# 💬 Kullanıcı Yorumları Sistemi

## Genel Bakış

Sadece üyelerin ve rezervasyon yapmış kullanıcıların yorum yapabildiği, admin moderasyonlu bir yorum sistemi.

**Özellikler:**
- ✅ Sadece üyeler ve ödeme yapmış kullanıcılar yorum yapabilir
- ✅ Admin moderasyonu (onay/red/silme)
- ✅ 5 yıldız puanlama sistemi
- ✅ Airbnb tarzı minimalist tasarım
- ✅ Adı gizli (A*** B*** formatında)
- ✅ Slider (3'lü kart görünümü)
- ✅ Ana sayfada footer üstünde
- ✅ "Daha Fazla Fırsat" kutusu (21+ teklif varsa)

---

## 🎯 Database Schema

### Review Model

```prisma
model Review {
  id          String   @id @default(cuid())
  
  // User & Order
  userId      String
  orderId     String
  
  // Review Content
  rating      Int      // 1-5 stars
  comment     String
  tourName    String   // Cached tour name
  
  // Moderation
  isApproved  Boolean  @default(false)
  isPublished Boolean  @default(false)
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Indexes
  @@unique([userId, orderId])
  @@index([isPublished])
  @@index([rating])
  @@index([createdAt])
}
```

**Rules:**
- User can only review once per order
- Order must be paid (`paymentStatus='paid'`)
- Reviews require admin approval before publishing

---

## 📊 API Endpoints

### Public APIs

#### GET /api/reviews

**Description:** Get published reviews for homepage

**Response:**
```json
{
  "reviews": [
    {
      "id": "review-1",
      "rating": 5,
      "comment": "Harika bir deneyimdi!",
      "tourName": "İstanbul Boğaz Turu",
      "user": {
        "name": "Ahmet Yılmaz"
      },
      "createdAt": "2025-10-04T12:00:00Z"
    }
  ]
}
```

#### POST /api/reviews

**Description:** Create a new review (requires auth + paid order)

**Authentication:** Required (user must be logged in)

**Request Body:**
```json
{
  "orderId": "order-1",
  "rating": 5,
  "comment": "Harika bir deneyimdi!"
}
```

**Validation:**
- Order must exist and belong to user
- Order must be paid
- User can only review once per order
- Rating must be 1-5
- Comment must be at least 10 characters

**Response:**
```json
{
  "review": {
    "id": "review-1",
    "rating": 5,
    "comment": "Harika bir deneyimdi!",
    "isApproved": false,
    "isPublished": false
  },
  "message": "Yorumunuz alındı. Onay sonrası yayınlanacaktır."
}
```

### Admin APIs

#### GET /api/admin/reviews

**Description:** Get all reviews for moderation

**Authentication:** Admin only

**Response:**
```json
{
  "reviews": [
    {
      "id": "review-1",
      "rating": 5,
      "comment": "Harika bir deneyimdi!",
      "tourName": "İstanbul Boğaz Turu",
      "isApproved": false,
      "isPublished": false,
      "createdAt": "2025-10-04T12:00:00Z",
      "user": {
        "name": "Ahmet Yılmaz",
        "email": "ahmet@example.com"
      },
      "order": {
        "pnrCode": "ABC123"
      }
    }
  ]
}
```

#### PUT /api/admin/reviews/[id]

**Description:** Update review approval/publish status

**Authentication:** Admin only

**Request Body:**
```json
{
  "isApproved": true,
  "isPublished": true
}
```

**Response:**
```json
{
  "review": {
    "id": "review-1",
    "isApproved": true,
    "isPublished": true
  }
}
```

#### DELETE /api/admin/reviews/[id]

**Description:** Delete a review

**Authentication:** Admin only

**Response:**
```json
{
  "message": "Yorum silindi"
}
```

---

## 🎨 Frontend Components

### ReviewsSection Component

**Location:** `components/ReviewsSection.tsx`

**Features:**
- Slider with 3 cards per view
- Left/right navigation arrows
- Dots indicator
- Auto-masks user names (A*** B***)
- Star rating display
- Tour name
- Responsive design

**Display Format:**
```
┌─────────────────────────────────────────┐
│   Kullanıcılarımız Ne Diyor?           │
│                                         │
│ ┌───────┐ ┌───────┐ ┌───────┐        │
│ │ ⭐⭐⭐⭐⭐ │ │ ⭐⭐⭐⭐⭐ │ │ ⭐⭐⭐⭐⭐ │        │
│ │       │ │       │ │       │        │
│ │"Yorum"│ │"Yorum"│ │"Yorum"│        │
│ │       │ │       │ │       │        │
│ │— A*** B***│ │— C*** D***│ │— E*** F***│        │
│ │İstanbul│ │Antalya│ │Kapadokya│   │
│ │Turu   │ │Turu   │ │Turu   │        │
│ └───────┘ └───────┘ └───────┘        │
│                                         │
│         ← • • • →                      │
└─────────────────────────────────────────┘
```

**Name Masking:**
```typescript
"Ahmet Yılmaz" → "A*** Y***"
"John Doe" → "J*** D***"
"Ali" → "A***"
```

### Admin Reviews Page

**Location:** `/admin/reviews`

**Features:**
- Pending reviews section (yellow)
- Published reviews section (green)
- Summary cards (Pending/Published/Total)
- Approve & Publish button
- Remove from published button
- Delete button
- Full user info (name, email, PNR)

---

## 🏠 Homepage Changes

### "Daha Fazla Fırsat" Box

**When to show:** When there are more than 21 offers available

**Design:**
```
┌────────────────────────────┐
│ 🎉 Daha Fazla Fırsat!      │
│ 50+ tane daha fırsat var  │
└────────────────────────────┘
```

**Styling:**
- Gradient background (primary colors)
- Centered
- Hover effect (scale up)
- Shows remaining offer count

### Reviews Section Placement

**Location:** Between main content and footer

**Why:** 
- Social proof before footer
- Builds trust
- Encourages conversion

---

## 🔐 Security & Validation

### Review Creation Rules

1. **Authentication:** User must be logged in
2. **Payment:** Order must be paid (`paymentStatus='paid'`)
3. **Ownership:** Order must belong to user
4. **Uniqueness:** User can only review once per order
5. **Rating:** Must be 1-5
6. **Comment:** Must be at least 10 characters

### Admin Moderation

**Workflow:**
1. User submits review → `isApproved=false`, `isPublished=false`
2. Admin approves → `isApproved=true`, `isPublished=true`
3. Review appears on homepage

**Admin can:**
- Approve and publish
- Unpublish (remove from public)
- Delete permanently

---

## 📈 Usage Examples

### User Creates Review

```typescript
// After completing a paid order
POST /api/reviews
{
  "orderId": "order-123",
  "rating": 5,
  "comment": "Harika bir deneyimdi! Kesinlikle tavsiye ederim."
}

// Response
{
  "review": { ... },
  "message": "Yorumunuz alındı. Onay sonrası yayınlanacaktır."
}
```

### Admin Approves Review

```typescript
// Admin panel - Approve & Publish button
PUT /api/admin/reviews/review-123
{
  "isApproved": true,
  "isPublished": true
}

// Review now visible on homepage
```

### Admin Deletes Review

```typescript
// Admin panel - Delete button
DELETE /api/admin/reviews/review-123

// Review permanently removed
```

---

## 🎓 Best Practices

### For Users

**✅ Do:**
- Write honest, detailed reviews
- Mention specific aspects of the tour
- Be constructive

**❌ Don't:**
- Use offensive language
- Write fake reviews
- Copy-paste generic reviews

### For Admins

**✅ Do:**
- Review all pending submissions promptly
- Approve honest reviews (even if negative)
- Provide feedback for rejected reviews

**❌ Don't:**
- Only approve 5-star reviews
- Delete negative reviews without reason
- Ignore pending reviews

---

## 🐛 Troubleshooting

### Issue: Can't submit review

**Possible Causes:**
1. Not logged in
2. Order not paid
3. Already reviewed this order

**Solution:**
```typescript
// Check order status
const order = await prisma.order.findFirst({
  where: {
    id: orderId,
    userId,
    paymentStatus: 'paid',
  },
});

if (!order) {
  return { error: 'Sipariş bulunamadı veya ödeme tamamlanmadı' };
}
```

### Issue: Reviews not showing on homepage

**Possible Causes:**
1. Not published (`isPublished=false`)
2. Not approved (`isApproved=false`)

**Solution:**
- Admin must approve and publish reviews
- Check `/admin/reviews` for pending reviews

### Issue: Duplicate review error

**Possible Causes:**
- User already reviewed this order

**Solution:**
```sql
-- Check for existing review
SELECT * FROM Review
WHERE userId = ? AND orderId = ?
```

---

## 📚 Related Files

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Review model definition |
| `src/app/api/reviews/route.ts` | Public review API |
| `src/app/api/admin/reviews/route.ts` | Admin review list API |
| `src/app/api/admin/reviews/[id]/route.ts` | Admin review update/delete API |
| `components/ReviewsSection.tsx` | Homepage reviews slider |
| `src/app/admin/reviews/page.tsx` | Admin moderation page |
| `src/app/page.tsx` | Homepage (includes ReviewsSection) |

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

