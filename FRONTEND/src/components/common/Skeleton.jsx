import clsx from 'clsx';

export function SkeletonBox({ className }) {
  return (
    <div className={clsx('animate-pulse rounded-xl bg-gray-200', className)} />
  );
}

export function FacilityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <SkeletonBox className="h-40 rounded-none" />
      <div className="p-5 space-y-3">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-3 w-1/3" />
        <SkeletonBox className="h-4 w-full" />
        <div className="flex gap-3 pt-2">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <SkeletonBox className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-5 w-2/3" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
        <SkeletonBox className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-4 mt-4">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-3 w-32" />
        <SkeletonBox className="h-3 w-24" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonBox className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <SkeletonBox className="w-11 h-11 rounded-xl" />
        <SkeletonBox className="w-4 h-4" />
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-8 w-16" />
      </div>
    </div>
  );
}
