import Image from "next/image";
import { SortField } from "./types/listing";
import SortIcon from "./SortIcon";
import {
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

interface ListingTableHeaderProps {
  sortField: SortField | null;
  sortDirection: 'asc' | 'desc' | null;
  onSort: (field: SortField) => void;
}

export default function ListingTableHeader({ sortField, sortDirection, onSort }: ListingTableHeaderProps) {
  return (
    <TableHeader className="!text-[#FFFFFF]/50 !mb-2">
      <TableRow className="border-none">
        <TableHead className="!font-bold">
          <span className="hidden">Watchlist button</span>
        </TableHead>
        <TableHead 
          className="!font-bold cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center gap-1">
            Name
            <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('marketCap')}
        >
          <div className="flex items-center justify-center gap-1">
            MC / Liq
            <SortIcon field="marketCap" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('holders')}
        >
          <div className="flex items-center justify-center gap-1">
            Holders
            <SortIcon field="holders" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('age')}
        >
          <div className="flex items-center justify-center gap-1">
            Age
            <SortIcon field="age" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('price')}
        >
          <div className="flex items-center justify-center gap-1">
            Price / 24%
            <SortIcon field="price" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('change1m')}
        >
          <div className="flex items-center justify-center gap-1">
            1m%
            <SortIcon field="change1m" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('change5m')}
        >
          <div className="flex items-center justify-center gap-1">
            5m%
            <SortIcon field="change5m" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('change1h')}
        >
          <div className="flex items-center justify-center gap-1">
            1h%
            <SortIcon field="change1h" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold flex justify-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('communityScore')}
        >
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1">
              Community score
              <Image
                className="mt-0.5"
                src="/info.svg"
                alt="info"
                width={13}
                height={13}
              />
            </span>
            <SortIcon field="communityScore" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead 
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort('degenAudit')}
        >
          <div className="flex items-center justify-center gap-1">
            Risk score
            <SortIcon field="degenAudit" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead>
          <span className="hidden">Listing Engagement</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}

