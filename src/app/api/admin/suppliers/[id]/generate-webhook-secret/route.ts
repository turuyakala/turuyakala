import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWebhookSecret } from '@/lib/webhooks/webhookUtils';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/suppliers/[id]/generate-webhook-secret
 * Generate a new webhook secret for supplier
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id: supplierId } = await context.params;

    // Generate new webhook secret
    const webhookSecret = generateWebhookSecret();

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: { webhookSecret },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        action: 'webhook_secret_generated',
        entity: 'supplier',
        entityId: supplierId,
        supplierId,
        userId: (session.user as any).id,
        metadata: JSON.stringify({
          supplierName: supplier.name,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        webhookSecret,
        message: 'Webhook secret generated',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Generate webhook secret error:', error);
    return NextResponse.json(
      { error: 'Secret oluşturulamadı' },
      { status: 500 }
    );
  }
}

