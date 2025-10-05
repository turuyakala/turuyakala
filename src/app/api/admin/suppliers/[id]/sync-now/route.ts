import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { mapToOfferBatch } from '@/lib/integrations/mappers';
import type { SupplierOfferInput } from '@/lib/integrations/mappers';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';

function decrypt(encryptedText: string): string {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/suppliers/[id]/sync-now
 * Synchronize offers from supplier API
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const startTime = Date.now();
  let jobRun: any = null;

  try {
    // Auth check
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id: supplierId } = await context.params;
    
    // Get supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Tedarikçi bulunamadı' },
        { status: 404 }
      );
    }

    if (!supplier.isActive) {
      return NextResponse.json(
        { error: 'Tedarikçi aktif değil' },
        { status: 400 }
      );
    }

    if (!supplier.apiUrl) {
      return NextResponse.json(
        { error: 'Tedarikçi için API URL tanımlanmamış' },
        { status: 400 }
      );
    }

    // Fetch data from supplier API
    const supplierOffers = await fetchFromSupplierAPI(supplier);

    // Create job run log
    jobRun = await prisma.jobRun.create({
      data: {
        supplierId,
        jobId: 'manual-sync', // Manual sync, no job
        status: 'running',
        startedAt: new Date(),
      },
    });

    if (supplierOffers.length === 0) {
      // Update job run as completed
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

      return NextResponse.json(
        { 
          message: 'Tedarikçiden veri alınamadı',
          inserted: 0,
          updated: 0,
          failed: 0,
        },
        { status: 200 }
      );
    }

    // Map to normalized format
    const { successful, failed } = mapToOfferBatch(supplierOffers, supplierId);

    // Track statistics
    let insertedCount = 0;
    let updatedCount = 0;

    // Upsert offers to database
    for (const offer of successful) {
      try {
        const existing = await prisma.offer.findUnique({
          where: {
            vendorOfferId_supplierId: {
              vendorOfferId: offer.vendorOfferId,
              supplierId: offer.supplierId,
            },
          },
        });

      if (existing) {
        // Update existing offer - set status to 'active'
        await prisma.offer.update({
          where: {
            vendorOfferId_supplierId: {
              vendorOfferId: offer.vendorOfferId,
              supplierId: offer.supplierId,
            },
          },
          data: {
            ...offer,
            status: 'active', // Set as active when synced
            lastSyncedAt: new Date(),
          },
        });
        updatedCount++;
      } else {
        // Insert new offer - set status to 'active'
        await prisma.offer.create({
          data: {
            ...offer,
            status: 'active', // Set as active when created
          },
        });
        insertedCount++;
      }
      } catch (error) {
        console.error(`Failed to upsert offer ${offer.vendorOfferId}:`, error);
        // Continue with next offer
      }
    }

    // Mark offers not in sync as expired
    const activeVendorOfferIds = successful.map(o => o.vendorOfferId);
    
    if (activeVendorOfferIds.length > 0) {
      await prisma.offer.updateMany({
        where: {
          supplierId,
          vendorOfferId: {
            notIn: activeVendorOfferIds,
          },
          status: {
            in: ['new', 'imported'],
          },
        },
        data: {
          status: 'expired',
        },
      });
    }

    // Update job run as completed
    if (jobRun) {
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
            errors: failed.slice(0, 5),
          }),
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Senkronizasyon tamamlandı',
        inserted: insertedCount,
        updated: updatedCount,
        failed: failed.length,
        errors: failed.length > 0 ? failed.slice(0, 5) : undefined, // Only return first 5 errors
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Sync error:', error);

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

    return NextResponse.json(
      { 
        error: 'Senkronizasyon sırasında hata oluştu',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch offers from supplier API
 * Handles pagination if supported
 */
async function fetchFromSupplierAPI(supplier: any): Promise<SupplierOfferInput[]> {
  const allOffers: SupplierOfferInput[] = [];
  let page = 1;
  let hasMore = true;
  const maxPages = 10; // Safety limit

  // Decrypt credentials
  const apiKey = supplier.apiKey ? decrypt(supplier.apiKey) : '';
  const apiSecret = supplier.apiSecret ? decrypt(supplier.apiSecret) : '';
  const username = supplier.username || '';
  const password = supplier.password ? decrypt(supplier.password) : '';

  // Parse additional headers
  let additionalHeaders: Record<string, string> = {};
  if (supplier.additionalHeaders) {
    try {
      additionalHeaders = JSON.parse(supplier.additionalHeaders);
    } catch {
      console.warn('Failed to parse additional headers');
    }
  }

  while (hasMore && page <= maxPages) {
    try {
      // Build URL with pagination
      const url = new URL(supplier.apiUrl);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '100');

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...additionalHeaders,
      };

      // Add authentication
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (apiSecret) {
        headers['X-API-Secret'] = apiSecret;
      } else if (username && password) {
        const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${basicAuth}`;
      }

      // Fetch data
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract offers from response
      // Different suppliers may have different response structures
      let offers: any[] = [];
      
      if (Array.isArray(data)) {
        offers = data;
      } else if (data.offers && Array.isArray(data.offers)) {
        offers = data.offers;
      } else if (data.data && Array.isArray(data.data)) {
        offers = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        offers = data.results;
      } else if (data.items && Array.isArray(data.items)) {
        offers = data.items;
      }

      allOffers.push(...offers);

      // Check if there are more pages
      // Different pagination indicators
      if (data.hasMore === false || data.has_more === false) {
        hasMore = false;
      } else if (data.pagination?.hasNext === false) {
        hasMore = false;
      } else if (offers.length === 0) {
        hasMore = false;
      } else if (offers.length < 100) {
        // If less than page limit, probably last page
        hasMore = false;
      } else if (data.total && allOffers.length >= data.total) {
        hasMore = false;
      } else {
        // Continue to next page
        page++;
      }

    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      // Stop pagination on error
      hasMore = false;
    }
  }

  console.log(`Fetched ${allOffers.length} offers from ${supplier.name} (${page - 1} pages)`);

  return allOffers;
}

