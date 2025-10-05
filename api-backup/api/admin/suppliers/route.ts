import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Simple encryption (In production, use proper encryption library like @aws-crypto/client-node)
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
  integrationMode: z.enum(['pull', 'push', 'csv'], {
    errorMap: () => ({ message: 'Geçerli bir entegrasyon modu seçin' }),
  }),
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

// GET - List all suppliers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });

    // Mask sensitive fields
    const maskedSuppliers = suppliers.map(s => ({
      ...s,
      apiKey: s.apiKey ? maskSecret(decrypt(s.apiKey)) : null,
      apiSecret: s.apiSecret ? maskSecret(decrypt(s.apiSecret)) : null,
      password: s.password ? '********' : null,
    }));

    return NextResponse.json({ suppliers: maskedSuppliers }, { status: 200 });
  } catch (error) {
    console.error('Suppliers fetch error:', error);
    return NextResponse.json({ error: 'Tedarikçiler yüklenemedi' }, { status: 500 });
  }
}

// POST - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

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

    // Check if supplier name already exists
    const existing = await prisma.supplier.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bu tedarikçi adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Encrypt sensitive fields
    const supplier = await prisma.supplier.create({
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
      { message: 'Tedarikçi başarıyla eklendi', supplier: response },
      { status: 201 }
    );
  } catch (error) {
    console.error('Supplier creation error:', error);
    return NextResponse.json(
      { error: 'Tedarikçi eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

