import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Hero slides'ları getir
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { key: 'hero_slides' },
    });

    if (!settings) {
      // Default slides döndür
      return NextResponse.json({
        slides: [
          {
            id: 1,
            image: '/images/hero-1.jpg',
            title: 'Turu Yakala',
            subtitle: 'Son dakikada, en doğru fırsatla!',
            description: 'Muhteşem turlarda son dakika fırsatlarını kaçırmayın'
          },
          {
            id: 2,
            image: '/images/hero-2.jpg',
            title: 'Son Dakika Turları',
            subtitle: 'En son kalan koltukları kaçırmayın',
          },
          {
            id: 3,
            image: '/images/hero-3.jpg',
            title: 'Sürpriz Turlar',
            subtitle: 'Avrupa, Asya, Afrika ve daha fazlası ',
            description: 'Her gün yenilenen sürpriz turlarla mümkün!'
          },
          {
            id: 4,
            image: '/images/hero-4.jpg',
            title: 'Hemen Rezervasyon Yap',
            subtitle: 'Son koltuklar dolmadan',
            description: ''
          }
        ]
      });
    }

    const slides = JSON.parse(settings.value);
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json({ error: 'Slides yüklenemedi' }, { status: 500 });
  }
}

// POST/PUT - Hero slides'ları güncelle
export async function POST(request: NextRequest) {
  try {
    const { requireAdmin } = await import('@/lib/middleware/admin');
    await requireAdmin();

    const body = await request.json();
    const { slides } = body;

    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: 'Slides bir array olmalıdır' }, { status: 400 });
    }

    await prisma.siteSettings.upsert({
      where: { key: 'hero_slides' },
      update: {
        value: JSON.stringify(slides),
        updatedAt: new Date(),
      },
      create: {
        key: 'hero_slides',
        value: JSON.stringify(slides),
      },
    });

    return NextResponse.json({ message: 'Hero slides güncellendi', slides });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }
    console.error('Error updating hero slides:', error);
    return NextResponse.json({ error: 'Slides güncellenemedi' }, { status: 500 });
  }
}

