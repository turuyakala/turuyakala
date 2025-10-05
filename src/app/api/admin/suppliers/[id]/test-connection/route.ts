import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

// POST - Test supplier connection
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Tedarikçi bulunamadı' }, { status: 404 });
    }

    if (!supplier.healthcheckUrl) {
      return NextResponse.json(
        { error: 'Healthcheck URL tanımlanmamış' },
        { status: 400 }
      );
    }

    // Prepare request
    const startTime = Date.now();
    let status = 'failed';
    let message = '';
    let responseTime = 0;

    try {
      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authentication headers
      if (supplier.apiKey) {
        headers['X-API-Key'] = decrypt(supplier.apiKey);
      }

      if (supplier.username && supplier.password) {
        const auth = Buffer.from(
          `${supplier.username}:${decrypt(supplier.password)}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }

      // Add additional headers if provided
      if (supplier.additionalHeaders) {
        try {
          const additional = JSON.parse(supplier.additionalHeaders);
          Object.assign(headers, additional);
        } catch {
          // Ignore invalid JSON
        }
      }

      // Make request
      const response = await fetch(supplier.healthcheckUrl, {
        method: supplier.healthcheckMethod,
        headers,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      responseTime = Date.now() - startTime;

      if (response.ok) {
        status = 'success';
        message = `Bağlantı başarılı (${response.status}) - ${responseTime}ms`;
      } else {
        status = 'failed';
        message = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error: any) {
      responseTime = Date.now() - startTime;
      status = 'failed';
      
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        message = 'Zaman aşımı: Bağlantı 10 saniyede yanıt vermedi';
      } else if (error.code === 'ENOTFOUND') {
        message = 'DNS hatası: Host bulunamadı';
      } else if (error.code === 'ECONNREFUSED') {
        message = 'Bağlantı reddedildi';
      } else {
        message = `Hata: ${error.message}`;
      }
    }

    // Update supplier with healthcheck result
    await prisma.supplier.update({
      where: { id },
      data: {
        lastHealthcheck: new Date(),
        healthcheckStatus: status,
        healthcheckMessage: message,
      },
    });

    return NextResponse.json(
      {
        status,
        message,
        responseTime,
        timestamp: new Date().toISOString(),
      },
      { status: status === 'success' ? 200 : 400 }
    );
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { error: 'Bağlantı testi sırasında hata oluştu' },
      { status: 500 }
    );
  }
}

