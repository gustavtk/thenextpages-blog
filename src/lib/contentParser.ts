
/**
 * Splits content into parts for middle ad injection
 * @param htmlContent - The original HTML content from WordPress
 * @returns Object with beforeAd and afterAd content
 */
export function splitContentForMiddleAd(htmlContent: string): { beforeAd: string; afterAd: string } {
  // Parse the HTML content
  const paragraphs = htmlContent.split('</p>');
  
  // Only split if we have enough paragraphs (at least 4)
  if (paragraphs.length < 4) {
    return { beforeAd: htmlContent, afterAd: '' };
  }

  // Find the optimal insertion point (roughly middle of content)
  const insertionPoint = Math.floor(paragraphs.length / 2);
  
  // Split content at insertion point
  const beforeAd = paragraphs.slice(0, insertionPoint).join('</p>') + (paragraphs.slice(0, insertionPoint).length > 0 ? '</p>' : '');
  const afterAd = paragraphs.slice(insertionPoint).join('</p>');
  
  return { beforeAd, afterAd };
}

/**
 * Counts the number of words in HTML content (excluding HTML tags)
 * @param htmlContent - HTML content to count words in
 * @returns Number of words
 */
export function getWordCount(htmlContent: string): number {
  // Remove HTML tags and count words
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Estimates reading time based on word count
 * @param wordCount - Number of words in the content
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): string {
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Checks if content is long enough to benefit from middle ad injection
 * @param htmlContent - HTML content to check
 * @returns True if content should have middle ad
 */
export function shouldInjectMiddleAd(htmlContent: string): boolean {
  const wordCount = getWordCount(htmlContent);
  const paragraphCount = (htmlContent.match(/<\/p>/g) || []).length;
  
  // Only inject for articles with substantial content
  return wordCount >= 300 && paragraphCount >= 4;
}