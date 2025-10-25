export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />;
}
