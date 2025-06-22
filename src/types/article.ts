export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  date: string;
  author: string;
  readTime: string;
  image?: string;
  slug: string;
  tags: number[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}