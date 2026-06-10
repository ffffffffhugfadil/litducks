// src/components/campaigns/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Banner skeleton dengan shimmer */}
      <div className="h-28 animate-shimmer" />
      
      <div className="p-4 space-y-3">
        <div className="h-4 rounded w-2/3 animate-shimmer" />
        <div className="h-3 rounded w-full animate-shimmer" />
        <div className="h-3 rounded w-4/5 animate-shimmer" />
        <div className="h-1.5 rounded-full animate-shimmer" />
        <div className="h-3 rounded w-1/3 animate-shimmer" />
      </div>
    </div>
  )
}
