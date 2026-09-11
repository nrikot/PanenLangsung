"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav role="navigation" aria-label="Pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />
);

const PaginationContent = ({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
);

const PaginationItem = ({ className, ...props }: React.ComponentProps<"li">) => (
  <li className={cn("", className)} {...props} />
);

interface PaginationLinkProps extends React.ComponentProps<"a"> {
  isActive?: boolean;
}

const PaginationLink = ({ isActive, className, ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
      isActive ? "dark:bg-white/10 dark:text-gray-100 bg-slate-900 text-white" : "dark:text-[#8b9e93] dark:hover:text-gray-100 text-slate-500 hover:text-slate-900",
      className
    )}
    {...props}
  />
);

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<"a">) => {
  const disabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const t = useTranslations("pagination");
  return (
    <a
      className={cn(
        "flex h-9 items-center gap-1 rounded-lg border dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 bg-white px-3 text-sm font-medium transition-colors hover:bg-slate-50",
        disabled
          ? "pointer-events-none dark:text-white/20 text-slate-300"
          : "dark:text-[#8b9e93] dark:hover:text-gray-100 text-slate-500 hover:text-slate-900",
        className
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{t("previous")}</span>
    </a>
  );
};

const PaginationNext = ({ className, ...props }: React.ComponentProps<"a">) => {
  const disabled = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const t = useTranslations("pagination");
  return (
    <a
      className={cn(
        "flex h-9 items-center gap-1 rounded-lg border dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 bg-white px-3 text-sm font-medium transition-colors hover:bg-slate-50",
        disabled
          ? "pointer-events-none dark:text-white/20 text-slate-300"
          : "dark:text-[#8b9e93] dark:hover:text-gray-100 text-slate-500 hover:text-slate-900",
        className
      )}
      {...props}
    >
      <span>{t("next")}</span>
      <ChevronRight className="h-4 w-4" />
    </a>
  );
};

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => {
  const t = useTranslations("pagination");
  return (
    <span className={cn("flex h-9 w-9 items-center justify-center dark:text-[#8b9e93] text-slate-400", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t("ellipsis")}</span>
    </span>
  );
};

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis };
