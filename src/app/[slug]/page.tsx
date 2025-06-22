import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareButton from '@/components/ShareButton';
import HeaderAd from '@/components/ads/HeaderAd';
import FooterAd from '@/components/ads/FooterAd';
import AdSenseScript from '@/components/ads/AdSenseScript';
import Link from 'next/link';
import { fetchPost, fetchRelatedPostsByTags, transformWPPostToArticle } from '@/lib/wordpress';
import { injectMiddleAd, shouldInjectMiddleAd } from '@/lib/contentParser';
import { Article } from '@/types/article';
import Image from 'next/image';

// Full SSG - all posts pre-generated at build time

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function ArticleContent({ article }: { article: Article }) {
  // Fetch related articles by tags
  let relatedArticles: Article[] = [];
  try {
    const relatedPosts = await fetchRelatedPostsByTags(
      parseInt(article.id), 
      article.tags,
      3
    );
    relatedArticles = await Promise.all(
      relatedPosts.map(post => transformWPPostToArticle(post))
    );
  } catch (error) {
    console.error('Error fetching related articles:', error);
  }

  // Process article content with middle ad injection
  const processedContent = shouldInjectMiddleAd(article.content) 
    ? injectMiddleAd(article.content)
    : article.content;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 lg:mb-12">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </Link>
            </li>
            <li className="text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </li>
            <li>
              <Link 
                href={`/category/${article.categorySlug}`}
                className="text-blue-600 font-medium uppercase tracking-wide hover:text-blue-700"
              >
                {article.category}
              </Link>
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <article className="max-w-4xl">
          <header className="mb-12 lg:mb-16">
            {/* Main Headline */}
            <h1 className="text-3xl leading-9 md:text-4xl md:leading-11 lg:text-5xl lg:leading-tight font-normal text-gray-900 mb-6 lg:mb-8 max-w-4xl">
              {article.title}
            </h1>
            
            {/* Date, Read Time and Share Button Row */}
            <div className="flex items-center justify-between mb-8 lg:mb-12">
              {/* Left: Date and Read Time */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">{article.date}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 text-sm font-medium">{article.readTime}</span>
              </div>
              
              {/* Right: Share Button */}
              <ShareButton article={article} />
            </div>
          </header>

          {/* Header Ad - After article title and meta */}
          <HeaderAd />

          {/* Article Content */}
          <div className="max-w-none mt-12 lg:mt-16">
            {/* Hero Image */}
            {article.image && (
              <div className="mb-8 lg:mb-12 relative w-full aspect-[16/9]">
                <Image 
                  src={article.image} 
                  alt={article.title}
                  fill
                  className="object-cover rounded-xl"
                  sizes="100vw"
                  priority
                />
              </div>
            )}
            
            {/* Render HTML content from WordPress with injected middle ad */}
            <div 
              className="article-content max-w-none"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />



            {/* Posted In Section */}
            <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-gray-100">
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-3 lg:mb-4">Posted in</h3>
              <div className="flex flex-wrap gap-2">
                <Link 
                  href={`/category/${article.categorySlug}`}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {article.category}
                </Link>
              </div>
            </div>

            {/* Footer Ad - After main content */}
            <FooterAd />

            {/* Keep Reading Section */}
            {relatedArticles.length > 0 && (
              <div className="mt-12 lg:mt-16 pt-6 lg:pt-8 border-t border-gray-100">
                <h3 className="text-xl leading-8 lg:text-2xl lg:leading-9 font-bold text-gray-900 mb-6 lg:mb-8">
                  Keep Reading
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle) => (
                    <article key={relatedArticle.id} className="group cursor-pointer">
                      <Link href={`/${relatedArticle.slug}`} className="block h-full">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow h-full">
                          {/* Date and Category */}
                          <div className="flex items-center space-x-2 mb-4">
                            <span className="text-sm text-gray-600 font-medium">{relatedArticle.date}</span>
                            <span className="text-gray-400">•</span>
                            <span className={`text-sm font-medium ${
                              relatedArticle.category === 'AI' 
                                ? 'text-blue-600' 
                                : relatedArticle.category === 'MAPS'
                                ? 'text-green-600'
                                : relatedArticle.category === 'ANDROID'
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}>
                              {relatedArticle.category}
                            </span>
                          </div>

                          <div className="flex justify-between items-start space-x-4">
                            {/* Article Content */}
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-3 leading-snug">
                                {relatedArticle.title}
                              </h4>
                            </div>

                            {/* Article Image */}
                            {relatedArticle.image && (
                              <div className="flex-shrink-0">
                                <div className="w-20 h-20 rounded-xl overflow-hidden relative">
                                  <Image 
                                    src={relatedArticle.image} 
                                    alt={relatedArticle.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
      
      {/* Initialize AdSense for injected ads */}
      <AdSenseScript />
    </div>
  );
}

// Generate static params for recent posts only (to avoid timeouts)
export async function generateStaticParams() {
  try {
    console.log('🏗️  Generating static params for recent posts...');
    
    const { fetchPosts } = await import('@/lib/wordpress');
    
    // Fetch only the most recent 100 posts to avoid API timeouts
    const posts = await fetchPosts({ 
      per_page: 100, // Recent posts only
      page: 1,
      orderby: 'date', 
      order: 'desc' 
    });
    
    console.log(`✅ Pre-generating ${posts.length} most recent posts`);
    console.log('💡 Older posts will be generated on-demand when first visited');
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
    
  } catch (error) {
    console.error('❌ Error generating article static params:', error);
    // Return empty array to allow build to continue
    return [];
  }
}


export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  // Fetch article from WordPress
  let article: Article | null = null;
  
  try {
    const wpPost = await fetchPost(slug, true);
    if (wpPost) {
      article = await transformWPPostToArticle(wpPost);
    }
  } catch (error) {
    console.error('Error fetching article:', error);
  }

  if (!article) {
    notFound();
  }

  return <ArticleContent article={article} />;
}