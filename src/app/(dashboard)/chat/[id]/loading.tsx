import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingUI() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4">
      {/* Chat Box Skeleton */}
      <Skeleton className="flex-1 rounded-(--radius) border p-4" />

      {/* Input Area Skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="h-[60px] w-full rounded-(--radius)" />
      </div>
    </div>
  );
}
