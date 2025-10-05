import { prisma } from '@/lib/prisma';
import { mapToOfferBatch } from '@/lib/integrations/mappers/mapToOffer';
import { createAuditLog } from '@/lib/audit/auditLogger';
import crypto from 'crypto';

/**
 * Rate limit tracker
 */
const rateLimitTracker = new Map<string, {
  retryAfter: number;
  attempts: number;
  lastAttempt: number;
}>();

/**
 * Exponential backoff calculation
 */
function calculateBackoff(attempt: number): number {
  // 2^attempt * 1000ms, max 5 minutes
  return Math.min(Math.pow(2, attempt) * 1000, 300000);
}

/**
 * Check if supplier should be skipped due to rate limiting
 */
function shouldSkipSupplier(supplierId: string): boolean {
  const tracker = rateLimitTracker.get(supplierId);
  if (!tracker) return false;

  const now = Date.now();
  if (now < tracker.retryAfter) {
    return true;
  }

  // Clear tracker if backoff period has passed
  rateLimitTracker.delete(supplierId);
  return false;
}

/**
 * Record rate limit hit
 */
function recordRateLimit(supplierId: string, retryAfterSeconds?: number) {
  const tracker = rateLimitTracker.get(supplierId) || {
    retryAfter: 0,
    attempts: 0,
    lastAttempt: 0,
  };

  tracker.attempts++;
  tracker.lastAttempt = Date.now();

  // Use server's retry-after if provided, otherwise use exponential backoff
  const backoffMs = retryAfterSeconds 
    ? retryAfterSeconds * 1000 
    : calculateBackoff(tracker.attempts);

  tracker.retryAfter = Date.now() + backoffMs;
  rateLimitTracker.set(supplierId, tracker);

  return backoffMs;
}

/**
 * Decrypt supplier credentials
 */
function decryptCredentials(encrypted: string, iv: string): any {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

/**
 * Fetch offers from supplier API with pagination and rate limiting
 */
async function fetchFromSupplierAPI(supplier: any): Promise<any[]> {
  const allOffers: any[] = [];
  let page = 1;
  let hasMore = true;

  // Decrypt credentials
  const credentials = decryptCredentials(
    supplier.apiCredentials,
    supplier.credentialsIV
  );

  while (hasMore) {
    try {
      const url = new URL(supplier.apiEndpoint);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '100');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const backoffMs = recordRateLimit(
          supplier.id, 
          retryAfter ? parseInt(retryAfter) : undefined
        );

        // Log rate limit event
        await prisma.auditLog.create({
          data: {
            action: 'rate_limit_hit',
            entity: 'supplier',
            entityId: supplier.id,
            supplierId: supplier.id,
            statusCode: 429,
            metadata: JSON.stringify({
              backoffMs,
              retryAfter: retryAfter || 'not provided',
              page,
            }),
          },
        });

        throw new Error(`Rate limited. Retry after ${Math.ceil(backoffMs / 1000)}s`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        allOffers.push(...data);
        hasMore = data.length === 100; // Continue if full page
      } else if (data.offers && Array.isArray(data.offers)) {
        allOffers.push(...data.offers);
        hasMore = data.hasMore || (data.offers.length === 100);
      } else {
        hasMore = false;
      }

      page++;

      // Respect rate limits: add delay between pages
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      }

    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limited')) {
        throw error; // Re-throw rate limit errors
      }
      console.error(`Error fetching page ${page} from ${supplier.name}:`, error);
      break; // Stop pagination on other errors
    }
  }

  return allOffers;
}

/**
 * Sync offers from a single supplier
 */
export async function syncSupplierOffers(supplierId: string): Promise<{
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  error?: string;
}> {
  const startTime = Date.now();
  let jobRun: any = null;

  try {
    // Check rate limit
    if (shouldSkipSupplier(supplierId)) {
      const tracker = rateLimitTracker.get(supplierId)!;
      const waitSeconds = Math.ceil((tracker.retryAfter - Date.now()) / 1000);
      
      return {
        success: false,
        inserted: 0,
        updated: 0,
        failed: 0,
        error: `Rate limited. Retry after ${waitSeconds}s`,
      };
    }

    // Get supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier || !supplier.isActive) {
      return {
        success: false,
        inserted: 0,
        updated: 0,
        failed: 0,
        error: 'Supplier not found or inactive',
      };
    }

    // Create audit log
    await createAuditLog({
      action: 'sync_started',
      entity: 'supplier',
      entityId: supplierId,
      supplierId,
      actor: 'scheduler',
      statusCode: 200,
      metadata: { trigger: 'cron' },
    });

    // Create job run
    jobRun = await prisma.jobRun.create({
      data: {
        supplierId,
        jobId: 'cron-sync',
        status: 'running',
        startedAt: new Date(),
      },
    });

    // Fetch data from supplier
    const supplierOffers = await fetchFromSupplierAPI(supplier);

    if (supplierOffers.length === 0) {
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          duration: Math.floor((Date.now() - startTime) / 1000),
          inserted: 0,
          updated: 0,
          failed: 0,
        },
      });

      return {
        success: true,
        inserted: 0,
        updated: 0,
        failed: 0,
      };
    }

    // Map to normalized format
    const { successful, failed } = mapToOfferBatch(supplierOffers, supplierId);

    // Upsert offers
    let insertedCount = 0;
    let updatedCount = 0;

    for (const offer of successful) {
      try {
        const existing = await prisma.offer.findUnique({
          where: {
            vendor_offer_unique: {
              vendorOfferId: offer.vendorOfferId,
              supplierId: offer.supplierId,
            },
          },
        });

        await prisma.offer.upsert({
          where: {
            vendor_offer_unique: {
              vendorOfferId: offer.vendorOfferId,
              supplierId: offer.supplierId,
            },
          },
          create: offer,
          update: offer,
        });

        if (existing) {
          updatedCount++;
        } else {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Failed to upsert offer ${offer.vendorOfferId}:`, error);
      }
    }

    // Mark old offers as expired
    const activeVendorOfferIds = successful.map(o => o.vendorOfferId);
    
    if (activeVendorOfferIds.length > 0) {
      await prisma.offer.updateMany({
        where: {
          supplierId,
          vendorOfferId: {
            notIn: activeVendorOfferIds,
          },
          status: {
            in: ['new', 'imported', 'active'],
          },
        },
        data: {
          status: 'expired',
        },
      });
    }

    // Update job run
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: 'completed',
        finishedAt: new Date(),
        duration: Math.floor((Date.now() - startTime) / 1000),
        inserted: insertedCount,
        updated: updatedCount,
        failed: failed.length,
        result: JSON.stringify({
          successful: successful.length,
          failed: failed.length,
        }),
      },
    });

    // Create success audit log
    await createAuditLog({
      action: 'sync_completed',
      entity: 'supplier',
      entityId: supplierId,
      supplierId,
      actor: 'scheduler',
      statusCode: 200,
      metadata: {
        inserted: insertedCount,
        updated: updatedCount,
        failed: failed.length,
        duration: Math.floor((Date.now() - startTime) / 1000),
      },
    });

    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failed.length,
    };

  } catch (error) {
    console.error(`Sync error for supplier ${supplierId}:`, error);

    // Update job run as failed
    if (jobRun) {
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          duration: Math.floor((Date.now() - startTime) / 1000),
          error: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      });
    }

    // Create error audit log
    await createAuditLog({
      action: 'sync_failed',
      entity: 'supplier',
      entityId: supplierId,
      supplierId,
      actor: 'scheduler',
      statusCode: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        duration: Math.floor((Date.now() - startTime) / 1000),
      },
    });

    return {
      success: false,
      inserted: 0,
      updated: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync all active suppliers
 */
export async function syncAllSuppliers(): Promise<{
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}> {
  console.log('🔄 Starting supplier sync...');

  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  console.log(`📋 Found ${suppliers.length} active suppliers`);

  let successful = 0;
  let failed = 0;
  let skipped = 0;

  for (const supplier of suppliers) {
    console.log(`🔄 Syncing ${supplier.name}...`);

    const result = await syncSupplierOffers(supplier.id);

    if (result.success) {
      successful++;
      console.log(`✅ ${supplier.name}: +${result.inserted} new, ~${result.updated} updated, ✗${result.failed} failed`);
    } else if (result.error?.includes('Rate limited')) {
      skipped++;
      console.log(`⏳ ${supplier.name}: ${result.error}`);
    } else {
      failed++;
      console.log(`❌ ${supplier.name}: ${result.error}`);
    }

    // Add delay between suppliers to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n📊 Sync complete: ${successful}/${suppliers.length} successful, ${failed} failed, ${skipped} skipped`);

  return {
    total: suppliers.length,
    successful,
    failed,
    skipped,
  };
}

