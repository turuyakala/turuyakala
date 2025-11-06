import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export type AuditActor = 'scheduler' | 'webhook' | 'manual' | 'api' | 'system';

export type AuditLogOptions = {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  supplierId?: string;
  actor?: AuditActor;
  statusCode?: number;
  error?: string;
  metadata?: Record<string, any>;
  request?: NextRequest;
};

/**
 * Extract network info from request
 */
export function extractNetworkInfo(request: NextRequest) {
  // Get client IP
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Calculate payload size (if body exists)
  let payloadSize = 0;
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    payloadSize = parseInt(contentLength);
  }

  return { ip, userAgent, payloadSize };
}

/**
 * Create audit log entry
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    const {
      action,
      entity,
      entityId,
      userId,
      supplierId,
      actor,
      statusCode,
      error,
      metadata,
      request,
    } = options;

    // Extract network info if request provided
    let networkInfo: { ip: string; userAgent: string; payloadSize: number } | null = null;
    if (request) {
      networkInfo = extractNetworkInfo(request);
    }

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        supplierId,
        actor,
        statusCode,
        error,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip: networkInfo?.ip || null,
        userAgent: networkInfo?.userAgent || null,
        payloadSize: networkInfo?.payloadSize || null,
      },
    });
  } catch (err) {
    // Don't throw - audit logging failure shouldn't break the main flow
    console.error('Failed to create audit log:', err);
  }
}

/**
 * Create integration call audit log
 */
export async function logIntegrationCall(
  action: string,
  supplierId: string,
  actor: AuditActor,
  statusCode: number,
  options?: {
    error?: string;
    metadata?: Record<string, any>;
    request?: NextRequest;
  }
): Promise<void> {
  await createAuditLog({
    action,
    entity: 'integration',
    supplierId,
    actor,
    statusCode,
    error: options?.error,
    metadata: options?.metadata,
    request: options?.request,
  });
}

/**
 * Get error count for last N hours
 */
export async function getRecentErrorCount(hours: number = 24): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const count = await prisma.auditLog.count({
    where: {
      statusCode: {
        gte: 400, // 4xx and 5xx are errors
      },
      createdAt: {
        gte: since,
      },
    },
  });

  return count;
}

/**
 * Get recent errors grouped by action
 */
export async function getRecentErrorsByAction(hours: number = 24): Promise<any[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const errors = await prisma.auditLog.groupBy({
    by: ['action'],
    where: {
      statusCode: {
        gte: 400,
      },
      createdAt: {
        gte: since,
      },
    },
    _count: {
      action: true,
    },
    orderBy: {
      _count: {
        action: 'desc',
      },
    },
  });

  return errors;
}

