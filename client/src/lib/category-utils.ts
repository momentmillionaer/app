// Utility function to extract emojis from category names
export function extractCategoryEmoji(categoryName: string): string {
  if (!categoryName) return '🎉';
  
  // Direct mapping for known categories from the Notion database
  const categoryMappings: { [key: string]: string } = {
    '🧘🏼‍♂️ Sport': '🏃',
    '🍽️ Kulinarik': '🍽️',
    '❤️ Dating': '❤️',
    '🃏 Festivals Feste Märkte': '🎪',
    '🍿 Shows': '🎭',
    '🎨 Kunst': '🎨',
    '🎵 Musik': '🎵',
    '📚 Workshop': '📚',
    '💼 Business': '💼',
    '🌲 Natur': '🌲',
    '💻 Tech': '💻',
    '✈️ Reise': '✈️',
    '💆 Wellness': '💆',
    '🛒 Märkte': '🛒'
  };
  
  // Check if we have a direct mapping for this category
  if (categoryMappings[categoryName]) {
    return categoryMappings[categoryName];
  }
  
  // Try to extract the first emoji using a simple character approach
  const chars = Array.from(categoryName);
  for (const char of chars) {
    // Check if character is an emoji
    const codePoint = char.codePointAt(0);
    if (codePoint) {
      // Basic emoji ranges (excluding complex modifiers)
      if ((codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Misc symbols
          (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
          (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport
          (codePoint >= 0x1F700 && codePoint <= 0x1F77F) || // Alchemical
          (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) || // Geometric shapes
          (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) || // Supplemental arrows
          (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) || // Supplemental symbols
          (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Misc symbols
          (codePoint >= 0x2700 && codePoint <= 0x27BF)) {   // Dingbats
        return char;
      }
    }
  }
  
  // Fallback based on keywords
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('sport') || lowerName.includes('fitness') || lowerName.includes('yoga')) return '🏃';
  if (lowerName.includes('dating') || lowerName.includes('liebe')) return '❤️';
  if (lowerName.includes('festival') || lowerName.includes('fest')) return '🎪';
  if (lowerName.includes('kulinarik') || lowerName.includes('food') || lowerName.includes('essen')) return '🍽️';
  if (lowerName.includes('show') || lowerName.includes('theater') || lowerName.includes('kino')) return '🎭';
  if (lowerName.includes('kunst') || lowerName.includes('art')) return '🎨';
  if (lowerName.includes('musik') || lowerName.includes('music')) return '🎵';
  
  return '🎉'; // Default fallback
}

// Function to get all category emojis from an event
export function getCategoryEmojis(categories: string[] | undefined): string[] {
  if (!categories || categories.length === 0) return ['🎉'];
  
  return categories.map(category => extractCategoryEmoji(category));
}
