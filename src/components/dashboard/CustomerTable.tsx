/**
 * ============================================================
 * OCEANIQUE — CustomerTable (Dashboard)
 * ============================================================
 * Sortable client-component table for the Customers page.
 * Columns: Client, Email, Country, Bookings, Lifetime Value,
 * VIP, and a View action button.
 * ============================================================
 */

"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye } from "lucide-react";
import type { Customer } from "@/types/customer";

export type CustomerSortKey = "customerNumber" | "name" | "country" | "totalBookings" | "totalSpent" | "joinedDate";

interface CustomerTableProps {
  customers: Customer[];
  limit?:    number;
  sortKey?:  CustomerSortKey;
  sortDir?:  "asc" | "desc";
  onSort?:   (key: CustomerSortKey) => void;
  onView?:   (customer: Customer) => void;
}

function SortHeader({ label, col, sortKey, sortDir, onSort }: {
  label: string; col: CustomerSortKey;
  sortKey?: CustomerSortKey; sortDir?: "asc"|"desc";
  onSort?: (k: CustomerSortKey) => void;
}) {
  const active = sortKey === col;
  if (!onSort) return <th className="text-left text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3 pr-4">{label}</th>;
  return (
    <th className="py-3 pr-4">
      <button
        onClick={() => onSort(col)}
        className="flex items-center gap-1 text-xs tracking-[0.1em] uppercase font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {label}
        {active
          ? sortDir === "asc" ? <ChevronUp size={12} className="text-gold" /> : <ChevronDown size={12} className="text-gold" />
          : <ChevronsUpDown size={12} className="opacity-30" />
        }
      </button>
    </th>
  );
}

export function CustomerTable({ customers, limit, sortKey, sortDir, onSort, onView }: CustomerTableProps) {
  const rows = useMemo(() => {
    const list = limit ? customers.slice(0, limit) : customers;
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      if (sortKey === "customerNumber"){ av = a.customerNumber ?? 0; bv = b.customerNumber ?? 0; }
      if (sortKey === "name")          { av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}`; }
      if (sortKey === "country")       { av = a.country;        bv = b.country; }
      if (sortKey === "totalBookings") { av = a.totalBookings;  bv = b.totalBookings; }
      if (sortKey === "totalSpent")    { av = a.totalSpent;     bv = b.totalSpent; }
      if (sortKey === "joinedDate")    { av = a.joinedDate;     bv = b.joinedDate; }
      const cmp = typeof av === "number" ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [customers, limit, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-border">
            <SortHeader label="#" col="customerNumber" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="Client"          col="name"          sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th className="text-left text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3 pr-4">Email</th>
            <SortHeader label="Country"         col="country"       sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="Bookings"        col="totalBookings" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <SortHeader label="Lifetime Value"  col="totalSpent"    sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <th className="text-center text-muted-foreground text-xs tracking-[0.1em] uppercase font-medium py-3 pr-4">VIP</th>
            {onView && <th className="py-3" />}
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
              <td className="py-3 pr-4">
                <span className="font-mono text-[11px] text-muted-foreground">
                  #{String(c.customerNumber ?? 0).padStart(3, "0")}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-gold text-[10px] font-heading font-semibold">{c.firstName[0]}{c.lastName[0]}</span>
                  </div>
                  <span className="font-medium text-foreground">{c.firstName} {c.lastName}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-muted-foreground text-xs">{c.email}</td>
              <td className="py-3 pr-4 text-muted-foreground">{c.country}</td>
              <td className="py-3 pr-4 text-foreground">{c.totalBookings}</td>
              <td className="py-3 pr-4 text-foreground font-medium">${c.totalSpent.toLocaleString()}</td>
              <td className="py-3 pr-4 text-center">
                {c.vip
                  ? <span className="bg-gold/10 text-gold border border-gold/20 text-[10px] font-body px-2 py-0.5 tracking-[0.1em] uppercase">VIP</span>
                  : <span className="text-muted-foreground/30 text-xs">—</span>
                }
              </td>
              {onView && (
                <td className="py-3 pl-2">
                  <button
                    onClick={() => onView(c)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-body text-muted-foreground hover:text-gold border border-border hover:border-gold/40 px-2.5 py-1 transition-colors"
                  >
                    <Eye size={12} /> View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
