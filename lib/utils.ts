// Güvenli sayıya çevirme helper'ı
export const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// Güvenli string helper'ı
export const toString = (v: unknown, fallback = ''): string => {
  return typeof v === 'string' ? v : fallback;
};

// Güvenli boolean helper'ı
export const toBool = (v: unknown, fallback = false): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return fallback;
};

// Güvenli array helper'ı
export const toArray = <T>(v: unknown, fallback: T[] = []): T[] => {
  return Array.isArray(v) ? v : fallback;
};

// Güvenli object helper'ı
export const toObject = <T extends Record<string, any>>(v: unknown, fallback: T): T => {
  return (typeof v === 'object' && v !== null && !Array.isArray(v)) ? v as T : fallback;
};
