'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { fetchPosts, transformWPPostToArticle, getCategoryColor } from '@/lib/wordpress';
import { Article } from '@/types/article';
import Image from 'next/image';

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 12;

  const loadArticles = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const wpPosts = await fetchPosts({
        per_page: perPage,
        page: pageNum,
        _embed: true,
        orderby: 'date',
        order: 'desc'
      });

      const transformedArticles = await Promise.all(
        wpPosts.map(post => transformWPPostToArticle(post))
      );

      if (pageNum === 1) {
        setArticles(transformedArticles);
      } else {
        setArticles(prev => [...prev, ...transformedArticles]);
      }

      setHasMore(transformedArticles.length === perPage);
    } catch (error) {
      console.error('Error loading articles:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles(1);
  }, [loadArticles]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadArticles(nextPage);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feed Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Articles
          </h1>
          <p className="text-gray-600">
            Browse through all our latest articles and insights
          </p>
        </div>

        {/* Articles Grid */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <article key={article.id} className="group cursor-pointer">
                  <Link href={`/${article.slug}`} className="block h-full">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
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

                      <div className="p-6 flex-1 flex flex-col">
                        {/* Date and Category */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm text-gray-600">{article.date}</span>
                          <span className="text-gray-400">•</span>
                          <span className={`text-sm font-medium ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-500">
                            By {article.author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {article.readTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More Articles'
                  )}
                </button>
              </div>
            )}

            {!hasMore && articles.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  You&apos;ve reached the end! Total articles: {articles.length}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
} 