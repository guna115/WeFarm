'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface StarRatingProps {
  sellerId: string;
  initialRating: number;
  totalRatings: number;
}

export default function StarRating({ sellerId, initialRating, totalRatings }: StarRatingProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // We display the average rating if they haven't voted, otherwise their vote
  const displayRating = submitted ? rating : (hover || rating || initialRating);

  const handleRate = async (value: number) => {
    if (submitted || submitting) return;
    
    setRating(value);
    setSubmitting(true);
    
    try {
      let deviceId = localStorage.getItem('wefarm_device_id');
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('wefarm_device_id', deviceId);
      }

      await fetch(`${API_URL}/seller/${sellerId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, rating: value }),
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Revert if failed
      setRating(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitted || submitting}
            className={`transition-colors focus:outline-none ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseEnter={() => !submitted && setHover(star)}
            onMouseLeave={() => !submitted && setHover(0)}
            onClick={() => handleRate(star)}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-6 h-6 sm:w-5 sm:h-5 ${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-surface-300'
              } ${submitting ? 'opacity-50' : ''}`}
            />
          </button>
        ))}
        {Number(initialRating) > 0 && !submitted && (
          <span className="ml-2 font-bold text-surface-700 text-sm">
            {Number(initialRating).toFixed(1)}
          </span>
        )}
      </div>
      
      {submitted ? (
        <span className="text-xs font-semibold text-green-600 mt-1">Thanks for rating!</span>
      ) : (
        <span className="text-xs text-surface-500 mt-1">
          {totalRatings > 0 ? `${totalRatings} reviews` : 'Be the first to rate!'}
        </span>
      )}
    </div>
  );
}
