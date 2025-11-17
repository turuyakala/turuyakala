import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().optional().or(z.literal('')),
  tcKimlikNo: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  birthDate: z.string().optional().or(z.literal('')),
  passportNumber: z.string().optional().or(z.literal('')),
  passportExpiry: z.string().optional().or(z.literal('')),
  addressCountry: z.string().optional().or(z.literal('')),
  addressProvince: z.string().optional().or(z.literal('')),
  addressDistrict: z.string().optional().or(z.literal('')),
  addressPostalCode: z.string().optional().or(z.literal('')),
  addressLine1: z.string().optional().or(z.literal('')),
  addressLine2: z.string().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, tcKimlikNo, gender, birthDate, passportNumber, passportExpiry, addressCountry, addressProvince, addressDistrict, addressPostalCode, addressLine1, addressLine2 } = validation.data;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name,
        email,
        phone: phone || null,
        tcKimlikNo: tcKimlikNo || null,
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        passportNumber: passportNumber || null,
        passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
        addressCountry: addressCountry || null,
        addressProvince: addressProvince || null,
        addressDistrict: addressDistrict || null,
        addressPostalCode: addressPostalCode || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
      },
    });

    return NextResponse.json(
      { message: 'Bilgiler başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Bilgiler güncellenemedi' },
      { status: 500 }
    );
  }
}

