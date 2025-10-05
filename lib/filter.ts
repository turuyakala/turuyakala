import { Item, FilterParams } from './types';

/**
 * Filters items based on given parameters
 */
export function filterItems(items: Item[], filters: FilterParams): Item[] {
  let filtered = [...items];

  // Filter by time window
  if (filters.windowHours) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + filters.windowHours * 60 * 60 * 1000);

    filtered = filtered.filter((item) => {
      const startDate = new Date(item.startAt);
      return startDate >= now && startDate <= windowEnd;
    });
  }

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((item) => item.category === filters.category);
  }

  // Filter by origin
  if (filters.from) {
    const fromLower = filters.from.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.from.toLowerCase().includes(fromLower)
    );
  }

  // Filter by destination
  if (filters.to) {
    const toLower = filters.to.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.to.toLowerCase().includes(toLower)
    );
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((item) => item.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((item) => item.price <= filters.maxPrice!);
  }

  return filtered;
}

/**
 * Get unique values for a field (for dropdowns)
 */
export function getUniqueValues(items: Item[], field: 'from' | 'to'): string[] {
  const values = new Set<string>();
  items.forEach((item) => {
    values.add(item[field]);
  });
  return Array.from(values).sort();
}

/**
 * Get price range from items
 */
export function getPriceRange(items: Item[]): { min: number; max: number } {
  if (items.length === 0) {
    return { min: 0, max: 10000 };
  }

  const prices = items.map((item) => item.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

