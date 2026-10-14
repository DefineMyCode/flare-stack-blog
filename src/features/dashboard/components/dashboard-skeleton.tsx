import { Skeleton } from "@/components/ui/skeleton";
import "./dashboard.css";

export function DashboardSkeleton() {
  return (
    <div className="dashboard-workspace fuwari-card-base" aria-hidden="true">
      <div className="dashboard-header">
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="dashboard-layout">
        <div className="dashboard-resume">
          <div className="space-y-4 w-2/3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
        <div className="dashboard-recent">
          <Skeleton className="h-4 w-20 mb-5" />
          <div className="dashboard-posts">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </div>
        <div className="dashboard-activity dashboard-activity-split">
          {[0, 1].map((column) => (
            <div
              key={column}
              className={column ? "dashboard-comments" : "dashboard-tasks"}
            >
              <Skeleton className="h-6 w-28 mb-6" />
              {[0, 1, 2].map((row) => (
                <div key={row} className="py-5 space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
