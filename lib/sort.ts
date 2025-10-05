import { Item } from './types';

export type SortBy = 
  | 'price-asc'
  | 'price-desc'
  | 'departure-asc'
  | 'departure-desc'
  | 'seats-asc'
  | 'seats-desc'
  | 'newest';

export const sortOptions = [
  { value: 'departure-asc', label: 'Kalkış saati en yakın (ilk kalkacaklar)' },
  { value: 'price-asc', label: 'Fiyata göre artan (En ucuz → En pahalı)' },
  { value: 'price-desc', label: 'Fiyata göre azalan (En pahalı → En ucuz)' },
  { value: 'departure-desc', label: 'Kalkış saati en uzak (son kalkacaklar)' },
  { value: 'seats-asc', label: 'En az koltuk kalan (kritik fırsatlar önce)' },
  { value: 'seats-desc', label: 'En çok koltuk kalan' },
  { value: 'newest', label: 'Yeni eklenen fırsatlar' },
];

/**
 * Sorts items based on the given criteria
 */
export function sortItems(items: Item[], sortBy: SortBy = 'departure-asc'): Item[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'departure-asc':
      // Sort by time until departure (ascending - soonest first)
      sorted.sort((a, b) => {
        const dateA = new Date(a.startAt).getTime();
        const dateB = new Date(b.startAt).getTime();
        return dateA - dateB;
      });
      break;

    case 'departure-desc':
      // Sort by time until departure (descending - latest first)
      sorted.sort((a, b) => {
        const dateA = new Date(a.startAt).getTime();
        const dateB = new Date(b.startAt).getTime();
        return dateB - dateA;
      });
      break;

    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;

    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;

    case 'seats-asc':
      // Fewer seats first (most urgent)
      sorted.sort((a, b) => a.seatsLeft - b.seatsLeft);
      break;

    case 'seats-desc':
      // More seats first
      sorted.sort((a, b) => b.seatsLeft - a.seatsLeft);
      break;

    case 'newest':
      // Sort by creation date (newest first)
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;

    default:
      // Default to departure ascending
      sorted.sort((a, b) => {
        const dateA = new Date(a.startAt).getTime();
        const dateB = new Date(b.startAt).getTime();
        return dateA - dateB;
      });
  }

  return sorted;
}

