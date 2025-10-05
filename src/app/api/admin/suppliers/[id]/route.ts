import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';

function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

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

function maskSecret(secret: string): string {
  if (!secret || secret.length < 4) return '****';
  return secret.substring(0, 4) + '*'.repeat(secret.length - 4);
}

const supplierSchema = z.object({
  name: z.string().min(2, 'Tedarikçi adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  integrationMode: z.enum(['pull', 'push', 'csv']),
  apiUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  apiKey: z.string().optional().or(z.literal('')),
  apiSecret: z.string().optional().or(z.literal('')),
  username: z.string().optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')),
  additionalHeaders: z.string().optional().or(z.literal('')),
  healthcheckUrl: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  healthcheckMethod: z.enum(['GET', 'POST']).default('GET'),
  isActive: z.boolean().default(true),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get single supplier
export async function GET(request: NextRequest, context: RouteContext) {
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

    // Decrypt and return for editing (full values, not masked)
    const decryptedSupplier = {
      ...supplier,
      apiKey: supplier.apiKey ? decrypt(supplier.apiKey) : '',
      apiSecret: supplier.apiSecret ? decrypt(supplier.apiSecret) : '',
      password: supplier.password ? decrypt(supplier.password) : '',
    };

    return NextResponse.json(decryptedSupplier, { status: 200 });
  } catch (error) {
    console.error('Supplier fetch error:', error);
    return NextResponse.json({ error: 'Tedarikçi yüklenemedi' }, { status: 500 });
  }
}

// PATCH - Update supplier
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validation = supplierSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if name is being changed and if it's already taken
    const existing = await prisma.supplier.findFirst({
      where: { 
        name: data.name,
        id: { not: id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bu tedarikçi adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Update supplier
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        integrationMode: data.integrationMode,
        apiUrl: data.apiUrl || null,
        apiKey: data.apiKey ? encrypt(data.apiKey) : null,
        apiSecret: data.apiSecret ? encrypt(data.apiSecret) : null,
        username: data.username || null,
        password: data.password ? encrypt(data.password) : null,
        additionalHeaders: data.additionalHeaders || null,
        healthcheckUrl: data.healthcheckUrl || null,
        healthcheckMethod: data.healthcheckMethod,
        isActive: data.isActive,
      },
    });

    // Return with masked sensitive fields
    const response = {
      ...supplier,
      apiKey: supplier.apiKey ? maskSecret(data.apiKey || '') : null,
      apiSecret: supplier.apiSecret ? maskSecret(data.apiSecret || '') : null,
      password: supplier.password ? '********' : null,
    };

    return NextResponse.json(
      { message: 'Tedarikçi güncellendi', supplier: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Supplier update error:', error);
    return NextResponse.json({ error: 'Tedarikçi güncellenirken hata oluştu' }, { status: 500 });
  }
}

// DELETE - Delete supplier
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Tedarikçi silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Supplier delete error:', error);
    return NextResponse.json({ error: 'Tedarikçi silinirken hata oluştu' }, { status: 500 });
  }
}

