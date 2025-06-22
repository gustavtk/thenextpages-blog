'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Article } from '@/types/article';

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

  // Format date to short uppercase style (MMM DD)
  const formatDate = (dateString: string) => {
    // If the date is already formatted (e.g., "January 16"), convert to short format
    if (!dateString.includes('T') && !dateString.includes('-') && dateString.includes(' ')) {
      // Already formatted date like "January 16" - convert to "JAN 16"
      try {
        const parts = dateString.split(' ');
        if (parts.length === 2) {
          const monthName = parts[0];
          const day = parts[1];
          const monthMap: { [key: string]: string } = {
            'January': 'JAN', 'February': 'FEB', 'March': 'MAR', 'April': 'APR',
            'May': 'MAY', 'June': 'JUN', 'July': 'JUL', 'August': 'AUG',
            'September': 'SEP', 'October': 'OCT', 'November': 'NOV', 'December': 'DEC'
          };
          return `${monthMap[monthName] || monthName.slice(0, 3).toUpperCase()} ${day}`;
        }
      } catch (error) {
        console.warn('Date formatting error:', error);
      }
    }
    
    // Try to parse as raw date
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }).replace(',', '').toUpperCase();
      }
    } catch (error) {
      console.warn('Date parsing error:', error);
    }
    
    // Fallback
    return dateString.toUpperCase();
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-normal text-gray-900 mb-8 md:mb-12">All the Latest</h2>
        
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

                  <div className="flex justify-between items-center gap-4">
                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-normal text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-3">
                        {article.title}
                      </h3>
                    </div>

                    {/* Article Image */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-20 rounded-lg overflow-hidden relative">
                        {article.image ? (
                          <Image 
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="128px"
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
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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