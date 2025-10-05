import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { mapToOffer } from '@/lib/integrations/mappers/mapToOffer';
import { createAuditLog } from '@/lib/audit/auditLogger';
import { supplierSecurityMiddleware } from '@/lib/middleware/supplierSecurity';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Verify HMAC-SHA256 signature
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * POST /api/suppliers/[id]/webhook
 * Webhook endpoint for supplier push events
 * 
 * Expected Headers:
 * - X-Signature: HMAC-SHA256 signature of request body
 * 
 * Expected Body:
 * {
 *   "event": "offer.created" | "offer.updated" | "offer.deleted" | "offer.expired",
 *   "timestamp": "2025-10-04T12:00:00Z",
 *   "data": {
 *     // Offer data (format varies by supplier)
 *   }
 * }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const startTime = Date.now();
  let jobRun: any = null;
  let statusCode = 200;
  let responseMessage = '';

  try {
    const { id: supplierId } = await context.params;

    // Security checks (IP allowlist & rate limiting)
    const securityCheck = await supplierSecurityMiddleware(request, supplierId);
    if (securityCheck) {
      return securityCheck; // Return error response
    }

    // Get supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      statusCode = 404;
      responseMessage = 'Supplier not found';
      
      await createAuditLog({
        action: 'webhook_rejected',
        entity: 'supplier',
        entityId: supplierId,
        actor: 'webhook',
        statusCode: 404,
        error: 'Supplier not found',
        request,
      });

      return NextResponse.json(
        { error: responseMessage },
        { status: statusCode }
      );
    }

    // Check if webhook secret is configured
    if (!supplier.webhookSecret) {
      statusCode = 403;
      responseMessage = 'Webhook not configured for this supplier';

      await prisma.auditLog.create({
        data: {
          action: 'webhook_rejected',
          entity: 'supplier',
          entityId: supplierId,
          supplierId,
          statusCode: 403,
          error: responseMessage,
        },
      });

      return NextResponse.json(
        { error: responseMessage },
        { status: statusCode }
      );
    }

    // Get signature from header
    const signature = request.headers.get('X-Signature') || request.headers.get('x-signature');
    if (!signature) {
      statusCode = 401;
      responseMessage = 'Missing X-Signature header';

      await prisma.auditLog.create({
        data: {
          action: 'webhook_rejected',
          entity: 'supplier',
          entityId: supplierId,
          supplierId,
          statusCode: 401,
          error: responseMessage,
        },
      });

      return NextResponse.json(
        { error: responseMessage },
        { status: statusCode }
      );
    }

    // Read request body
    const rawBody = await request.text();
    
    // Verify signature
    const isValid = verifySignature(rawBody, signature, supplier.webhookSecret);
    if (!isValid) {
      statusCode = 401;
      responseMessage = 'Invalid signature';

      await prisma.auditLog.create({
        data: {
          action: 'webhook_rejected',
          entity: 'supplier',
          entityId: supplierId,
          supplierId,
          statusCode: 401,
          error: responseMessage,
          metadata: JSON.stringify({
            signatureReceived: signature.substring(0, 10) + '...',
          }),
        },
      });

      return NextResponse.json(
        { error: responseMessage },
        { status: statusCode }
      );
    }

    // Parse body
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      statusCode = 400;
      responseMessage = 'Invalid JSON body';

      await prisma.auditLog.create({
        data: {
          action: 'webhook_rejected',
          entity: 'supplier',
          entityId: supplierId,
          supplierId,
          statusCode: 400,
          error: responseMessage,
        },
      });

      return NextResponse.json(
        { error: responseMessage },
        { status: statusCode }
      );
    }

    const { event, data, timestamp } = body;

    // Validate event type
    const validEvents = ['offer.created', 'offer.updated', 'offer.deleted', 'offer.expired'];
    if (!event || !validEvents.includes(event)) {
      statusCode = 400;
      responseMessage = `Invalid event type. Expected one of: ${validEvents.join(', ')}`;

      await prisma.auditLog.create({
        data: {
          action: 'webhook_rejected',
          entity: 'supplier',
          entityId: supplierId,
          supplierId,
          statusCode: 400,
          error: responseMessage,
          metadata: JSON.stringify({ eventReceived: event }),
        },
      });

      return NextResponse.json(
        { error: responseMessage },
        { status: statusCode }
      );
    }

    // Create JobRun for tracking
    jobRun = await prisma.jobRun.create({
      data: {
        supplierId,
        jobId: 'webhook',
        status: 'running',
        startedAt: new Date(),
      },
    });

    // Log webhook received
      await createAuditLog({
        action: 'webhook_received',
        entity: 'supplier',
        entityId: supplierId,
        supplierId,
        actor: 'webhook',
        statusCode: 200,
        metadata: {
          event,
          timestamp,
          hasData: !!data,
        },
        request,
      });

    // Process event
    const result: {
      inserted?: number;
      updated?: number;
      deleted?: number;
      failed?: number;
    } = {};

    switch (event) {
      case 'offer.created':
      case 'offer.updated':
        try {
          // Map to normalized format
          const normalized = mapToOffer(data, supplierId);

          // Upsert offer
          const existing = await prisma.offer.findUnique({
            where: {
              vendor_offer_unique: {
                vendorOfferId: normalized.vendorOfferId,
                supplierId: normalized.supplierId,
              },
            },
          });

          await prisma.offer.upsert({
            where: {
              vendor_offer_unique: {
                vendorOfferId: normalized.vendorOfferId,
                supplierId: normalized.supplierId,
              },
            },
            create: normalized,
            update: normalized,
          });

          if (existing) {
            result.updated = 1;
          } else {
            result.inserted = 1;
          }

          responseMessage = event === 'offer.created' ? 'Offer created' : 'Offer updated';
          statusCode = 200;

        } catch (error) {
          result.failed = 1;
          responseMessage = error instanceof Error ? error.message : 'Failed to process offer';
          statusCode = 422; // Unprocessable Entity

          await prisma.auditLog.create({
            data: {
              action: 'webhook_processing_failed',
              entity: 'offer',
              entityId: data?.vendorOfferId || null,
              supplierId,
              statusCode: 422,
              error: responseMessage,
              metadata: JSON.stringify({ event, data }),
            },
          });
        }
        break;

      case 'offer.deleted':
      case 'offer.expired':
        try {
          const vendorOfferId = data?.vendorOfferId || data?.id;
          
          if (!vendorOfferId) {
            throw new Error('Missing vendorOfferId in webhook data');
          }

          const updated = await prisma.offer.updateMany({
            where: {
              vendorOfferId,
              supplierId,
            },
            data: {
              status: event === 'offer.deleted' ? 'deleted' : 'expired',
            },
          });

          result.updated = updated.count;
          responseMessage = `Offer marked as ${event === 'offer.deleted' ? 'deleted' : 'expired'}`;
          statusCode = 200;

        } catch (error) {
          result.failed = 1;
          responseMessage = error instanceof Error ? error.message : 'Failed to update offer status';
          statusCode = 422;

          await prisma.auditLog.create({
            data: {
              action: 'webhook_processing_failed',
              entity: 'offer',
              entityId: data?.vendorOfferId || data?.id || null,
              supplierId,
              statusCode: 422,
              error: responseMessage,
              metadata: JSON.stringify({ event, data }),
            },
          });
        }
        break;
    }

    // Update JobRun
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: result.failed ? 'failed' : 'completed',
        finishedAt: new Date(),
        duration: Math.floor((Date.now() - startTime) / 1000),
        inserted: result.inserted || 0,
        updated: result.updated || 0,
        failed: result.failed || 0,
        result: JSON.stringify({ event, ...result }),
      },
    });

    // Create success audit log
    await prisma.auditLog.create({
      data: {
        action: result.failed ? 'webhook_processing_failed' : 'webhook_processed',
        entity: 'supplier',
        entityId: supplierId,
        supplierId,
        statusCode,
        metadata: JSON.stringify({
          event,
          result,
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      },
    });

    return NextResponse.json(
      {
        success: !result.failed,
        message: responseMessage,
        event,
        result,
      },
      { status: statusCode }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    statusCode = 500;
    responseMessage = error instanceof Error ? error.message : 'Internal server error';

    // Update JobRun as failed
    if (jobRun) {
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          duration: Math.floor((Date.now() - startTime) / 1000),
          error: responseMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
    }

    // Create error audit log
    await prisma.auditLog.create({
      data: {
        action: 'webhook_error',
        entity: 'supplier',
        entityId: (await context.params).id,
        supplierId: (await context.params).id,
        statusCode: 500,
        error: responseMessage,
        metadata: JSON.stringify({
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: responseMessage,
      },
      { status: statusCode }
    );
  }
}

