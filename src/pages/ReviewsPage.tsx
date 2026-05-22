import { useEffect, useState } from 'react';
import { useInstitute } from '@/context/InstituteContext';
import { reviewApi, instituteResponseApi } from '@/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { MessageSquare, Star, Send, X } from 'lucide-react';
import type { Review, InstituteResponse } from '@/types';
import { ReviewStatus } from '@/types';
import { toast } from 'sonner';

const statusFilters: { label: string; value: ReviewStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: ReviewStatus.PENDING },
  { label: 'Approved', value: ReviewStatus.APPROVED },
  { label: 'Rejected', value: ReviewStatus.REJECTED },
];

export default function ReviewsPage() {
  const { institute } = useInstitute();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadData = async () => {
    if (!institute?.identifier) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await reviewApi.findByInstituteIdentifier(institute.identifier);
      setReviews(data);
      setFilteredReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute?.identifier]);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.status === statusFilter));
    }
  }, [statusFilter, reviews]);

  const handleSendResponse = async () => {
    if (!selectedReview || !responseText.trim() || !institute?.identifier) return;
    setIsSending(true);
    try {
      await instituteResponseApi.create({
        reviewIdentifier: selectedReview.identifier,
        instituteIdentifier: institute.identifier,
        responseText: responseText.trim(),
        respondedBy: institute.identifier,
      } as Omit<InstituteResponse, 'identifier'>);
      setResponseText('');
      setSelectedReview(null);
      await loadData();
    } catch (err) {
      console.error('Failed to send response', err);
    } finally {
      setIsSending(false);
    }
  };

  const getRatingColor = (rating: number | string) => {
    const num = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (num >= 4) return 'text-green-600';
    if (num >= 3) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reviews & Responses</h1>
        <p className="text-sm text-slate-500 mt-1">Manage student and parent reviews</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState icon={MessageSquare} title="No reviews found" description="Reviews matching the selected filter will appear here" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const overall = typeof review.overallRating === 'string' ? parseFloat(review.overallRating) : review.overallRating;
            return (
              <div
                key={review.identifier}
                onClick={() => setSelectedReview(review)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{review.reviewTitle || 'Review'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        review.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                        review.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                        review.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{review.reviewText}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Star size={12} className={getRatingColor(overall)} fill="currentColor" />
                        <span className={`font-medium ${getRatingColor(overall)}`}>{overall.toFixed(1)}</span>
                      </span>
                      <span>{review.courseTaken}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Detail Panel */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedReview(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Review Details</h2>
              <button onClick={() => setSelectedReview(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{selectedReview.reviewTitle}</h3>
                <p className="text-sm text-slate-600">{selectedReview.reviewText}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Overall', value: selectedReview.overallRating },
                  { label: 'Faculty', value: selectedReview.facultyRating },
                  { label: 'Study Material', value: selectedReview.studyMaterialRating },
                  { label: 'Infrastructure', value: selectedReview.infrastructureRating },
                  { label: 'Fee Value', value: selectedReview.feeValueRating },
                  { label: 'Online Support', value: selectedReview.onlineSupportRating },
                  { label: 'Results', value: selectedReview.resultAchievementRating },
                ].map((r) => (
                  <div key={r.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">{r.label}</p>
                    <p className="text-lg font-bold text-slate-900">
                      {typeof r.value === 'string' ? parseFloat(r.value).toFixed(1) : r.value}
                    </p>
                  </div>
                ))}
              </div>

              {selectedReview.pros && (
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Pros</p>
                  <p className="text-sm text-slate-700">{selectedReview.pros}</p>
                </div>
              )}
              {selectedReview.cons && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">Cons</p>
                  <p className="text-sm text-slate-700">{selectedReview.cons}</p>
                </div>
              )}

              {/* Response Form */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Respond to Review</h4>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your official response..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSendResponse}
                    disabled={!responseText.trim() || isSending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {isSending ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
