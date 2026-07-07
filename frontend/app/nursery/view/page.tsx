'use client';

import { useState, useEffect, Suspense } from 'react';
import PostCard from '@/components/buyer/PostCard';
import { API_URL } from '@/lib/config';
import { ChevronLeft, MapPin, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import StarRating from '@/components/buyer/StarRating';

function NurseryContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    fetch(`${API_URL}/seller/${id}/public`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch nursery data:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data || !data.seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Nursery Not Found</h1>
        <p className="text-surface-500 mb-6">This nursery might have been removed or doesn't exist.</p>
        <button onClick={() => router.back()} className="btn-primary inline-flex items-center">
          <ChevronLeft className="w-5 h-5 mr-2" /> Go Back
        </button>
      </div>
    );
  }

  const { seller, posts } = data;

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-500/20 shrink-0">
                {seller.nursery_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight leading-tight">
                    {seller.nursery_name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 text-surface-600 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      {seller.district}, {seller.state}
                    </span>
                    {seller.courier_available && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-surface-300" />
                        <span className="flex items-center gap-1 text-green-600">
                          <Truck className="w-4 h-4" /> Delivery
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Rating Component */}
                <StarRating 
                  sellerId={seller.id} 
                  initialRating={seller.average_rating || 0} 
                  totalRatings={seller.rating_count || 0} 
                />
              </div>
            </div>
            
            <div className="bg-surface-100 px-6 py-4 rounded-2xl text-center">
              <div className="text-2xl font-black text-surface-900">{posts?.length || 0}</div>
              <div className="text-xs font-bold text-surface-500 uppercase tracking-wide">Active Listings</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        {!posts || posts.length === 0 ? (
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

export default function NurseryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>}>
      <NurseryContent />
    </Suspense>
  );
}
