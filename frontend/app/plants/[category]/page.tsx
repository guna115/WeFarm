import { Metadata } from 'next';
import PostCard from '@/components/buyer/PostCard';
import { API_URL } from '@/lib/config';
import { categories } from '@/components/ui/CategoryFilter';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1);
  return {
    title: `${categoryName} Plants & Seedlings Near You - WeFarm`,
    description: `Find fresh ${params.category} seedlings from top local nurseries across India. Connect directly with sellers on WeFarm.`,
  };
}

async function getCategoryPosts(category: string) {
  try {
    const res = await fetch(`${API_URL}/posts/category/${category}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    console.error('Failed to fetch category posts:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: Props) {
  const posts = await getCategoryPosts(params.category);
  const categoryObj = categories.find((c) => c.id === params.category);
  const categoryName = categoryObj ? categoryObj.name : params.category;
  const emoji = categoryObj ? categoryObj.emoji : '🌿';

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-surface-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-surface-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <span className="text-2xl">{emoji}</span> {categoryName} Plants
            </h1>
            <p className="text-xs font-semibold text-surface-500">
              {posts.length} {posts.length === 1 ? 'listing' : 'listings'} available
            </p>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <span className="text-4xl">{emoji}</span>
            </div>
            <h3 className="text-xl font-bold text-surface-800 mb-2">No {categoryName} found</h3>
            <p className="text-sm text-surface-500 max-w-[250px]">
              We couldn't find any active listings for this category. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
