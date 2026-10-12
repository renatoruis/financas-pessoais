import { CardSkeleton, PageHeaderSkeleton, Skeleton } from '@/ui/skeleton';

/** Dentro do layout da entidade: o nome e as tabs já estão visíveis. */
export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-2xl" />
        <CardSkeleton rows={6} />
      </div>
    </div>
  );
}
