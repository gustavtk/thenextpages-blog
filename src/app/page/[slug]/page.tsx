import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { fetchPages } from '@/lib/wordpress';

// Add ISR - revalidate every 10 minutes
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WordPressPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch all pages and find the one with matching slug
  const pages = await fetchPages({ per_page: 100 });
  const page = pages.find(p => p.slug === slug);
  
  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
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
              <span className="text-gray-700 font-medium">{page.title.rendered}</span>
            </li>
          </ol>
        </nav>

        {/* Page Content */}
        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {page.title.rendered}
          </h1>
          
          <div 
            className="prose-headings:font-semibold prose-headings:text-gray-900
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
} 