import { NextRequest, NextResponse } from 'next/server';
import { generateWebhookSignature, createWebhookPayload } from '@/lib/webhooks/webhookUtils';

/**
 * POST /api/test/send-webhook
 * Test endpoint to simulate supplier webhook
 * 
 * Body:
 * {
 *   "supplierId": "supplier-1",
 *   "webhookSecret": "secret-from-supplier-settings",
 *   "event": "offer.created",
 *   "data": { ... offer data ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, webhookSecret, event, data } = body;

    if (!supplierId || !webhookSecret || !event || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: supplierId, webhookSecret, event, data' },
        { status: 400 }
      );
    }

    // Create webhook payload
    const payload = createWebhookPayload(event, data);

    // Generate signature
    const signature = generateWebhookSignature(payload, webhookSecret);

    // Send to webhook endpoint
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/suppliers/${supplierId}/webhook`;

    console.log('📤 Sending webhook to:', webhookUrl);
    console.log('📝 Payload:', payload);
    console.log('🔐 Signature:', signature);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
      body: payload,
    });

    const responseData = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      webhookUrl,
      payload: JSON.parse(payload),
      signature,
      response: responseData,
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

