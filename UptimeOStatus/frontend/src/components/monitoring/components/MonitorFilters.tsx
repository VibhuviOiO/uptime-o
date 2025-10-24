import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Clock, X } from 'lucide-react';

interface MonitorFiltersProps {
  filters: any;
  onFiltersChange: (filters: Partial<any>) => void;
  className?: string;
}

export const MonitorFilters: React.FC<MonitorFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ""
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  React.useEffect(() => {
    onFiltersChange({ search: searchInput });
  }, [searchInput, onFiltersChange]);

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md mb-4 ${className}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 h-8 px-3">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <Input
              placeholder="Search monitors, URLs, paths..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 text-sm"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2"
                onClick={() => setSearchInput("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        {/* Time Range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs flex-shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              {filters.showActiveOnly ? `Last ${filters.activeWindow}m` : 'All time'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFiltersChange({ showActiveOnly: false })}>
              All time
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFiltersChange({ showActiveOnly: true, activeWindow: 5 })}>
              Last 5 minutes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFiltersChange({ showActiveOnly: true, activeWindow: 15 })}>
              Last 15 minutes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFiltersChange({ showActiveOnly: true, activeWindow: 30 })}>
              Last 30 minutes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFiltersChange({ showActiveOnly: true, activeWindow: 60 })}>
              Last 1 hour
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};