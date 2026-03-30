"use client";

import { useState } from "react";
import { Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSortProps {
  filterLabel?: string;
  filterOptions: FilterOption[];
  onFilterChange?: (value: string) => void;
  sortOptions: FilterOption[];
  onSortChange?: (value: string) => void;
}

export function FilterSort({ 
  filterLabel = "Filter", 
  filterOptions, 
  onFilterChange,
  sortOptions, 
  onSortChange 
}: FilterSortProps) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  return (
    <div className="flex items-center gap-2">
      <Select value={filter} onValueChange={(v) => { setFilter(v); onFilterChange?.(v); }}>
        <SelectTrigger className="w-40">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder={filterLabel} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => { setSort(v); onSortChange?.(v); }}>
        <SelectTrigger className="w-40">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
