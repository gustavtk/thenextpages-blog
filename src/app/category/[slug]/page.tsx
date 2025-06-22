import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { fetchCategories, fetchPosts, transformWPPostToArticle, getCategoryColor } from '@/lib/wordpress';
import Image from 'next/image';

// Static Site Generation with dynamic params

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}


// Generate static params for all categories at build time
export async function generateStaticParams() {
  try {
    const categories = await fetchCategories({ per_page: 100 });
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating category static params:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Find the category by slug
  const categories = await fetchCategories();
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    notFound();
    return null;
  }
  
  // Fetch recent posts for this category (to avoid timeouts)
  const wpPosts = await fetchPosts({
    categories: [category.id],
    per_page: 50, // Reasonable limit to avoid timeouts
    page: 1,
    _embed: true,
    orderby: 'date',
    order: 'desc'
  });

  const articles = await Promise.all(
    wpPosts.map(post => transformWPPostToArticle(post))
  );

  // No "load more" needed since all posts are pre-generated
  const hasMore = false;

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

            {/* Load More Button - Hidden since all posts are pre-generated */}
            {hasMore && (
              <div className="mt-12 text-center">
                <Link 
                  href={`/category/${category.slug}?page=2`}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  Load more stories
                </Link>
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