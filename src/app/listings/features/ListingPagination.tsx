import { Button } from "../../../components/ui/button";

interface ListingPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ListingPagination({ page, totalPages, onPageChange }: ListingPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <Button disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>Previous</Button>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).slice(0, 10).map((_, idx) => {
          const p = idx + 1;
          return (
            <Button 
              key={p} 
              variant={p === page ? undefined : "ghost"} 
              onClick={() => onPageChange(p)}
              className={p === page ? "border border-white/50 rounded-lg" : ""}
            >
              {p}
            </Button>
          );
        })}
        {totalPages > 10 && <span className="text-xs opacity-70">... {totalPages}</span>}
      </div>
      <Button disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Next</Button>
    </div>
  );
}

