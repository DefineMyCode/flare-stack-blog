import { createLink } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./stat-tile.css";

type StatTileProps = {
  icon: LucideIcon;
  label: ReactNode;
  /** Already formatted, e.g. with thousands separators. */
  value: ReactNode;
  /** One muted line under the value. */
  detail: ReactNode;
  /**
   * A dot before the detail: `warning` for state that needs fixing,
   * `primary` for something new to act on.
   */
  dot?: "warning" | "primary";
};

/** A headline number with its label and one line of context, as a link. */
function StatTileAnchor({
  icon: Icon,
  label,
  value,
  detail,
  dot,
  className,
  ...props
}: Omit<ComponentProps<"a">, "children"> & StatTileProps) {
  return (
    <a {...props} className={cn("stat-tile", className)}>
      <span className="stat-tile-label">
        <span className="stat-tile-icon" aria-hidden="true">
          <Icon size={16} />
        </span>
        <span className="stat-tile-label-text">{label}</span>
        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="stat-tile-arrow"
        />
      </span>
      <span className="stat-tile-value">{value}</span>
      <span className="stat-tile-detail" data-dot={dot}>
        {detail}
      </span>
    </a>
  );
}

export const StatTile = createLink(StatTileAnchor);
