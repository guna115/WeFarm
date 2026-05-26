'use client';

export default function PostCardSkeleton() {
  return (
    <div className="post-card animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-surface-200" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-surface-200 rounded-lg" />
          <div className="h-3 w-24 bg-surface-100 rounded-lg mt-1.5" />
        </div>
        <div className="h-6 w-16 bg-surface-100 rounded-full" />
      </div>

      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] bg-surface-200 shimmer" />

      {/* Content skeleton */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-28 bg-surface-200 rounded-lg" />
          <div className="h-6 w-20 bg-surface-100 rounded-lg" />
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-28 bg-surface-100 rounded-full" />
          <div className="h-6 w-16 bg-surface-100 rounded-full" />
        </div>
      </div>

      {/* Buttons skeleton */}
      <div className="flex gap-3 px-4 pb-4">
        <div className="flex-1 h-12 bg-surface-100 rounded-xl" />
        <div className="flex-1 h-12 bg-surface-200 rounded-xl" />
      </div>
    </div>
  );
}
