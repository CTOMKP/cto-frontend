import { ChevronDown, ChevronUp } from "lucide-react";
import { SortField, SortDirection } from "./types/listing";

interface SortIconProps {
  field: SortField;
  sortField: SortField | null;
  sortDirection: SortDirection;
}

export default function SortIcon({ field, sortField, sortDirection }: SortIconProps) {
  if (sortField !== field) {
    return (
      <div className="flex flex-col">
        <ChevronUp className="w-3 h-3 text-gray-400" />
        <ChevronDown className="w-3 h-3 text-gray-400 -mt-1" />
      </div>
    );
  }
  
  if (sortDirection === 'asc') {
    return <ChevronUp className="w-3 h-3 text-white" />;
  } else if (sortDirection === 'desc') {
    return <ChevronDown className="w-3 h-3 text-white" />;
  }
  
  return null;
}

