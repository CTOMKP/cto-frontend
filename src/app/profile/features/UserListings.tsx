"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { TableRow, TableCell } from "@/components/ui/table";
import { MockLikeCoin, SortField, SortDirection } from "@/app/listings/features/types/listing";
import { AllUserListings } from "@/types/api";
// import { convertAgeToRelative, formatRelativeAge } from "@/app/listings/features/utils/listingUtils";
import { userListingsService } from "@/services/userListingsService";
import UserListingsTableHeader from "./UserListingsTableHeader";
import UserListingsTableRow from "./UserListingsTableRow";
import UserListingsTableSkeleton from "./UserListingsTableSkeleton";

export default function UserListings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<MockLikeCoin[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      const mineData = await userListingsService.mine() as { success?: boolean; items?: AllUserListings[] };
      const items = mineData?.items ?? [];

      const mapped: MockLikeCoin[] = items.map((it: AllUserListings) => {
        // let ageStr: string | null = null;

        // const ageDisplay = it.scanMetadata?.age_display;
        // if (typeof ageDisplay === "string" && ageDisplay.trim() !== "") {
        //   ageStr = convertAgeToRelative(ageDisplay) || ageDisplay;
        // } else {
        //   const created = it.scanMetadata?.creation_date ? new Date(it.scanMetadata.creation_date) : null;
        //   ageStr = created ? formatRelativeAge(created) : null;
        // }

        const holderCount = it.scanMetadata?.holder_count ?? null;
        let tier: string | null = it.vettingTier ?? null;
        if (tier) {
          tier = String(tier).trim().toLowerCase();
          if (
            tier === "none" || tier === "null" || tier === "undefined" || tier === "" ||
            tier === "—" || tier === "----" || tier === "------" || tier.startsWith("---") ||
            tier === "n/a" || tier === "na" || /^[-—]+$/.test(tier)
          ) {
            tier = null;
          }
        }

        const change24h = 0;
        return {
          name: it.scanMetadata?.token_name || it.scanMetadata?.token_symbol || "",
          whale: false,
          age: it.scanMetadata.age_display,
          status: it.status,
          address: it.contractAddr,
          x: undefined,
          website: undefined,
          image: it.logoUrl ?? undefined,
          chain: it.chain ?? "solana",
          category: "meme",
          communityScore: 50,
          links: {
            website: it?.links?.website ?? '#',
            twitter: it?.links?.twitter ?? '#',
            telegram: it?.links?.telegram ?? '#',
            discord: it?.links?.discord ?? "#",
          },
          degenAudit: typeof it.scanRiskScore === "number" ? it.scanRiskScore : (it?.scanRiskScore ?? 0),
          tier,
          mindshare: undefined,
          price: {
            amount: Number(it.scanMetadata?.token_price ?? 0),
            change: { "1m": 0, "5m": 0, "1h": 0, "5h": 0, "24h": change24h },
          },
          marketCap: Number(it.scanMetadata?.market_cap ?? 0),
          liquidity: Number(it.scanMetadata?.lp_amount_usd ?? 0),
          volume: { amount: Number(it.scanMetadata?.volume_24h ?? 0) },
          holders: holderCount != null ? Number(holderCount) : 0,
        } as MockLikeCoin;
      });

      setTableData(mapped);
    } catch (error) {
      console.error("Failed to fetch user listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = "asc";
    if (sortField === field) {
      if (sortDirection === "asc") newDirection = "desc";
      else if (sortDirection === "desc") newDirection = null;
    }
    setSortField(newDirection ? field : null);
    setSortDirection(newDirection);
  };

  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return tableData;
    return [...tableData].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "marketCap":
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        case "liquidity":
          aVal = a.liquidity;
          bVal = b.liquidity;
          break;
        case "holders":
          aVal = a.holders ?? 0;
          bVal = b.holders ?? 0;
          break;
        case "age":
          aVal = a.age ? parseInt(a.age.replace(/\D/g, ""), 10) : 0;
          bVal = b.age ? parseInt(b.age.replace(/\D/g, ""), 10) : 0;
          break;
        case "price":
          aVal = a.price.amount;
          bVal = b.price.amount;
          break;
        case "change24h":
          aVal = a.price.change["24h"];
          bVal = b.price.change["24h"];
          break;
        case "change1m":
          aVal = a.price.change["1m"];
          bVal = b.price.change["1m"];
          break;
        case "change5m":
          aVal = a.price.change["5m"];
          bVal = b.price.change["5m"];
          break;
        case "change1h":
          aVal = a.price.change["1h"];
          bVal = b.price.change["1h"];
          break;
        case "communityScore":
          aVal = a.communityScore;
          bVal = b.communityScore;
          break;
        case "degenAudit":
          aVal = a.degenAudit;
          bVal = b.degenAudit;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [tableData, sortField, sortDirection]);

  const handleProjectClick = (projectAddress: string) => {
    router.push(`/projectProfile/${projectAddress}`);
  };

  return (
    <div>
      <Card className="w-full p-3 border-none border-[#FF007510] text-white bg-transparent">
        <CardContent className="px-0 overflow-auto hide-scrollbar">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-separate border-spacing-y-2">
              <UserListingsTableHeader
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <tbody>
                {loading ? (
                  <UserListingsTableSkeleton />
                ) : sortedData.length > 0 ? (
                  sortedData.map((coin, index) => (
                    <UserListingsTableRow
                      key={coin.address + index}
                      coin={coin}
                      onProjectClick={handleProjectClick}
                    />
                  ))
                ) : (
                  <TableRow className="border-none">
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-white/60"
                    >
                      No listings found
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}