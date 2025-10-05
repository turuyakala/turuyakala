import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/contact
 * Create a new contact message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ 
        error: 'Tüm alanlar zorunludur' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Geçerli bir e-posta adresi girin' 
      }, { status: 400 });
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json({ 
        error: 'Mesaj en az 10 karakter olmalıdır' 
      }, { status: 400 });
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'new',
      },
    });

    return NextResponse.json({
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      id: contactMessage.id,
    }, { status: 201 });

  } catch (error) {
    console.error('Contact message creation error:', error);
    return NextResponse.json({ 
      error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' 
    }, { status: 500 });
  }
}
