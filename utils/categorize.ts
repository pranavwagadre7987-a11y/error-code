/**
 * Category detection based on keyword matching
 */

export const CATEGORY_KEYWORDS = {
  food: [
    'biryani', 'restaurant', 'swiggy', 'zomato', 'food', 'cafe', 'baker',
    'sweet', 'snack', 'domino', 'burger', 'kitchen', 'dhokla', 'coffee',
    'panipoori', 'pizza', 'meal', 'lunch', 'dinner', 'breakfast', 'juice',
    'tea', 'bakery', 'diner', 'cafe', 'bistro', 'grill',
  ],
  medical: [
    'medical', 'pharma', 'hospital', 'clinic', 'health', 'doctor', 'medicine',
    'pharmacy', 'ayurveda', 'lab', 'test', 'vaccine', 'dental',
  ],
  shopping: [
    'jeans', 'mobile', 'watch', 'store', 'mart', 'shop', 'amazon', 'flipkart',
    'fashion', 'apparel', 'cloth', 'shoe', 'boot', 'shirt', 'pant', 'dress',
    'retail', 'mall', 'market',
  ],
  travel: [
    'goibibo', 'metro', 'irctc', 'makemytrip', 'uber', 'ola', 'ekart',
    'flight', 'bus', 'train', 'taxi', 'auto', 'bike', 'travel', 'transport',
    'hotel', 'booking',
  ],
  utilities: [
    'mngl', 'mseb', 'electricity', 'gas', 'water', 'power', 'bill', 'internet',
    'phone', 'broadband', 'mobile recharge', 'dth', 'cable',
  ],
  savings: [
    'gold saved', 'gold sold', 'investment', 'mutual fund', 'stock', 'sip',
    'saving', 'fdmaturity', 'fddepositmaturity',
  ],
};

export type CategoryKey = keyof typeof CATEGORY_KEYWORDS;

/**
 * Detect category from counterparty name or description
 * Returns category key or 'transfers' if no match
 */
export function detectCategory(
  description: string,
  counterparty: string
): string {
  const text = `${description} ${counterparty}`.toLowerCase();

  for (const [categoryKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return categoryKey;
      }
    }
  }

  // Default to transfers
  return 'transfers';
}

/**
 * Map category name to app category ID
 */
export function mapCategoryToId(category: string): string {
  const categoryMap: Record<string, string> = {
    food: '2',
    medical: '4',
    shopping: '5',
    travel: '3',
    utilities: '1',
    savings: '6',
    transfers: '8',
  };
  return categoryMap[category] || '8'; // Default to 'Other'
}

/**
 * Get category name for display
 */
export function getCategoryName(category: string): string {
  const nameMap: Record<string, string> = {
    food: 'Food',
    medical: 'Health',
    shopping: 'Shopping',
    travel: 'Transport',
    utilities: 'Housing',
    savings: 'Savings',
    transfers: 'Other',
  };
  return nameMap[category] || 'Other';
}

/**
 * Get category icon for display
 */
export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    food: '🍱',
    medical: '💊',
    shopping: '🛍️',
    travel: '🚌',
    utilities: '🏠',
    savings: '💰',
    transfers: '📦',
  };
  return iconMap[category] || '📦';
}
