export default function RatingStars({
  rating,
  count,
  compact = false,
}: {
  rating: number;
  count?: number;
  compact?: boolean;
}) {
  const rounded = Math.round(Math.max(0, Math.min(5, rating)));

  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <svg
            key={index}
            viewBox="0 0 20 20"
            className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} ${
              index < rounded ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
            }`}
          >
            <path d="M10 1.8l2.45 4.96 5.47.8-3.96 3.86.94 5.44L10 14.3l-4.9 2.56.94-5.44L2.08 7.56l5.47-.8L10 1.8z" />
          </svg>
        ))}
      </div>
      {!compact && <span className="text-xs font-bold text-neutral-700">{rating.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-xs text-neutral-400">({count})</span>
      )}
    </div>
  );
}
