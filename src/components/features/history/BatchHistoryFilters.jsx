/**
 * BatchHistoryFilters.jsx — Feature component.
 *
 * CDD Layer 3: Search, date range pickers, and quick filter buttons
 * for the HISTORY tab.
 */
"use client";

import { Search, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function BatchHistoryFilters({
  query, onQueryChange,
  dateFrom, onDateFromChange,
  dateTo,   onDateToChange,
  onToday, onLast7Days, onThisMonth, onClear, onClearAll,
  resultCount,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 min-w-[250px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          id="history-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by docket, customer, grade, site, truck…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm focus:border-brand-1 focus:outline-none focus:ring-1 focus:ring-brand-1/20 transition-colors"
        />
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <CalendarDays size={14} />
        <span>From</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-1 focus:outline-none"
        />
        <span>To</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-1 focus:outline-none"
        />
      </div>

      {/* Quick filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToday}>Today</Button>
        <Button variant="ghost" size="sm" onClick={onLast7Days}>Last 7 Days</Button>
        <Button variant="ghost" size="sm" onClick={onThisMonth}>This Month</Button>
        <Button variant="secondary" size="sm" onClick={onClear}>Clear Filters</Button>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={onClearAll} 
          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
        >
          Delete All
        </Button>
      </div>

      {/* Record count */}
      <span className="ml-auto text-xs text-muted">
        Showing <span className="font-semibold text-foreground">{resultCount}</span> records
      </span>
    </div>
  );
}
