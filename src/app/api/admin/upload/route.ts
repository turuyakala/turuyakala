import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    // Dosya adını oluştur (timestamp + random string)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `tour-${timestamp}-${randomString}.${fileExtension}`;

    // public/images klasörünü oluştur (yoksa)
    const uploadDir = join(process.cwd(), 'public', 'images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL'i döndür
    const fileUrl = `/images/${fileName}`;

    return NextResponse.json(
      { url: fileUrl, fileName },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('File upload error:', error);
    
    // Admin kontrolü hatası
    if (error.message?.includes('auth') || error.message?.includes('admin')) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

