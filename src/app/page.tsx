import FeaturedArticle from '@/components/FeaturedArticle';
import ArticleGrid from '@/components/ArticleGrid';
import AllTheLatest from '@/components/AllTheLatest';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  fetchFeaturedPosts, 
  fetchRandomPosts, 
  fetchPosts, 
  transformWPPostToArticle 
} from '@/lib/wordpress';



// Add ISR (Incremental Static Regeneration) - revalidate every 5 minutes
export const revalidate = 300;

export default async function Home() {
  // Fetch data in parallel for better performance
  const [featuredPosts, randomPosts, latestPosts] = await Promise.all([
    fetchFeaturedPosts(1), // Get 1 featured post
    fetchRandomPosts(3, ['featured']), // Get 3 random posts excluding featured
    fetchPosts({ 
      per_page: 50, // Safe limit within WordPress API constraints (max 100)
      _embed: true,
      orderby: 'date',
      order: 'desc'
    })
  ]);

  // Transform WordPress posts to match our Article interface
  const [featuredArticles, randomArticles, allArticles] = await Promise.all([
    Promise.all(featuredPosts.map(post => transformWPPostToArticle(post))),
    Promise.all(randomPosts.map(post => transformWPPostToArticle(post))),
    Promise.all(latestPosts.map(post => transformWPPostToArticle(post)))
  ]);

  const featuredArticle = featuredArticles[0] || null;
  const gridArticles = randomArticles.length >= 3 ? randomArticles : allArticles.slice(0, 3);
  // Give more articles to "All the Latest" section so Load More button can appear
  const latestArticles = allArticles.slice(4); // Start from 4th article to leave room for featured/grid

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {featuredArticle && <FeaturedArticle article={featuredArticle} />}
      {gridArticles.length > 0 && <ArticleGrid articles={gridArticles} />}
      {latestArticles.length > 0 && <AllTheLatest articles={latestArticles} />}
      <Footer />
    </div>
  );
}
