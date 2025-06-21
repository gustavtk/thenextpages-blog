'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image?: string;
}

interface AllTheLatestProps {
  articles: Article[];
}

export default function AllTheLatest({ articles }: AllTheLatestProps) {
  const [visibleArticles, setVisibleArticles] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    setIsLoading(true);
    
    // Simulate loading delay like the original Google blog
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVisibleArticles(prev => Math.min(prev + 3, articles.length));
    setIsLoading(false);
  };

  const hasMoreArticles = visibleArticles < articles.length;

  // Format date to match Google's style (MMM DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }).replace(',', '').toUpperCase();
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-normal text-gray-900 mb-12">All the Latest</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, visibleArticles).map((article) => (
            <article key={article.id} className="group cursor-pointer">
              <Link href={`/${article.slug}`} className="block h-full">
                <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-200 h-full border border-gray-100">
                  {/* Date and Category */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      {formatDate(article.date)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                      {article.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-normal text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-3">
                        {article.title}
                      </h3>
                    </div>

                    {/* Article Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        {article.image ? (
                          <img 
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          /* Fallback with gradient */
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {article.category.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreArticles && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
      </div>
    </section>
  );
}