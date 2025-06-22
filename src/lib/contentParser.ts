
/**
 * Injects a middle ad into article content at the optimal position
 * @param htmlContent - The original HTML content from WordPress
 * @returns Modified HTML with middle ad injected
 */
export function injectMiddleAd(htmlContent: string): string {
  // Don't inject if no content or ad configuration
  if (!htmlContent || !process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD) {
    return htmlContent;
  }

  // Parse the HTML content
  const paragraphs = htmlContent.split('</p>');
  
  // Only inject if we have enough paragraphs (at least 4)
  if (paragraphs.length < 4) {
    return htmlContent;
  }

  // Find the optimal insertion point (roughly middle of content)
  const insertionPoint = Math.floor(paragraphs.length / 2);
  
  // Create the middle ad HTML
  const middleAdHtml = `
    <div class="middle-ad-container" style="width: 100%; margin: 2rem 0; display: flex; justify-content: center;">
      <div style="max-width: 100%; width: 100%;">
        <div style="background-color: #f9fafb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
          <div style="font-size: 0.75rem; color: #6b7280; text-align: center; margin-bottom: 0.5rem;">Advertisement</div>
          <ins class="adsbygoogle"
               style="display: block; width: 100%; height: 300px;"
               data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}"
               data-ad-slot="${process.env.NEXT_PUBLIC_ADSENSE_MIDDLE_AD}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </div>
    </div>
  `;

  // Insert the ad after the calculated paragraph
  paragraphs.splice(insertionPoint, 0, middleAdHtml);
  
  // Rejoin the content
  return paragraphs.join('</p>');
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