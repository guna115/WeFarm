'use client';

import { useState } from 'react';
import { Flag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { reportPost } from '@/services/api';

interface ReportModalProps {
  postId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Fake listing / not real',
  'Spam or misleading',
  'Inappropriate content',
  'Wrong contact information',
  'Old / expired plants',
  'Other',
];

export default function ReportModal({ postId, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const reason =
      selectedReason === 'Other'
        ? otherText || 'Other'
        : selectedReason;

    if (!reason) return;

    setLoading(true);
    try {
      await reportPost(postId, reason);
      setSubmitted(true);
    } catch (error) {
      console.error('Report failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-surface-900">
              Report Listing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
          >
            <X className="w-4 h-4 text-surface-600" />
          </button>
        </div>

        {submitted ? (
          // Success state
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary-600" />
            </div>
            <h4 className="text-lg font-bold text-surface-900 mb-2">
              Report Submitted
            </h4>
            <p className="text-sm text-surface-500 mb-6">
              Thank you! We&apos;ll review this listing shortly.
            </p>
            <button onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        ) : (
          // Report form
          <>
            <p className="text-sm text-surface-500 mb-4">
              Why are you reporting this listing?
            </p>

            <div className="space-y-2 mb-5">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedReason === reason
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-surface-200 text-surface-700 hover:border-surface-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                className="input-field resize-none mb-4"
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !selectedReason ||
                (selectedReason === 'Other' && !otherText.trim())
              }
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
