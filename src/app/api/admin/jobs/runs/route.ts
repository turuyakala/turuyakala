import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const runs = await prisma.jobRun.findMany({
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        job: {
          select: {
            jobType: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 50, // Last 50 runs
    });

    return NextResponse.json({ runs }, { status: 200 });
  } catch (error) {
    console.error('Job runs fetch error:', error);
    return NextResponse.json({ error: 'Çalıştırma logları yüklenemedi' }, { status: 500 });
  }
}

