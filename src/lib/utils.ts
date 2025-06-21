import { Article } from './articleData';

// Category color mapping  
export function getCategoryColor(category: Article['category']): string {
  const colors = {
    AI: 'text-blue-600',
    MAPS: 'text-green-600', 
    ANDROID: 'text-blue-600'
  };
  return colors[category];
}

// Generate article image based on category
export function getArticleImage(category: Article['category']): string {
  const images = {
    AI: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4285f4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#34a853;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#aiGrad)"/>
        <circle cx="120" cy="80" r="30" fill="rgba(255,255,255,0.2)"/>
        <circle cx="280" cy="120" r="40" fill="rgba(255,255,255,0.1)"/>
        <path d="M200 60 L220 100 L180 100 Z" fill="rgba(255,255,255,0.3)"/>
      </svg>
    `)}`,
    MAPS: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mapsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#34a853;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fbbc05;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#mapsGrad)"/>
        <path d="M200 50 L250 100 L200 150 L150 100 Z" fill="rgba(255,255,255,0.2)"/>
        <circle cx="200" cy="100" r="15" fill="rgba(255,255,255,0.4)"/>
      </svg>
    `)}`,
    ANDROID: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="androidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#34a853;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4285f4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#androidGrad)"/>
        <rect x="150" y="70" width="100" height="60" rx="30" fill="rgba(255,255,255,0.2)"/>
        <circle cx="175" cy="90" r="5" fill="rgba(255,255,255,0.4)"/>
        <circle cx="225" cy="90" r="5" fill="rgba(255,255,255,0.4)"/>
      </svg>
    `)}`
  };
  return images[category];
}

// Format date consistently
export function formatDate(dateString: string): string {
  return dateString;
}

// Generate article URL
export function getArticleUrl(slug: string): string {
  return `/article/${slug}`;
}