import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for webhook payload
 * This is used by suppliers to sign their webhook requests
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify HMAC-SHA256 signature
 * Returns true if signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    // timingSafeEqual throws if buffers have different lengths
    return false;
  }
}

/**
 * Generate a secure webhook secret
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Example webhook payload creator (for testing/documentation)
 */
export function createWebhookPayload(
  event: 'offer.created' | 'offer.updated' | 'offer.deleted' | 'offer.expired',
  data: any
): string {
  return JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data,
  });
}

