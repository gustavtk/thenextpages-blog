'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { searchPosts, transformWPPostToArticle, getCategoryColor } from '@/lib/wordpress';
import { Search } from 'lucide-react';

interface Article {
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
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, pageNum: number) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const posts = await searchPosts(searchQuery, {
        per_page: 12,
        page: pageNum,
        _embed: true
      });

      const articles = await Promise.all(
        posts.map(post => transformWPPostToArticle(post))
      );

      if (pageNum === 1) {
        setSearchResults(articles);
      } else {
        setSearchResults(prev => [...prev, ...articles]);
      }

      setHasMore(articles.length === 12);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    performSearch(query, 1);
  }, [query, performSearch]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>
          <p className="text-gray-600">
            {searchResults.length > 0 
              ? `Found ${searchResults.length}${hasMore ? '+' : ''} articles`
              : query && !loading ? 'No articles found' : 'Enter a search term to find articles'
            }
          </p>
        </div>

        {/* Search Results */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((article) => (
                <article key={article.id} className="group cursor-pointer">
                                      <Link href={`/${article.slug}`} className="block h-full">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow h-full">
                      {/* Date and Category */}
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-600 font-medium">{article.date}</span>
                        <span className="text-gray-400">•</span>
                        <span className={`text-sm font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Article Title */}
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-3 leading-snug">
                          {article.title}
                        </h4>
                        
                        {/* Article Excerpt */}
                        <p className="text-sm text-gray-600 line-clamp-2">
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
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : query && !loading ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or browse our categories
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Start your search
            </h2>
            <p className="text-gray-600">
              Use the search bar above to find articles
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
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
    }>
      <SearchContent />
    </Suspense>
  );
}