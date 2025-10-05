import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const supplierId = searchParams.get('supplierId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (action) where.action = action;
    if (supplierId) where.supplierId = supplierId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json({ error: 'Audit logları yüklenemedi' }, { status: 500 });
  }
}

