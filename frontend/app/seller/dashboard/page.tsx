'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Plus,
  User,
  Sprout,
  Trash2,
  Eye,
  Clock,
  Loader2,
  RefreshCw,
  LogOut,
  Store,
  MapPin,
} from 'lucide-react';
import PostCard, { type Post } from '@/components/buyer/PostCard';
import PostCardSkeleton from '@/components/buyer/PostCardSkeleton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

import { API_URL } from '@/lib/config';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, seller, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user?.phoneNumber) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/seller/posts-by-phone?phone=${encodeURIComponent(user.phoneNumber)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMyPosts(data.posts || []);
      } else {
        setMyPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setDeleting(postId);
      const res = await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to delete post');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    if (!confirm('Are you sure you want to logout?')) return;
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary-600 to-primary-700 px-4 pt-6 pb-8 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  {seller?.nursery_name || 'My Nursery'}
                </h1>
                <p className="text-xs font-medium text-primary-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {seller?.district || 'Setup Profile'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 mt-2">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary-100" />
              <span className="text-sm font-medium text-white">{t('seller.active')}</span>
            </div>
            <span className="text-lg font-bold text-white bg-primary-800/50 px-3 py-0.5 rounded-lg">{myPosts.length}</span>
          </div>
        </div>

        {/* Posts Area */}
        <div className="pt-2">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-surface-800 uppercase tracking-wide">{t('seller.yourListings')}</h2>
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="px-4 space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            )}

            {!loading && myPosts.map((post) => (
                <div key={post.id} className="relative bg-white shadow-sm border-y border-surface-200 sm:border-x sm:mx-4 sm:rounded-2xl">
                  {/* Delete Button overlaid on the PostCard */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="w-10 h-10 bg-black/50 backdrop-blur-md hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 border border-white/20"
                    >
                      {deleting === post.id ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  
                  {/* The actual PostCard, pointer-events-none on buttons so seller doesn't call themselves? 
                      Actually it's fine, they can test their own buttons */}
                  <PostCard post={post} />
                </div>
              ))}

            {!loading && myPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                  <Sprout className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-surface-800 mb-2">{t('seller.noListings')}</h3>
                <p className="text-sm text-surface-500 mb-8 max-w-[250px]">
                  Add your first plant listing to start reaching buyers in your area.
                </p>
                <button onClick={() => router.push('/seller/add-post')} className="btn-primary w-full max-w-[200px] shadow-lg shadow-primary-500/30">
                  <Plus className="w-5 h-5 mr-2 inline" /> {t('seller.addFirstPost')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-surface-100">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
            <button className="flex flex-col items-center gap-1 px-6 py-2 text-primary-600">
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('seller.home')}</span>
            </button>
            <button onClick={() => router.push('/seller/add-post')} className="flex flex-col items-center gap-1 -mt-6">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-primary-500/30 active:scale-95 transition-transform">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-primary-600 mt-1">{t('seller.addPost')}</span>
            </button>
            <button onClick={() => router.push('/seller/profile')} className="flex flex-col items-center gap-1 px-6 py-2 text-surface-400 hover:text-surface-600">
              <User className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('seller.profile')}</span>
            </button>
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
