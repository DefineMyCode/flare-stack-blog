import { Skeleton, SkeletonListRows } from "@/components/ui/skeleton";
import "./muted-users.css";
export function MutedUsersListSkeleton() {
  return (
    <SkeletonListRows
      count={4}
      avatar="circle"
      lines={["h-5 w-1/4", "h-3 w-1/3"]}
    />
  );
}

export function MutedUsersPageSkeleton() {
  return (
    <div className="muted-workspace fuwari-card-base" aria-hidden="true">
      <div className="muted-heading">
        <div className="space-y-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="muted-toolbar">
        <Skeleton className="h-10 w-72 max-w-full rounded-xl" />
      </div>
      <div className="muted-list-scroll">
        <MutedUsersListSkeleton />
      </div>
      <div className="muted-footer">
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}
