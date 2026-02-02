"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { incomeTaxApi, vatApi } from "@/lib/api";
import type { IncomeTaxReturn, VatReturn } from "@/types";

const currentYear = new Date().getFullYear();

// Income tax years available to file (previous 3 years)
const INCOME_TAX_YEARS = [currentYear - 1, currentYear - 2, currentYear - 3];

// VAT periods: current year and previous year, all 4 quarters each
const VAT_PERIODS: { year: number; quarter: number }[] = [];
for (const year of [currentYear, currentYear - 1]) {
  for (const quarter of [1, 2, 3, 4]) {
    VAT_PERIODS.push({ year, quarter });
  }
}

export function TaxFilingCards() {
  const [incomeReturns, setIncomeReturns] = useState<IncomeTaxReturn[]>([]);
  const [vatReturns, setVatReturns] = useState<VatReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReturns() {
      try {
        const [income, vat] = await Promise.all([
          incomeTaxApi.getAll(),
          vatApi.getAll(),
        ]);
        setIncomeReturns(income);
        setVatReturns(vat);
      } catch (error) {
        console.error("Error fetching returns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReturns();
  }, []);

  // Calculate available income tax years (not filed or only drafts)
  const filedIncomeYears = incomeReturns
    .filter((r) => r.status !== "DRAFT")
    .map((r) => r.taxYear);

  const availableIncomeYears = INCOME_TAX_YEARS.filter(
    (year) => !filedIncomeYears.includes(year)
  );

  // Calculate available VAT periods (not filed or only drafts)
  const filedVatPeriods = vatReturns
    .filter((r) => r.status !== "DRAFT")
    .map((r) => `${r.taxYear}-Q${r.quarter}`);

  const availableVatPeriods = VAT_PERIODS.filter(
    (p) => !filedVatPeriods.includes(`${p.year}-Q${p.quarter}`)
  );

  const hasAvailableIncome = availableIncomeYears.length > 0;
  const hasAvailableVat = availableVatPeriods.length > 0;

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        {/* Loading skeletons */}
        <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
      {/* Income Tax Card */}
      {hasAvailableIncome ? (
        <Link href="/tax/income" className="group">
          <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-ocean-50 via-white to-cyan-50 border border-ocean-100 shadow-luxury hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/25 flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-ocean-600 transition-colors">
                  Income Tax Return
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Annual filing • 5% effective rate
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-ocean-100 text-ocean-700 text-xs font-medium">
                    {availableIncomeYears.length} year{availableIncomeYears.length !== 1 ? "s" : ""} available
                  </span>
                  <span className="text-xs text-gray-500">
                    ({availableIncomeYears.join(", ")})
                  </span>
                </div>
              </div>
              <svg className="w-5 h-5 text-ocean-400 group-hover:text-ocean-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-sm overflow-hidden opacity-75">
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-500 mb-1">
                Income Tax Return
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Annual filing • 5% effective rate
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                  ✓ All years filed
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Years {INCOME_TAX_YEARS.join(", ")} have been filed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VAT Card */}
      {hasAvailableVat ? (
        <Link href="/tax/vat" className="group">
          <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-luxury hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-emerald-600 transition-colors">
                  VAT Return
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Quarterly filing • 2.5% effective rate
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
                    {availableVatPeriods.length} period{availableVatPeriods.length !== 1 ? "s" : ""} available
                  </span>
                </div>
              </div>
              <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 shadow-sm overflow-hidden opacity-75">
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-500 mb-1">
                VAT Return
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                Quarterly filing • 2.5% effective rate
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                  ✓ All periods filed
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                All quarters for {currentYear} and {currentYear - 1} have been filed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
