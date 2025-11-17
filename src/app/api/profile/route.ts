import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        tcKimlikNo: true,
        gender: true,
        birthDate: true,
        passportNumber: true,
        passportExpiry: true,
        addressCountry: true,
        addressProvince: true,
        addressDistrict: true,
        addressPostalCode: true,
        addressLine1: true,
        addressLine2: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Profil bilgileri alınamadı' },
      { status: 500 }
    );
  }
}




