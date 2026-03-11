/**
 * BatchHistoryFilters.jsx — Feature component.
 *
 * CDD Layer 3: Search, date range pickers, and quick filter buttons
 * for the HISTORY tab. Fully mobile-responsive.
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
    <div className="flex flex-col gap-3">
      {/* Search input — full width */}
      <div className="relative w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          id="history-search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by docket, customer, grade, truck…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm focus:border-brand-1 focus:outline-none focus:ring-1 focus:ring-brand-1/20 transition-colors"
        />
      </div>

      {/* Date range — 2-col grid on mobile */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-muted flex items-center gap-1">
            <CalendarDays size={11} /> From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-1 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-muted">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm focus:border-brand-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick filter buttons + count */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToday}>Today</Button>
        <Button variant="ghost" size="sm" onClick={onLast7Days}>Last 7 Days</Button>
        <Button variant="ghost" size="sm" onClick={onThisMonth}>This Month</Button>
        <Button variant="secondary" size="sm" onClick={onClear}>Clear</Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onClearAll}
          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
        >
          Delete All
        </Button>
        <span className="ml-auto text-xs text-muted">
          Showing <span className="font-semibold text-foreground">{resultCount}</span> records
        </span>
      </div>
    </div>
  );
}
