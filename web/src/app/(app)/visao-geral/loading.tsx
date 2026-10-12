import { CardSkeleton, PageHeaderSkeleton, Skeleton } from '@/ui/skeleton';

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <CardSkeleton rows={2} />
            <Skeleton className="h-80 w-full rounded-2xl" />
            <CardSkeleton rows={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
