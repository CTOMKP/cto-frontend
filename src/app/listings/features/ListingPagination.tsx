"use client";

import { Button } from "../../../components/ui/button";
import { useTranslation } from "react-i18next";

interface ListingPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function visiblePageNumbers(current: number, total: number, max = 10): number[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function ListingPagination({ page, totalPages, onPageChange }: ListingPaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const pages = visiblePageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <Button disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>{t("common.previous")}</Button>
      <div className="flex items-center gap-2">
        {pages[0] > 1 && <span className="text-xs opacity-70">…</span>}
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? undefined : "ghost"}
            onClick={() => onPageChange(p)}
            className={p === page ? "border border-white/50 rounded-lg" : ""}
          >
            {p}
          </Button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <span className="text-xs opacity-70">… {totalPages}</span>
        )}
      </div>
      <Button disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>{t("common.next")}</Button>
    </div>
  );
}
