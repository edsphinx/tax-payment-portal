"use client";

import Link from "next/link";
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

interface TaxFilingCardsProps {
  incomeReturns: IncomeTaxReturn[];
  vatReturns: VatReturn[];
}

export function TaxFilingCards({ incomeReturns, vatReturns }: TaxFilingCardsProps) {
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

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
      {/* Income Tax Card */}
      {hasAvailableIncome ? (
        <Link href="/tax/income" className="group">
          <div className="h-full p-5 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Income Tax Return
                </h3>
                <p className="text-sm text-slate-600 mb-2">Annual filing</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                    {availableIncomeYears.length} year{availableIncomeYears.length !== 1 ? "s" : ""} available
                  </span>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ) : (
        <div className="h-full p-5 rounded-lg border bg-slate-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-500">Income Tax Return</h3>
              <p className="text-sm text-slate-400 mb-2">Annual filing</p>
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                All years filed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VAT Card */}
      {hasAvailableVat ? (
        <Link href="/tax/vat" className="group">
          <div className="h-full p-5 rounded-lg border hover:border-green-300 hover:bg-green-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">
                  VAT Return
                </h3>
                <p className="text-sm text-slate-600 mb-2">Quarterly filing</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                    {availableVatPeriods.length} period{availableVatPeriods.length !== 1 ? "s" : ""} available
                  </span>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ) : (
        <div className="h-full p-5 rounded-lg border bg-slate-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-500">VAT Return</h3>
              <p className="text-sm text-slate-400 mb-2">Quarterly filing</p>
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                All periods filed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
