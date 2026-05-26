'use client';

import {
  MapPin,
  Phone,
  Clock,
  Truck,
  Calendar,
  Flag,
} from 'lucide-react';
import ImageSlider from '@/components/ui/ImageSlider';
import { useTranslation } from '@/contexts/LanguageContext';

export interface Post {
  id: string;
  seller_id: string;
  plant_name: string;
  category: string;
  days_old: number;
  image_urls: string[];
  contact_number: string;
  whatsapp_number?: string;
  nursery_name: string;
  address: string;
  latitude: number;
  longitude: number;
  courier_available: boolean;
  created_at: string;
  expires_at: string;
  distance_km?: number;
}

interface PostCardProps {
  post: Post;
  onReport?: (postId: string) => void;
}

export default function PostCard({ post, onReport }: PostCardProps) {
  const { t } = useTranslation();
  const timeAgo = getTimeAgo(post.created_at);
  const daysLeft = getDaysLeft(post.expires_at);

  const handleCall = () => {
    window.open(`tel:${post.contact_number}`, '_self');
  };

  const handleWhatsApp = () => {
    const phone = (post.whatsapp_number || post.contact_number).replace(
      /[^0-9]/g,
      ''
    );
    const message = encodeURIComponent(
      `Hi! I saw your ${post.plant_name} listing on WeFarm. Is it still available?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <article className="post-card group animate-fade-in" id={`post-${post.id}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-500/20">
            {post.nursery_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-800 leading-tight">
              {post.nursery_name}
            </h3>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-surface-400" />
                <span className="text-xs text-surface-500 line-clamp-1">
                  {post.address}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-surface-400" />
                <span className="text-[10px] font-medium text-surface-400">
                  {new Date(post.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.distance_km !== undefined && (
            <span className="badge-green text-[10px]">
              <MapPin className="w-3 h-3 mr-1" />
              {post.distance_km < 1
                ? `${Math.round(post.distance_km * 1000)}m`
                : `${post.distance_km.toFixed(1)} km`}
            </span>
          )}
          {onReport && (
            <button
              onClick={() => onReport(post.id)}
              className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label="Report this post"
            >
              <Flag className="w-4 h-4 text-surface-400" />
            </button>
          )}
        </div>
      </div>

      {/* Image Slider */}
      <ImageSlider images={post.image_urls} plantName={post.plant_name} />

      {/* Plant Details */}
      <div className="px-4 pt-3 pb-2">
        {/* Plant name & days */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-bold text-surface-900">
            {post.plant_name}
          </h4>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-earth-100 rounded-xl border border-earth-200 shadow-sm">
            <Calendar className="w-4 h-4 text-earth-700" />
            <span className="text-sm font-bold text-earth-800">
              {post.days_old} {t('buyer.daysOld')}
            </span>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.courier_available && (
            <span className="badge-green">
              <Truck className="w-3 h-3 mr-1" />
              {t('buyer.courierAvailable')}
            </span>
          )}
          {!post.courier_available && (
            <span className="badge-yellow">
              <Truck className="w-3 h-3 mr-1" />
              {t('buyer.pickupOnly')}
            </span>
          )}
          <span className="badge bg-surface-100 text-surface-600">
            <Clock className="w-3 h-3 mr-1" />
            {timeAgo}
          </span>
          {daysLeft <= 2 && daysLeft > 0 && (
            <span className="badge-red">
              {t('buyer.expiresIn')} {daysLeft}d
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <button
          id={`call-${post.id}`}
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-100 hover:bg-surface-200 rounded-xl font-semibold text-sm text-surface-700 transition-all duration-200 active:scale-[0.97]"
        >
          <Phone className="w-4.5 h-4.5" />
          {t('buyer.call')}
        </button>
        <button
          id={`whatsapp-${post.id}`}
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.97] shadow-md shadow-[#25D366]/25"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t('buyer.whatsapp')}
        </button>
      </div>
    </article>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getDaysLeft(expiresAt: string): number {
  const expires = new Date(expiresAt);
  const now = new Date();
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / 86400000));
}
