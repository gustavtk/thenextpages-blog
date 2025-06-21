'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface FeaturedArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
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
    <section className="bg-white w-full" id="featured">
      <div className="relative w-full h-[450px] lg:h-[500px]">
        <Link href={`/${article.slug}`} className="group block h-full">
          {/* Full-width image background - 70% width */}
          <div className="absolute left-0 top-0 w-full lg:w-[70%] h-full overflow-hidden rounded-2xl border-4 border-white shadow-lg">
            {article.image ? (
              <img 
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
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

          {/* Overlapping white content card - positioned to overlap */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full lg:w-[45%] mx-4 lg:mx-8">
            <div className="bg-white rounded-xl shadow-xl p-8 group-hover:shadow-2xl transition-shadow duration-300">
              {/* Category Badge */}
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                  {article.category}
                </span>
              </div>

              {/* Article Title */}
              <h1 className="article-headline-1 text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h1>

              {/* Article Excerpt */}
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-6">
                {article.excerpt}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Author Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {article.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  {/* Author Details */}
                  <div>
                    <p className="font-medium text-gray-900 text-base">
                      {article.author}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {article.readTime} • {article.date}
                    </p>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0">
                  <ArrowRight className="h-6 w-6 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
} 