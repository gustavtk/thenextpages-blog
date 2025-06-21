// WordPress REST API utilities
const WP_API_URL = 'https://www.thenextpages.com/wp-json/wp/v2';

// Types matching WordPress REST API responses
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  categories: number[];
  tags: number[];
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WPPage {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
}

export interface WPMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  author: number;
  caption: { rendered: string };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        source_url: string;
      };
    };
  };
  source_url: string;
}

export interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
}

export interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
  classes: string[];
  parent: number;
  menu_order: number;
  object: string;
  object_id: number;
  type: string;
  type_label: string;
}

export interface WPMenu {
  id: number;
  name: string;
  slug: string;
  locations: string[];
  items: WPMenuItem[];
}

// Interface for embedded data
interface WPPostWithEmbedded extends WPPost {
  _embedded?: {
    'wp:term'?: Array<Array<{ name: string; slug: string; id: number }>>;
    'wp:featuredmedia'?: Array<{ 
      source_url: string; 
      media_details?: { 
        sizes?: { 
          thumbnail?: { source_url: string };
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
          [key: string]: { source_url: string } | undefined;
        } 
      } 
    }>;
    author?: Array<{ name: string }>;
  };
}

// Fetch functions
export async function fetchPosts(params?: {
  per_page?: number;
  page?: number;
  categories?: number[];
  categories_exclude?: number[];
  tags?: number[];
  orderby?: string;
  order?: 'asc' | 'desc';
  search?: string;
  _embed?: boolean;
  exclude?: number[];
}): Promise<WPPost[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.categories) queryParams.append('categories', params.categories.join(','));
  if (params?.categories_exclude) queryParams.append('categories_exclude', params.categories_exclude.join(','));
  if (params?.tags) queryParams.append('tags', params.tags.join(','));
  if (params?.orderby) queryParams.append('orderby', params.orderby);
  if (params?.order) queryParams.append('order', params.order);
  if (params?.search) queryParams.append('search', params.search);
  if (params?._embed) queryParams.append('_embed', '');
  if (params?.exclude) queryParams.append('exclude', params.exclude.join(','));

  const url = `${WP_API_URL}/posts?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    // Try to get more details about the error
    let errorDetails = '';
    try {
      const errorBody = await response.text();
      errorDetails = ` - ${errorBody}`;
    } catch {
      errorDetails = '';
    }
    
    console.error(`WordPress API Error: ${response.status} ${response.statusText}${errorDetails}`);
    console.error('Request URL:', url);
    console.error('Request params:', params);
    
    throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}${errorDetails}`);
  }
  
  return response.json();
}

export async function fetchPost(slug: string, _embed: boolean = true): Promise<WPPost | null> {
  const queryParams = new URLSearchParams({ slug });
  if (_embed) queryParams.append('_embed', '');
  
  const response = await fetch(`${WP_API_URL}/posts?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }
  
  const posts = await response.json();
  return posts.length > 0 ? posts[0] : null;
}

export async function fetchCategories(params?: {
  per_page?: number;
  parent?: number;
  hide_empty?: boolean;
}): Promise<WPCategory[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.parent !== undefined) queryParams.append('parent', params.parent.toString());
  if (params?.hide_empty !== undefined) queryParams.append('hide_empty', params.hide_empty.toString());
  
  const response = await fetch(`${WP_API_URL}/categories?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchTags(params?: {
  per_page?: number;
  hide_empty?: boolean;
}): Promise<WPTag[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.hide_empty !== undefined) queryParams.append('hide_empty', params.hide_empty.toString());
  
  const response = await fetch(`${WP_API_URL}/tags?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchPages(params?: {
  per_page?: number;
  parent?: number;
  menu_order?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}): Promise<WPPage[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.parent !== undefined) queryParams.append('parent', params.parent.toString());
  if (params?.menu_order) queryParams.append('menu_order', params.menu_order);
  if (params?.orderby) queryParams.append('orderby', params.orderby);
  if (params?.order) queryParams.append('order', params.order);
  
  const response = await fetch(`${WP_API_URL}/pages?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchMedia(id: number): Promise<WPMedia | null> {
  if (!id) return null;
  
  const response = await fetch(`${WP_API_URL}/media/${id}`);
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}

export async function fetchUser(id: number): Promise<WPUser | null> {
  const response = await fetch(`${WP_API_URL}/users/${id}`);
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}

// Fetch WordPress menus
export async function fetchMenus(): Promise<WPMenu[]> {
  try {
    // Try multiple possible menu endpoints (WordPress 5.9+ native endpoints and plugin endpoints)
    const endpoints = [
      // WordPress 5.9+ native endpoints
      `${WP_API_URL}/menus`,
      `${WP_API_URL}/menu-locations`,
      // Common plugin endpoints
      `https://www.thenextpages.com/wp-json/wp-api-menus/v2/menus`,
      `https://www.thenextpages.com/wp-json/menus/v1/menus`,
      `https://www.thenextpages.com/wp-json/menus/v2/menus`,
      // Custom endpoint possibilities
      `https://www.thenextpages.com/wp-json/wp/v2/menu`,
      `https://www.thenextpages.com/wp-json/custom/v1/menus`,
    ];
    
    console.log('🔍 Searching for WordPress menu endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        console.log(`⚡ Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        console.log(`📡 Response status for ${endpoint}:`, response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully fetched menu data from', endpoint);
          console.log('📋 Menu data structure:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            console.log('🎯 Found menus:', data.map(menu => menu.name || menu.slug || menu.id));
            return data;
          } else if (data && typeof data === 'object') {
            // Handle single menu or different structure
            console.log('📦 Converting single menu or object to array');
            return [data];
          }
        } else {
          console.log(`❌ Failed to fetch from ${endpoint}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`💥 Error fetching from ${endpoint}:`, error);
        continue;
      }
    }
    
    // Fallback: return empty array
    console.log('⚠️ No menu endpoints available, falling back to categories');
    return [];
  } catch (error) {
    console.error('❌ Error fetching menus:', error);
    return [];
  }
}

// Fetch Primary Menu specifically
export async function fetchPrimaryMenu(): Promise<WPMenuItem[]> {
  try {
    console.log('🔍 Attempting to fetch Primary Menu...');
    
    // First try to get the menu structure
    const menus = await fetchMenus();
    console.log('📋 Available menus:', menus);
    
    if (menus.length > 0) {
      // Look for primary menu by name, slug, or location
      let primaryMenu = menus.find(menu => 
        menu.name?.toLowerCase().includes('primary') || 
        menu.slug?.includes('primary') ||
        (menu.locations && menu.locations.includes('primary'))
      );
      
      // If not found, try case variations
      if (!primaryMenu) {
        primaryMenu = menus.find(menu => 
          menu.name?.toLowerCase().includes('main') ||
          menu.name?.toLowerCase().includes('header') ||
          menu.slug?.includes('main') ||
          menu.slug?.includes('header')
        );
      }
      
      // If still not found, use the first menu
      if (!primaryMenu && menus.length > 0) {
        console.log('🎯 Using first available menu as fallback');
        primaryMenu = menus[0];
      }
      
      console.log('🎯 Selected menu:', primaryMenu);
      
      if (primaryMenu) {
        // If the menu has items, return them
        if (primaryMenu.items && Array.isArray(primaryMenu.items)) {
          console.log('✅ Found menu items:', primaryMenu.items.length);
          return primaryMenu.items.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
        }
        
        // Try to fetch menu items separately using the menu ID
        if (primaryMenu.id) {
          console.log('🔄 Fetching menu items separately for menu ID:', primaryMenu.id);
          const menuItems = await fetchMenuItems(primaryMenu.id);
          if (menuItems.length > 0) {
            return menuItems;
          }
        }
      }
    }
    
    // Try alternative endpoints for primary menu
    console.log('🔄 Trying alternative menu endpoints...');
    const alternativeEndpoints = [
      `https://www.thenextpages.com/wp-json/wp/v2/menu-items?menus=primary`,
      `https://www.thenextpages.com/wp-json/wp/v2/menu-items`,
      `https://www.thenextpages.com/wp-json/wp-api-menus/v2/menu-locations/primary`,
      `https://www.thenextpages.com/wp-json/wp-api-menus/v2/menu-locations/header`,
      `https://www.thenextpages.com/wp-json/menus/v1/locations/primary`,
      `https://www.thenextpages.com/wp-json/wp/v2/menu/primary`
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`⚡ Trying alternative endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Alternative endpoint success:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            // Transform data to our format if needed
            return data.map(item => ({
              id: item.id || item.ID,
              title: item.title?.rendered || item.title || item.post_title,
              url: item.url || item.guid?.rendered || item.guid,
              target: item.target || '',
              classes: item.classes || [],
              parent: item.parent || item.menu_item_parent || 0,
              menu_order: item.menu_order || 0,
              object: item.object || '',
              object_id: item.object_id || 0,
              type: item.type || '',
              type_label: item.type_label || ''
            })).sort((a, b) => a.menu_order - b.menu_order);
          }
        }
      } catch (error) {
        console.log(`💥 Alternative endpoint error:`, error);
        continue;
      }
    }
    
    console.log('⚠️ No Primary Menu found, falling back to categories');
    return [];
  } catch (error) {
    console.error('❌ Error fetching primary menu:', error);
    return [];
  }
}

// Helper function to fetch menu items by menu ID
async function fetchMenuItems(menuId: number): Promise<WPMenuItem[]> {
  try {
    const endpoints = [
      `${WP_API_URL}/menu-items?menus=${menuId}`,
      `https://www.thenextpages.com/wp-json/wp/v2/menu-items?menus=${menuId}`,
      `https://www.thenextpages.com/wp-json/wp-api-menus/v2/menu-items?menus=${menuId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            return data.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

// Fetch featured posts (posts from "Featured" category)
export async function fetchFeaturedPosts(limit: number = 3): Promise<WPPost[]> {
  try {
    // First, find the "Featured" category
    const categories = await fetchCategories();
    const featuredCategory = categories.find(cat => 
      cat.name.toLowerCase() === 'featured' || cat.slug === 'featured'
    );
    
    if (!featuredCategory) {
      // If no featured category, return latest sticky posts or just latest posts
      return fetchPosts({ per_page: limit, orderby: 'date', order: 'desc', _embed: true });
    }
    
    return fetchPosts({
      per_page: limit,
      categories: [featuredCategory.id],
      orderby: 'date',
      order: 'desc',
      _embed: true
    });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

// Fetch random posts
export async function fetchRandomPosts(limit: number = 6, excludeCategories?: string[]): Promise<WPPost[]> {
  try {
    // Get categories to exclude (like "Featured")
    let excludeCategoryIds: number[] = [];
    if (excludeCategories && excludeCategories.length > 0) {
      const categories = await fetchCategories();
      excludeCategoryIds = categories
        .filter(cat => excludeCategories.includes(cat.name.toLowerCase()) || excludeCategories.includes(cat.slug))
        .map(cat => cat.id);
    }
    
    // Fetch more posts than needed
    // Note: WordPress doesn't support 'rand' orderby in REST API by default
    // We'll use date ordering and randomize client-side
    const posts = await fetchPosts({
      per_page: limit * 3, // Fetch 3x to ensure we have enough after filtering
      categories_exclude: excludeCategoryIds,
      orderby: 'date', // Changed from 'rand' which might cause the Bad Request
      order: 'desc',
      _embed: true
    });
    
    // Randomize client-side
    const shuffled = [...posts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Error fetching random posts:', error);
    return [];
  }
}

// Fetch related posts by tags
export async function fetchRelatedPostsByTags(postId: number, tags: number[], limit: number = 3): Promise<WPPost[]> {
  if (!tags || tags.length === 0) {
    // Fallback to recent posts if no tags
    return fetchPosts({
      per_page: limit + 1,
      exclude: [postId],
      orderby: 'date',
      order: 'desc',
      _embed: true
    }).then(posts => posts.filter(p => p.id !== postId).slice(0, limit));
  }
  
  try {
    const posts = await fetchPosts({
      per_page: limit + 5, // Fetch extra to account for filtering
      tags: tags,
      exclude: [postId],
      orderby: 'date',
      order: 'desc',
      _embed: true
    });
    
    // Filter out the current post and limit results
    return posts.filter(p => p.id !== postId).slice(0, limit);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    // Fallback to recent posts
    return fetchPosts({
      per_page: limit + 1,
      exclude: [postId],
      orderby: 'date',
      order: 'desc',
      _embed: true
    }).then(posts => posts.filter(p => p.id !== postId).slice(0, limit));
  }
}

// Search posts
export async function searchPosts(query: string, params?: {
  per_page?: number;
  page?: number;
  _embed?: boolean;
}): Promise<WPPost[]> {
  if (!query.trim()) return [];
  
  return fetchPosts({
    search: query,
    per_page: params?.per_page || 10,
    page: params?.page || 1,
    _embed: params?._embed !== false
  });
}

// Helper function to extract text from HTML and limit to a certain number of words
export function extractExcerpt(html: string, wordLimit: number = 30): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  // Split into words and limit
  const words = cleanText.split(/\s+/).slice(0, wordLimit);
  return words.join(' ') + (words.length >= wordLimit ? '...' : '');
}

// Helper function to format WordPress date
export function formatWPDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get optimized image URL
export function getOptimizedImageUrl(wpPost: WPPostWithEmbedded, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'medium'): string | undefined {
  if (wpPost._embedded?.['wp:featuredmedia']?.[0]) {
    const media = wpPost._embedded['wp:featuredmedia'][0];
    let url: string | undefined;
    
    // Try to get the requested size
    if (media.media_details?.sizes?.[size]) {
      url = media.media_details.sizes[size].source_url;
    } else {
      // Fallback to full size
      url = media.source_url;
    }
    
    // Clean up the URL - remove any line breaks or extra whitespace
    if (url) {
      return url.replace(/[\r\n]+/g, '').trim();
    }
  }
  
  return undefined;
}

// Transform WordPress post to match your Article interface
export async function transformWPPostToArticle(wpPost: WPPostWithEmbedded): Promise<{
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image?: string;
  slug: string;
  tags: number[];
}> {
  // Get category name
  let categoryName = 'UNCATEGORIZED';
  if (wpPost._embedded?.['wp:term']?.[0]?.[0]) {
    categoryName = wpPost._embedded['wp:term'][0][0].name.toUpperCase();
  } else if (wpPost.categories.length > 0) {
    const category = await fetchCategories().then(cats => 
      cats.find(cat => cat.id === wpPost.categories[0])
    );
    if (category) categoryName = category.name.toUpperCase();
  }

  // Get author name
  let authorName = 'Unknown Author';
  if (wpPost._embedded?.author?.[0]) {
    authorName = wpPost._embedded.author[0].name;
  } else {
    const author = await fetchUser(wpPost.author);
    if (author) authorName = author.name;
  }

  // Get featured image
  const imageUrl = getOptimizedImageUrl(wpPost, 'large');
  


  // Calculate read time (assuming 200 words per minute)
  const wordCount = wpPost.content.rendered.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return {
    id: wpPost.id.toString(),
    title: wpPost.title.rendered,
    excerpt: wpPost.excerpt.rendered ? 
      extractExcerpt(wpPost.excerpt.rendered) : 
      extractExcerpt(wpPost.content.rendered),
    content: wpPost.content.rendered,
    category: categoryName,
    date: formatWPDate(wpPost.date),
    author: authorName,
    readTime: `${readTime} min read`,
    image: imageUrl,
    slug: wpPost.slug,
    tags: wpPost.tags || []
  };
}

// Get category color based on name (for UI consistency)
export function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    'AI': 'text-blue-600',
    'MAPS': 'text-green-600',
    'ANDROID': 'text-green-600',
    'SEARCH': 'text-purple-600',
    'DEVELOPERS': 'text-orange-600',
    'NEWS': 'text-red-600',
    'FEATURED': 'text-yellow-600'
  };
  
  return colorMap[category.toUpperCase()] || 'text-gray-600';
} 