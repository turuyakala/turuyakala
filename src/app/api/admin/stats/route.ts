import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Calculate stats
    const totalTours = await prisma.inventoryItem.count();
    const totalUsers = await prisma.user.count();
    
    // Last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentTours = await prisma.inventoryItem.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    });

    // Critical tours (low seats)
    const criticalTours = await prisma.inventoryItem.findMany({
      where: {
        seatsLeft: {
          lte: 2,
        },
      },
      orderBy: {
        seatsLeft: 'asc',
      },
      take: 5,
    });

    // Upcoming tours (next 24 hours)
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingTours = await prisma.inventoryItem.findMany({
      where: {
        startAt: {
          gte: now,
          lte: next24Hours,
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    // Category distribution
    const toursByCategory = await prisma.inventoryItem.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    return NextResponse.json({
      totalTours,
      totalUsers,
      recentTours,
      criticalTours,
      upcomingTours,
      toursByCategory,
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'İstatistikler yüklenemedi' }, { status: 500 });
  }
}

