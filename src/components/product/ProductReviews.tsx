export interface ProductReview {
  id: string
  reviewer_name: string
  rating: number
  title: string | null
  body: string
  verified_purchase: boolean
  created_at: string
}

interface ProductReviewsProps {
  reviews: ProductReview[]
}

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#f59e0b' : 'none'}
      stroke={filled ? '#f59e0b' : '#d1d5db'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= rating} size={size} />
      ))}
    </span>
  )
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  if (reviews.length === 0) return null

  const totalCount = reviews.length
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount

  return (
    <section className="border-t border-[var(--color-border)] pt-12 mt-12">
      <div className="flex items-baseline gap-4 mb-8">
        <h2 className="text-lg font-medium text-[var(--foreground)]">カスタマーレビュー</h2>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(averageRating)} />
          <span className="text-xs text-[var(--color-muted)]">
            {averageRating.toFixed(1)} ({totalCount}件)
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="pb-8 border-b border-[var(--color-border)] last:border-0">
            <div className="flex items-center gap-3 mb-3">
              <StarRating rating={review.rating} size={12} />
              <span className="text-[11px] text-[var(--foreground)] font-medium">{review.reviewer_name}</span>
              {review.verified_purchase && (
                <span className="text-[9px] tracking-[0.1em] text-emerald-600 bg-emerald-50 px-2 py-0.5">認証済み購入</span>
              )}
            </div>
            {review.title && (
              <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">{review.title}</h3>
            )}
            <p className="text-xs leading-[2] text-[var(--color-muted)]">{review.body}</p>
            <p className="text-[10px] text-[var(--color-border)] mt-2">
              {new Date(review.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
