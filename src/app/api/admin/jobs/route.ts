import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const jobs = await prisma.fetchJob.findMany({
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            runs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json({ error: 'Görevler yüklenemedi' }, { status: 500 });
  }
}

