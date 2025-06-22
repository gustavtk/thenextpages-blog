'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article) => (
            <Link key={article.id} href={`/${article.slug}`} className="group block">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Article Image */}
                <div className="aspect-[16/9] relative">
                  {article.image ? (
                    <Image 
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{article.category.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Article Content */}
                <div className="p-6">
                  <span className={`text-sm font-medium ${
                    article.category === 'AI' ? 'text-blue-600' : 
                    article.category === 'MAPS' ? 'text-green-600' : 
                    'text-purple-600'
                  }`}>
                    {article.category}
                  </span>
                  <h3 className="text-xl font-normal text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-3 leading-snug">
                    {article.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}