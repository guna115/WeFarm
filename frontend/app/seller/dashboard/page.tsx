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
        <div className="relative pt-6 pb-6 px-4 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] rounded-b-3xl border-b border-surface-100 mb-4 z-10">
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm border border-primary-200/50 relative overflow-hidden">
                <span className="text-3xl font-black text-primary-700/80">
                  {seller?.nursery_name?.charAt(0)?.toUpperCase() || 'N'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
              </div>
              
              {/* Info */}
              <div className="pt-1">
                <h1 className="text-2xl font-black text-surface-900 leading-tight tracking-tight mb-1">
                  {seller?.nursery_name || t('seller.setupNursery')}
                </h1>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-surface-500">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" /> {seller?.district || 'Setup Profile'}
                  </span>
                  <span className="text-xs font-semibold text-surface-400 pl-5">
                    {seller?.phone_number || user?.phoneNumber || '—'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-50 hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors border border-surface-200"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
          
          {/* Stats card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200 flex flex-col justify-center shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-primary-100 rounded-lg">
                  <Sprout className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">{t('seller.active')}</span>
              </div>
              <span className="text-3xl font-black text-surface-900">{myPosts.length}</span>
            </div>
            
            <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200 flex flex-col justify-center shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">{t('seller.profile')}</span>
              </div>
              <div className="flex items-center h-[36px]">
                {seller?.profile_complete ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">Complete</span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">Pending</span>
                )}
              </div>
            </div>
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
