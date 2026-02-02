"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/tax-calculations";
import type { IncomeTaxReturn, VatReturn } from "@/types";

type TaxReturn = (IncomeTaxReturn & { type: "income" }) | (VatReturn & { type: "vat" });

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

interface TaxReturnsListProps {
  incomeReturns: IncomeTaxReturn[];
  vatReturns: VatReturn[];
}

export function TaxReturnsList({ incomeReturns, vatReturns }: TaxReturnsListProps) {
  // Combine and sort returns
  const returns = useMemo<TaxReturn[]>(() => {
    return [
      ...incomeReturns.map((r) => ({ ...r, type: "income" as const })),
      ...vatReturns.map((r) => ({ ...r, type: "vat" as const })),
    ].sort((a, b) => {
      // Sort by year first (most recent first)
      if (b.taxYear !== a.taxYear) {
        return b.taxYear - a.taxYear;
      }
      // For VAT returns, sort by quarter (most recent first)
      const aQuarter = a.type === "vat" ? (a as VatReturn & { type: "vat" }).quarter : 4;
      const bQuarter = b.type === "vat" ? (b as VatReturn & { type: "vat" }).quarter : 4;
      return bQuarter - aQuarter;
    });
  }, [incomeReturns, vatReturns]);

  if (returns.length === 0) {
    return (
      <div className="p-6">
        <p className="text-slate-500 text-sm">You don&apos;t have any tax returns yet. Start filing above!</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {returns.map((taxReturn) => (
        <div
          key={taxReturn.id}
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              taxReturn.type === "income" ? "bg-blue-100" : "bg-green-100"
            }`}>
              {taxReturn.type === "income" ? (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {taxReturn.type === "income"
                  ? `Income Tax ${taxReturn.taxYear}`
                  : `VAT Q${(taxReturn as VatReturn).quarter} ${taxReturn.taxYear}`
                }
              </p>
              <p className="text-sm text-slate-500">
                Total: {formatCurrency(Number(taxReturn.totalDue))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[taxReturn.status]}`}>
              {statusLabels[taxReturn.status]}
            </span>
            <Link
              href={`/tax/returns/${taxReturn.type}/${taxReturn.id}`}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded font-medium text-slate-900 hover:bg-slate-100 transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
