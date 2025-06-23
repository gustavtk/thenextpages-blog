'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface FeaturedArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: string;
  readTime: string;
  date: string;
  image?: string;
}

interface FeaturedArticleProps {
  article: FeaturedArticleData;
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <section className="bg-white w-full px-4 sm:px-6 lg:px-8" id="featured">
      {/* Mobile & Desktop: Overlapping layout with responsive adjustments */}
      <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] max-w-7xl mx-auto">
        <Link href={`/${article.slug}`} className="group block">
          
          {/* Mobile & Desktop: Image positioned for overlap effect */}
          <div className="absolute left-0 top-0 w-full sm:w-[75%] lg:w-[70%] h-[250px] sm:h-[300px] lg:h-full overflow-hidden rounded-2xl border-4 border-white shadow-lg">
            {article.image ? (
              <Image 
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 70vw"
                priority
              />
            ) : (
              /* Fallback gradient if no image */
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-3xl font-bold">{article.category.charAt(0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile & Desktop: Overlapping content card */}
          <div className="absolute right-0 bottom-0 sm:top-1/2 sm:transform sm:-translate-y-1/2 w-[85%] sm:w-[55%] lg:w-[45%] mx-4 sm:mx-8 lg:mx-8">
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 group-hover:shadow-2xl transition-shadow duration-300">
              {/* Category Badge */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                  {article.category}
                </span>
              </div>

              {/* Article Title */}
              <h1 className="text-lg sm:text-xl lg:text-4xl font-normal text-gray-900 mb-2 sm:mb-3 lg:mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                {article.title}
              </h1>

              {/* Article Excerpt */}
              <p className="text-gray-600 text-xs sm:text-sm lg:text-lg leading-relaxed mb-3 sm:mb-4 lg:mb-6 line-clamp-2 sm:line-clamp-3">
                {article.excerpt}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Author Avatar */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {article.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  {/* Author Details */}
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">
                      {article.author}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {article.readTime} • {article.date}
                    </p>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
} 