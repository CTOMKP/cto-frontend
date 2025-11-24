import { Search } from "lucide-react";
import { CardAction } from "../../../components/ui/card";
import ListingsCategoryFilter, { Category } from "../../../components/ListingsCategoryFilter";
import MemeCategoryFilter, { MemeCategory } from "../../../components/MemeCategoryFilter";
import NetworkFilter, { Network } from "../../../components/NetworkFilter";
import FilterButton from "../../../components/FilterButton";
import { Input } from "../../../components/ui/input";
import { ApiCoinItem } from "@/types/api";

interface ListingFiltersProps {
  category: Category;
  setCategory: (category: Category) => void;
  memeCategory: MemeCategory;
  setMemeCategory: (category: MemeCategory) => void;
  selectedNetwork: Network | null;
  setSelectedNetwork: (network: Network | null) => void;
  rawApiItems: ApiCoinItem[];
  onFilterChange: (filteredItems: ApiCoinItem[]) => void;
}

export default function ListingFilters({
  category,
  setCategory,
  memeCategory,
  setMemeCategory,
  selectedNetwork,
  setSelectedNetwork,
  rawApiItems,
  onFilterChange,
}: ListingFiltersProps) {
  return (
    <>
      <CardAction>
        <div className="flex gap-3">
          <ListingsCategoryFilter
            selected={category}
            onChange={(c: Category) => setCategory(c)}
          />
          <MemeCategoryFilter
            selected={memeCategory}
            onChange={(c: MemeCategory) => setMemeCategory(c)}
          />
        </div>
      </CardAction>

      <CardAction>
        <div className="flex items-center gap-2">
          <FilterButton 
            items={rawApiItems}
            onFilterChange={onFilterChange}
          />
          <div className="relative flex items-center">
            <Input
              className="border-[0.2px] pl-7 max-w-50 placeholder:font-medium border-[#FFFFFF20] text-white placeholder:text-[#FFFFFF80] focus:!border-[0.2px] focus:!border-white focus-visible:ring-0"
              placeholder="Ask Baws anything"
            />
            <Search size={16} color="#FFFFFF50" className="absolute left-2" />
          </div>

          <NetworkFilter
            selectedNetwork={selectedNetwork}
            onChange={setSelectedNetwork}
          />
        </div>
      </CardAction>
    </>
  );
}

