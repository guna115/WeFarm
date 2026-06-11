'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, MapPin, Loader2, MapPinOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilter from '@/components/ui/CategoryFilter';
import PostCard, { type Post } from '@/components/buyer/PostCard';
import PostCardSkeleton from '@/components/buyer/PostCardSkeleton';
import ReportModal from '@/components/buyer/ReportModal';
import { useLocation, calculateDistance } from '@/hooks/useLocation';
import { getNearbyPosts, searchPosts } from '@/services/api';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function BuyerFeedPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { location, error: locationError, loading: locationLoading, requestLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let data: any;

      if (searchQuery.trim()) {
        // Search mode
        data = await searchPosts(
          searchQuery,
          location?.latitude,
          location?.longitude
        );
      } else {
        // Nearby mode (default) — show ALL posts in India, sorted by distance
        const lat = location?.latitude || 15.5; // Default to AP center if no location
        const lng = location?.longitude || 80.0;
        const radius = 10000; // Show all posts (no distance limit)

        data = await getNearbyPosts(lat, lng, radius, selectedCategory);
      }

      const fetchedPosts = (data as any)?.posts || [];
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Pull to refresh.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [location, searchQuery, selectedCategory]);

  // Fetch when location changes, or category changes
  useEffect(() => {
    // We intentionally DO NOT wait for locationLoading to finish.
    // Fetch immediately with a default location to show UI instantly.
    // When locationLoading finishes and we get real GPS, this effect runs again 
    // and seamlessly re-sorts and updates the real road distances without blocking the user.
    fetchPosts();
  }, [locationLoading, selectedCategory, fetchPosts]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate distances client-side for any posts missing distance_km
  const postsWithDistance = useMemo(() => {
    if (!location) return posts;

    return posts.map((p) => ({
      ...p,
      distance_km:
        p.distance_km ??
        calculateDistance(
          location.latitude,
          location.longitude,
          p.latitude,
          p.longitude
        ),
    }));
  }, [posts, location]);

  const handleReport = (postId: string) => {
    setReportPostId(postId);
  };

  return (
    <div className="min-h-screen bg-surface-50 pb-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-surface-100">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-surface-700" />
          </button>
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('common.search')}
            />
          </div>
          <LanguageToggle />
        </div>

        {/* Location status */}
        <div className="px-4 pb-2">
          {locationLoading && (
            <div className="flex items-center gap-2 text-surface-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs font-medium">{t('buyer.detecting')}</span>
            </div>
          )}
          {location && !locationLoading && (
            <div className="flex items-center gap-2 text-primary-600">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {t('buyer.nearbyResults')}
              </span>
            </div>
          )}
          {locationError && !locationLoading && (
            <button
              onClick={requestLocation}
              className="flex items-center gap-2 text-earth-600"
            >
              <MapPinOff className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {t('buyer.enableLocation')}
              </span>
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="px-3 pb-3">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="btn-primary text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Try Again
            </button>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && postsWithDistance.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-surface-500">
                {postsWithDistance.length} {t('buyer.listingsFound')}
              </p>
              <button
                onClick={fetchPosts}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('common.refresh')}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {postsWithDistance.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReport={handleReport}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && postsWithDistance.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-100 flex items-center justify-center mb-4">
              <span className="text-4xl">🌿</span>
            </div>
            <h3 className="text-lg font-bold text-surface-800 mb-2">
              {t('buyer.noListingsTitle')}
            </h3>
            <p className="text-sm text-surface-500 max-w-xs">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : t('buyer.noListingsDescription')}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 btn-secondary text-sm"
              >
                Show all categories
              </button>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportPostId && (
        <ReportModal
          postId={reportPostId}
          onClose={() => setReportPostId(null)}
        />
      )}
    </div>
  );
}
