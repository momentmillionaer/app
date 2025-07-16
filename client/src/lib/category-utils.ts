// Utility function to extract emojis from category names
export function extractCategoryEmoji(categoryName: string): string {
  if (!categoryName) return '🎉';
  
  // Find the first emoji in the category name using a simpler approach
  const emojiMatch = categoryName.match(/[\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u);
  
  if (emojiMatch) {
    return emojiMatch[0];
  }
  
  // Fallback: try to find common emoji patterns
  const lowerName = categoryName.toLowerCase();
  
  // Map common German/English words to emojis
  if (lowerName.includes('dating') || lowerName.includes('liebe')) return '❤️';
  if (lowerName.includes('festival') || lowerName.includes('fest')) return '🃏';
  if (lowerName.includes('kulinarik') || lowerName.includes('food') || lowerName.includes('essen')) return '🍽️';
  if (lowerName.includes('sport') || lowerName.includes('fitness')) return '🧘🏼‍♂️';
  if (lowerName.includes('show') || lowerName.includes('theater') || lowerName.includes('kino')) return '🍿';
  if (lowerName.includes('kunst') || lowerName.includes('art')) return '🎨';
  if (lowerName.includes('musik') || lowerName.includes('music')) return '🎵';
  if (lowerName.includes('workshop') || lowerName.includes('lernen')) return '📚';
  if (lowerName.includes('business') || lowerName.includes('networking')) return '💼';
  if (lowerName.includes('natur') || lowerName.includes('outdoor')) return '🌲';
  if (lowerName.includes('tech') || lowerName.includes('digital')) return '💻';
  if (lowerName.includes('reise') || lowerName.includes('travel')) return '✈️';
  if (lowerName.includes('gesundheit') || lowerName.includes('wellness')) return '💆';
  
  return '🎉'; // Default fallback
}

// Function to get all category emojis from an event
export function getCategoryEmojis(categories: string[] | undefined): string[] {
  if (!categories || categories.length === 0) return ['🎉'];
  
  return categories.map(category => extractCategoryEmoji(category));
}
