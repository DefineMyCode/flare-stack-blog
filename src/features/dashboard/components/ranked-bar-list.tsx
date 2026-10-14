import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./ranked-bar-list.css";

/**
 * A ranked list where each row carries a bar proportional to its value.
 * Every value is printed beside its bar, so the list is its own table view.
 */
export function RankedBarList({ className, ...props }: ComponentProps<"ol">) {
  return <ol {...props} className={cn("ranked-bar-list", className)} />;
}

/**
 * One row. `title` is usually a link; it stretches over the whole row, and
 * `action` stays clickable above it.
 */
export function RankedBarRow({
  rank,
  title,
  value,
  max,
  valueText,
  action,
}: {
  rank: number;
  title: ReactNode;
  value: number;
  /** The largest value in the list; it fills the bar. */
  max: number;
  valueText: ReactNode;
  action?: ReactNode;
}) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <li className="ranked-bar-row">
      <span className="ranked-bar-rank">{rank}</span>
      <div className="ranked-bar-main">
        <span className="ranked-bar-title">{title}</span>
        <div className="ranked-bar-line">
          <span className="ranked-bar-track" aria-hidden="true">
            <span
              className="ranked-bar-fill"
              style={{ inlineSize: `${(share * 100).toFixed(2)}%` }}
            />
          </span>
          <span className="ranked-bar-value">{valueText}</span>
        </div>
      </div>
      {action ? <div className="ranked-bar-action">{action}</div> : null}
    </li>
  );
}
