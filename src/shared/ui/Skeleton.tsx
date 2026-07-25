import type { CSSProperties } from "react";
import { clsx } from "clsx";

/**
 * A single placeholder block. Purely presentational and `aria-hidden` — the
 * surrounding `SkeletonScreen` is what announces the loading state, so screen
 * readers hear one message instead of a wall of anonymous boxes.
 *
 * `delay` staggers the shimmer across siblings (see `.skeleton` in globals.css).
 */
export function Skeleton({
  className,
  accent = false,
  delay = 0,
  style,
}: {
  className?: string;
  /** Tint with the theme's primary instead of the muted sub-text colour. */
  accent?: boolean;
  /** Shimmer offset in ms — stagger rows so a list animates as one wave. */
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx("skeleton", accent && "skeleton-accent", className)}
      style={{ "--skeleton-delay": `${delay}ms`, ...style } as CSSProperties}
    />
  );
}

/**
 * Wraps a set of skeletons as one live region. Assistive tech gets a single
 * "Loading X" announcement, and the busy state is dropped from the a11y tree as
 * soon as the real content replaces this subtree.
 */
export function SkeletonScreen({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
