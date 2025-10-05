import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit/auditLogger';

/**
 * Rate limit tracker per supplier
 * Map<supplierId, Map<minute, count>>
 */
const rateLimitTracker = new Map<string, Map<number, number>>();

/**
 * Extract client IP from request
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Check if IP is in allowlist
 */
export function isIPAllowed(ip: string, allowlist: string[] | null): boolean {
  // If no allowlist, allow all IPs
  if (!allowlist || allowlist.length === 0) {
    return true;
  }

  // Check exact match
  if (allowlist.includes(ip)) {
    return true;
  }

  // Check CIDR ranges (simple /24 support)
  for (const allowedIP of allowlist) {
    if (allowedIP.endsWith('/24')) {
      const baseIP = allowedIP.replace('/24', '');
      const baseParts = baseIP.split('.').slice(0, 3).join('.');
      const ipParts = ip.split('.').slice(0, 3).join('.');
      if (baseParts === ipParts) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check rate limit for supplier
 */
export function checkRateLimit(supplierId: string, limit: number | null): {
  allowed: boolean;
  current: number;
  limit: number | null;
  resetAt: Date;
} {
  // If no limit, allow
  if (!limit) {
    return {
      allowed: true,
      current: 0,
      limit: null,
      resetAt: new Date(Date.now() + 60000),
    };
  }

  // Get current minute
  const now = Date.now();
  const currentMinute = Math.floor(now / 60000);

  // Get or create supplier tracker
  if (!rateLimitTracker.has(supplierId)) {
    rateLimitTracker.set(supplierId, new Map());
  }

  const supplierTracker = rateLimitTracker.get(supplierId)!;

  // Clean old minutes (keep last 5 minutes)
  for (const [minute] of supplierTracker) {
    if (minute < currentMinute - 5) {
      supplierTracker.delete(minute);
    }
  }

  // Get current count
  const currentCount = supplierTracker.get(currentMinute) || 0;

  // Check if over limit
  if (currentCount >= limit) {
    return {
      allowed: false,
      current: currentCount,
      limit,
      resetAt: new Date((currentMinute + 1) * 60000),
    };
  }

  // Increment counter
  supplierTracker.set(currentMinute, currentCount + 1);

  return {
    allowed: true,
    current: currentCount + 1,
    limit,
    resetAt: new Date((currentMinute + 1) * 60000),
  };
}

/**
 * Supplier security middleware
 * - IP allowlist check
 * - Rate limiting
 */
export async function supplierSecurityMiddleware(
  request: NextRequest,
  supplierId: string
): Promise<NextResponse | null> {
  try {
    // Fetch supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        name: true,
        ipAllowlist: true,
        rateLimitPerMinute: true,
        isActive: true,
      },
    });

    if (!supplier) {
      await createAuditLog({
        action: 'security_check_failed',
        entity: 'supplier',
        entityId: supplierId,
        actor: 'webhook',
        statusCode: 404,
        error: 'Supplier not found',
        request,
      });

      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    if (!supplier.isActive) {
      await createAuditLog({
        action: 'security_check_failed',
        entity: 'supplier',
        entityId: supplierId,
        supplierId,
        actor: 'webhook',
        statusCode: 403,
        error: 'Supplier is inactive',
        request,
      });

      return NextResponse.json(
        { error: 'Supplier is inactive' },
        { status: 403 }
      );
    }

    // IP Allowlist Check
    const clientIP = getClientIP(request);
    const allowlist = supplier.ipAllowlist
      ? JSON.parse(supplier.ipAllowlist)
      : null;

    if (!isIPAllowed(clientIP, allowlist)) {
      await createAuditLog({
        action: 'ip_blocked',
        entity: 'supplier',
        entityId: supplierId,
        supplierId,
        actor: 'webhook',
        statusCode: 403,
        error: `IP not allowed: ${clientIP}`,
        request,
        metadata: {
          blockedIP: clientIP,
          allowlist,
        },
      });

      return NextResponse.json(
        {
          error: 'IP address not allowed',
          ip: clientIP,
        },
        { status: 403 }
      );
    }

    // Rate Limit Check
    const rateLimit = checkRateLimit(supplierId, supplier.rateLimitPerMinute);

    if (!rateLimit.allowed) {
      await createAuditLog({
        action: 'rate_limit_exceeded',
        entity: 'supplier',
        entityId: supplierId,
        supplierId,
        actor: 'webhook',
        statusCode: 429,
        error: `Rate limit exceeded: ${rateLimit.current}/${rateLimit.limit} per minute`,
        request,
        metadata: {
          current: rateLimit.current,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt.toISOString(),
        },
      });

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          current: rateLimit.current,
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(Math.max(0, rateLimit.limit! - rateLimit.current)),
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
            'Retry-After': String(Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)),
          },
        }
      );
    }

    // Security checks passed
    await createAuditLog({
      action: 'security_check_passed',
      entity: 'supplier',
      entityId: supplierId,
      supplierId,
      actor: 'webhook',
      statusCode: 200,
      request,
      metadata: {
        clientIP,
        rateLimit: {
          current: rateLimit.current,
          limit: rateLimit.limit,
        },
      },
    });

    // Return null to indicate success (no error response)
    return null;

  } catch (error) {
    console.error('Security middleware error:', error);

    await createAuditLog({
      action: 'security_check_error',
      entity: 'supplier',
      entityId: supplierId,
      actor: 'system',
      statusCode: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      request,
    });

    return NextResponse.json(
      { error: 'Security check failed' },
      { status: 500 }
    );
  }
}

/**
 * Get current rate limit status for supplier
 */
export function getRateLimitStatus(supplierId: string, limit: number | null): {
  current: number;
  limit: number | null;
  remaining: number;
  resetAt: Date;
} {
  if (!limit) {
    return {
      current: 0,
      limit: null,
      remaining: Infinity,
      resetAt: new Date(Date.now() + 60000),
    };
  }

  const currentMinute = Math.floor(Date.now() / 60000);
  const supplierTracker = rateLimitTracker.get(supplierId);
  const current = supplierTracker?.get(currentMinute) || 0;

  return {
    current,
    limit,
    remaining: Math.max(0, limit - current),
    resetAt: new Date((currentMinute + 1) * 60000),
  };
}

