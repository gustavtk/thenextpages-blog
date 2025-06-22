'use client';

import { useState, useEffect } from 'react';

// Disable static generation for dynamic category pages
export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { fetchCategories, fetchPosts, transformWPPostToArticle, getCategoryColor } from '@/lib/wordpress';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Article, Category } from '@/types/article';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function CategoryContent({ slug }: { slug: string }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Load initial data
  useEffect(() => {
    loadCategoryData();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      // Find the category by slug
      const categories = await fetchCategories();
      const foundCategory = categories.find(cat => cat.slug === slug);
      
      if (!foundCategory) {
        notFound();
        return;
      }
      
      setCategory(foundCategory);
      
      // Fetch initial posts (15 per page)
      const wpPosts = await fetchPosts({
        categories: [foundCategory.id],
        per_page: 15,
        page: 1,
        _embed: true,
        orderby: 'date',
        order: 'desc'
      });

      const transformedArticles = await Promise.all(
        wpPosts.map(post => transformWPPostToArticle(post))
      );

      setArticles(transformedArticles);
      // Only show "Load more" if we got exactly 15 articles AND the category has more than 15 total
      setHasMore(transformedArticles.length === 15 && foundCategory.count > 15);
      setPage(1);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreArticles = async () => {
    if (!category || loadingMore) return;
    
    setLoadingMore(true);
    try {
      // Use a simple approach: fetch from a larger pool and filter
      // Since WordPress paginates consistently, we'll fetch posts 16-30 (next 15), 
      // then filter to get the next 6 unique ones
      const nextPage = page + 1;
      
      const wpPosts = await fetchPosts({
        categories: [category.id],
        per_page: 15, // Keep consistent page size
        page: nextPage,
        _embed: true,
        orderby: 'date',
        order: 'desc'
      });

      const transformedArticles = await Promise.all(
        wpPosts.map(post => transformWPPostToArticle(post))
      );

      // Filter out any articles that already exist to prevent duplicates
      const existingIds = new Set(articles.map(article => article.id));
      const newArticles = transformedArticles.filter(article => !existingIds.has(article.id));
      
      // Take only 6 articles for this load
      const articlesToAdd = newArticles.slice(0, 6);
      
      if (articlesToAdd.length > 0) {
        setArticles(prev => [...prev, ...articlesToAdd]);
        setPage(nextPage);
      }
      
      // Check if there are more articles available
      setHasMore(transformedArticles.length > 0 && articlesToAdd.length === 6);
    } catch (error) {
      console.error('Error loading more articles:', error);
      // If we get a 400 error about invalid page number, it means no more pages
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-blue-600 hover:text-blue-700">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </li>
              <li>
                <span className="text-gray-700 font-medium capitalize">{category.name}</span>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {category.count} {category.count === 1 ? 'article' : 'articles'}
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <article key={`${article.id}-${article.slug}`} className="group cursor-pointer">
                  <Link href={`/${article.slug}`} className="block h-full">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow h-full">
                      {/* Article Image */}
                      {article.image ? (
                        <div className="relative w-full h-48">
                          <Image 
                            src={article.image} 
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getCategoryColor(article.category)}`}>
                            {article.category.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="p-6">
                        {/* Date and Category */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm text-gray-600">{article.date}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{article.readTime}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button 
                  onClick={loadMoreArticles}
                  disabled={loadingMore}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more stories'
                  )}
                </button>
              </div>
            )}
            
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found in this category.</p>
            <Link 
              href="/"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [slug, setSlug] = useState<string>('');
  
  useEffect(() => {
    params.then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <CategoryContent slug={slug} />;
} 