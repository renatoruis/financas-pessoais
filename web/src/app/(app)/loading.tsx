import { CardSkeleton, PageHeaderSkeleton } from '@/ui/skeleton';

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} rows={4} />
        ))}
      </div>
    </div>
  );
}
