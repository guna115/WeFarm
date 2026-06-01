import { Metadata } from 'next';
import PostCard from '@/components/buyer/PostCard';
import { API_URL } from '@/lib/config';
import { ChevronLeft, MapPin, Truck } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: {
    id: string;
  };
}

async function getNurseryData(id: string) {
  try {
    const res = await fetch(`${API_URL}/seller/${id}/public`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch nursery data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getNurseryData(params.id);
  if (!data || !data.seller) {
    return {
      title: 'Nursery Not Found - WeFarm',
    };
  }
  
  return {
    title: `${data.seller.nursery_name} in ${data.seller.district} - WeFarm`,
    description: `Discover fresh plants and seedlings from ${data.seller.nursery_name} located in ${data.seller.district}, ${data.seller.state}. Browse their active listings on WeFarm.`,
  };
}

export default async function NurseryPage({ params }: Props) {
  const data = await getNurseryData(params.id);

  if (!data || !data.seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Nursery Not Found</h1>
        <p className="text-surface-500 mb-6">This nursery might have been removed or doesn't exist.</p>
        <Link href="/" className="btn-primary inline-flex items-center">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
      </div>
    );
  }

  const { seller, posts } = data;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Discover
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/20">
                {seller.nursery_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
                  {seller.nursery_name}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-surface-600 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    {seller.district}, {seller.state}
                  </span>
                  {seller.courier_available && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-surface-300" />
                      <span className="flex items-center gap-1 text-green-600">
                        <Truck className="w-4 h-4" /> Nationwide Delivery
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-surface-100 px-6 py-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-surface-900">{posts.length}</div>
              <div className="text-xs font-bold text-surface-500 uppercase tracking-wide">Active Listings</div>
            </div>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-surface-100 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-surface-100 flex items-center justify-center mb-6">
              <span className="text-4xl text-surface-400">🌱</span>
            </div>
            <h3 className="text-xl font-bold text-surface-800 mb-2">No Active Listings</h3>
            <p className="text-sm text-surface-500 max-w-[250px]">
              This nursery doesn't have any plants available right now.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-surface-900 mb-4 px-2">Available Plants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
