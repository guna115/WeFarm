'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Plus,
  User,
  MapPin,
  Phone,
  MessageSquare,
  Edit,
  Truck,
  Sprout,
  Eye,
  Settings,
  LogOut,
  Store
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SellerProfileDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, seller, logout } = useAuth();
  const [stats, setStats] = useState({ activePosts: 0 });

  useEffect(() => {
    // If no profile, force them to edit page immediately
    if (seller && !seller.profile_complete) {
      router.replace('/seller/profile/edit');
    }
    
    // Fetch quick stats (like total posts)
    if (user?.phoneNumber) {
      fetch(`${API_URL}/seller/posts-by-phone?phone=${encodeURIComponent(user.phoneNumber)}`)
        .then(res => res.json())
        .then(data => {
          if (data.posts) setStats({ activePosts: data.posts.length });
        })
        .catch(console.error);
    }
  }, [seller, user, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
      router.push('/');
    }
  };

  if (!seller) return null; // Let ProtectedRoute handle it

  return (
    <ProtectedRoute requireProfile>
      <div className="min-h-screen bg-surface-50 pb-24">
        {/* Top Header */}
        <div className="bg-gradient-to-b from-primary-600 to-primary-700 px-4 pt-8 pb-20 relative">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl font-bold text-white">{t('seller.profile')}</h1>
            <button onClick={handleLogout} className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all">
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="text-white flex-1">
              <h2 className="text-2xl font-bold leading-tight">{seller.nursery_name}</h2>
              <p className="text-primary-100 flex items-center gap-1 mt-1">
                <User className="w-4 h-4" /> {seller.owner_name}
              </p>
            </div>
          </div>
        </div>

        {/* Floating Card Content */}
        <div className="px-4 -mt-10 space-y-4 relative z-10">
          
          {/* Stats Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-200 flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900">{stats.activePosts}</p>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide flex items-center gap-1">
                <Sprout className="w-3 h-3" /> Active Listings
              </p>
            </div>
            <div className="w-px bg-surface-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-surface-900">{stats.activePosts * 42} <span className="text-sm font-medium text-surface-400">est.</span></p>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide flex items-center gap-1">
                <Eye className="w-3 h-3" /> Total Views
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
            <div className="p-4 border-b border-surface-100 bg-surface-50/50 flex justify-between items-center">
              <h3 className="font-bold text-surface-800">Nursery Details</h3>
              <button 
                onClick={() => router.push('/seller/profile/edit')}
                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Address</p>
                  <p className="text-sm text-surface-800 leading-relaxed font-medium">
                    {seller.address}<br />
                    {seller.district}, {seller.state}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Contact</p>
                  <p className="text-sm text-surface-800 font-medium">{seller.phone_number}</p>
                  {seller.whatsapp_number && seller.whatsapp_number !== seller.phone_number && (
                    <p className="text-sm text-surface-600 flex items-center gap-1 mt-1">
                      <MessageSquare className="w-3.5 h-3.5 text-green-500" /> {seller.whatsapp_number}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Delivery Status</p>
                  <p className="text-sm font-medium text-surface-800">
                    {seller.courier_available ? 'Courier Available ✅' : 'Pick-up Only ❌'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
             <button 
                onClick={() => router.push('/seller/add-post')}
                className="bg-white border border-surface-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-50 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-sm font-bold text-surface-800">New Listing</span>
             </button>
             
             <button 
                onClick={() => router.push('/seller/dashboard')}
                className="bg-white border border-surface-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-50 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
                  <Store className="w-6 h-6 text-surface-600" />
                </div>
                <span className="text-sm font-bold text-surface-800">My Listings</span>
             </button>
          </div>

        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-surface-100 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            <button onClick={() => router.push('/seller/dashboard')} className="flex flex-col items-center gap-1 px-6 py-2 text-surface-400 hover:text-primary-600 transition-colors">
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('seller.home')}</span>
            </button>
            <button onClick={() => router.push('/seller/add-post')} className="flex flex-col items-center gap-1 -mt-6">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-primary-500/30 active:scale-95 transition-transform">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-primary-600 mt-1">{t('seller.addPost')}</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-6 py-2 text-primary-600 transition-colors">
              <User className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('seller.profile')}</span>
            </button>
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
