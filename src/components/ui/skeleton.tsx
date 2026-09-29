import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Base shimmer block. Purely decorative, so it is hidden from assistive
 * technology — wrap loading placeholders in <SkeletonRegion> so the busy
 * state is still announced.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden="true" {...props} />;
}

interface SkeletonRegionProps extends React.ComponentProps<"div"> {
  /** Localised, visually hidden busy label (screen readers only). */
  label?: string;
}

/** Announces a busy state and holds the skeleton layout together. */
function SkeletonRegion({ label, className, children, ...props }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className} {...props}>
      {label ? <span className="sr-only">{label}</span> : null}
      {children}
    </div>
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

function SkeletonTitle({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

/** ── Product card grid (catalog, auction grid, RFQ grid) ────────────────── */

function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton-panel overflow-hidden", className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

function SkeletonProductGrid({
  count = 8,
  label,
  className,
  columns = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: {
  count?: number;
  label?: string;
  className?: string;
  columns?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn("grid gap-6", columns, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </SkeletonRegion>
  );
}

/** ── Compact card (auction / RFQ catalog tiles — no cover image) ──────────── */

function SkeletonTileCard({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton-panel space-y-4 p-5", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

function SkeletonTileGrid({ count = 6, label, className }: { count?: number; label?: string; className?: string }) {
  return (
    <SkeletonRegion label={label} className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTileCard key={i} />
      ))}
    </SkeletonRegion>
  );
}

/** ── Horizontal row list (auction / RFQ dashboards) ──────────────────────── */

function SkeletonRowCard({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton-panel space-y-4 p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="w-32 space-y-2">
          <Skeleton className="ml-auto h-3 w-full" />
          <Skeleton className="ml-auto h-3 w-4/5" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function SkeletonRowList({ count = 4, label, className }: { count?: number; label?: string; className?: string }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRowCard key={i} />
      ))}
    </SkeletonRegion>
  );
}

/** ── Data table ──────────────────────────────────────────────────────────── */

function SkeletonTable({
  rows = 8,
  columns = 6,
  label,
  className,
}: {
  rows?: number;
  columns?: number;
  label?: string;
  className?: string;
}) {
  const widths = ["w-28", "w-32", "w-24", "w-20", "w-16", "w-12"];

  return (
    <SkeletonRegion label={label} className={cn("skeleton-panel overflow-hidden", className)}>
      <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-100 px-4 py-3 dark:border-white/10 dark:bg-white/5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", widths[i % widths.length])} />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-3", c === 0 ? "w-40" : widths[c % widths.length])}
              />
            ))}
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** ── Statistic tiles ─────────────────────────────────────────────────────── */

function SkeletonStatCards({ count = 4, label, className }: { count?: number; label?: string; className?: string }) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-panel space-y-3 p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** ── Forms ───────────────────────────────────────────────────────────────── */

function SkeletonForm({
  fields = 6,
  label,
  className,
  submit = true,
}: {
  fields?: number;
  label?: string;
  className?: string;
  submit?: boolean;
}) {
  return (
    <SkeletonRegion label={label} className={cn("skeleton-panel space-y-5 p-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      {submit ? <Skeleton className="h-11 w-40 rounded-lg" /> : null}
    </SkeletonRegion>
  );
}

/** ── Detail / edit page (image + copy, then a form) ──────────────────────── */

function SkeletonDetail({ label, className }: { label?: string; className?: string }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-8", className)}>
      <SkeletonTitle />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-40" />
          <SkeletonText lines={4} />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-56 rounded-lg" />
        </div>
      </div>
    </SkeletonRegion>
  );
}

/** ── Chat thread ─────────────────────────────────────────────────────────── */

function SkeletonThreadList({ count = 5, label, className }: { count?: number; label?: string; className?: string }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-panel flex items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-14 shrink-0" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

function SkeletonChat({ messages = 4, label, className }: { messages?: number; label?: string; className?: string }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-4", className)}>
      {Array.from({ length: messages }).map((_, i) => (
        <div key={i} className={cn("flex gap-3", i % 2 === 1 && "flex-row-reverse")}>
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className={cn("h-12 rounded-xl", i % 2 === 1 ? "w-2/5" : "w-3/5")} />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** ── Auth card (login / register) ────────────────────────────────────────── */

function SkeletonAuthCard({ label, className }: { label?: string; className?: string }) {
  return (
    <SkeletonRegion label={label} className={cn("w-full max-w-md", className)}>
      <Skeleton className="mx-auto mb-8 h-8 w-40" />
      <div className="skeleton-panel space-y-5 p-8">
        <Skeleton className="mx-auto h-7 w-40" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="mx-auto h-3 w-48" />
      </div>
    </SkeletonRegion>
  );
}

/** ── Page shells ─────────────────────────────────────────────────────────── */

/** Nav-bar shaped page shell. Children render inside the standard container. */
function SkeletonPage({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("min-h-screen dark:bg-[#0d1410] bg-slate-50", className)}
    >
      <div className="border-b border-black/10 bg-white/85 dark:border-white/5 dark:bg-[#0d1410]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
          <Skeleton className="h-6 w-36" />
          <div className="hidden items-center gap-5 md:flex lg:gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg md:hidden" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">{children}</div>
    </SkeletonRegion>
  );
}

/** Generic page body: title block + content skeleton, for use under a real Header. */
function SkeletonPageBody({ label, className, children }: { label?: string; className?: string; children?: React.ReactNode }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-6", className)}>
      <SkeletonTitle />
      {children}
    </SkeletonRegion>
  );
}

export {
  Skeleton,
  SkeletonRegion,
  SkeletonText,
  SkeletonTitle,
  SkeletonProductCard,
  SkeletonProductGrid,
  SkeletonTileCard,
  SkeletonTileGrid,
  SkeletonRowCard,
  SkeletonRowList,
  SkeletonTable,
  SkeletonStatCards,
  SkeletonForm,
  SkeletonDetail,
  SkeletonThreadList,
  SkeletonChat,
  SkeletonAuthCard,
  SkeletonPage,
  SkeletonPageBody,
};
