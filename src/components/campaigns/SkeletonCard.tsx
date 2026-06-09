export default function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-28 bg-surface-2" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-2 rounded w-2/3" />
        <div className="h-3 bg-surface-2 rounded w-full" />
        <div className="h-3 bg-surface-2 rounded w-4/5" />
        <div className="h-1.5 bg-surface-2 rounded-full" />
        <div className="h-3 bg-surface-2 rounded w-1/3" />
      </div>
    </div>
  )
}
