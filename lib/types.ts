export type Category = 'tour' | 'bus' | 'flight' | 'cruise';

export type Item = {
  id: string;
  category: Category;
  title: string;
  from: string;
  to: string;
  startAt: string; // ISO string
  seatsLeft: number;
  price: number;
  originalPrice?: number; // Asıl fiyat (indirim öncesi)
  discountPercentage?: number; // İndirim oranı (yüzde olarak, örn: 25 = %25)
  currency: 'TRY' | 'EUR' | 'USD';
  supplier: string;
  contact?: {
    phone?: string;
    whatsapp?: string;
  };
  terms?: string;
  image?: string;
  createdAt?: string; // ISO string
  transport?: string;
  isSurprise?: boolean; // Sürpriz tur
  requiresVisa?: boolean; // Vize gerekli mi?
  requiresPassport?: boolean; // Pasaport gerekli mi?
  // Yeni alanlar
  images?: string[]; // Galeri için birden fazla fotoğraf
  description?: string; // Detaylı açıklama
  program?: string[]; // Günlük program
  included?: string[]; // Dahil olanlar
  excluded?: string[]; // Dahil olmayanlar
  importantInfo?: string[]; // Önemli bilgiler
  departureLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
  destinationLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
};

export type FilterParams = {
  category?: Category | 'all';
  from?: string;
  to?: string;
  windowHours?: number;
  minPrice?: number;
  maxPrice?: number;
};

