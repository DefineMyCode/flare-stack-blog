import { Skeleton } from "@/components/ui/skeleton";
import "@/components/ui/page-heading.css";
import "./dashboard.css";

function PanelHeading({ width }: { width: string }) {
  return <Skeleton className={`h-6 ${width}`} />;
}

export function DashboardSkeleton() {
  return (
    <div
      className="dashboard-workspace admin-workspace fuwari-card-base"
      aria-hidden="true"
    >
      <div className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="dashboard-stats">
        {[0, 1, 2, 3].map((tile) => (
          <div key={tile} className="dashboard-panel">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-column">
          <div className="dashboard-panel dashboard-slot-popular">
            <PanelHeading width="w-32" />
            {[100, 80, 62, 45, 30].map((share) => (
              <div key={share} className="flex items-center gap-4 px-2.5 py-2">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-1.5" style={{ width: `${share}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="dashboard-panel dashboard-slot-writing">
            <Skeleton className="h-28 w-full rounded-[14px]" />
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3 px-2.5 py-1.5">
                <Skeleton className="h-8 w-8 rounded-[10px]" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-column">
          <div className="dashboard-panel dashboard-slot-comments">
            <PanelHeading width="w-28" />
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex gap-3 px-2.5 py-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
