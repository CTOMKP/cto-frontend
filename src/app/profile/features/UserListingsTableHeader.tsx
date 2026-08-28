"use client";

import Image from "next/image";
import { SortField } from "@/app/listings/features/types/listing";
import SortIcon from "@/app/listings/features/SortIcon";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface UserListingsTableHeaderProps {
  sortField: SortField | null;
  sortDirection: "asc" | "desc" | null;
  onSort: (field: SortField) => void;
}

export default function UserListingsTableHeader({
  sortField,
  sortDirection,
  onSort,
}: UserListingsTableHeaderProps) {
  const { t } = useTranslation();
  return (
    <TableHeader className="!text-[#FFFFFF]/50 !mb-2">
      <TableRow className="border-none">
        <TableHead className="!font-bold">
          <span className="hidden">Watchlist button</span>
        </TableHead>
        <TableHead
          className="!font-bold cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort("name")}
        >
          <div className="flex items-center gap-1">
            {t("common.name")}
            <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead className="!font-bold text-center">
          {t("common.status")}
        </TableHead>
        <TableHead
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort("marketCap")}
        >
          <div className="flex items-center justify-center gap-1">
            {t("listings.mcLiq")}
            <SortIcon field="marketCap" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort("holders")}
        >
          <div className="flex items-center justify-center gap-1">
            {t("common.holders")}
            <SortIcon field="holders" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort("age")}
        >
          <div className="flex items-center justify-center gap-1">
            {t("common.age")}
            <SortIcon field="age" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead
          className="!font-bold text-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort("price")}
        >
          <div className="flex items-center justify-center gap-1">
            {t("listings.price24")}
            <SortIcon field="price" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
        <TableHead
          className="!font-bold flex justify-center cursor-pointer hover:text-white transition-colors"
          onClick={() => onSort("communityScore")}
        >
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1">
              {t("common.communityScore")}
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
          onClick={() => onSort("degenAudit")}
        >
          <div className="flex items-center justify-center gap-1">
            {t("common.riskScore")}
            <SortIcon field="degenAudit" sortField={sortField} sortDirection={sortDirection} />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
