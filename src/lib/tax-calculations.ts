/**
 * Próspera ZEDE Tax Calculations
 * Pure functions for tax calculations - no side effects
 */

import type { IncomeTaxCalculation, VatCalculation } from "@/types";
import { TAX_RATES } from "@/types";

/**
 * Calculate Individual Income Tax
 */
export function calculateIncomeTax(params: {
  grossIncome: number;
  entityTaxCredits?: number;
  otherCredits?: number;
  penalties?: number;
  interest?: number;
}): IncomeTaxCalculation {
  const {
    grossIncome,
    entityTaxCredits = 0,
    otherCredits = 0,
    penalties = 0,
    interest = 0,
  } = params;

  const presumedIncome = grossIncome * TAX_RATES.INCOME_TAX.PRESUMED_INCOME_PERCENTAGE;
  const baseTaxOwed = presumedIncome * TAX_RATES.INCOME_TAX.TAX_RATE;
  const totalCredits = entityTaxCredits + otherCredits;
  const netTaxOwed = Math.max(0, baseTaxOwed - totalCredits);
  const totalDue = netTaxOwed + penalties + interest;

  return {
    grossIncome,
    presumedIncome,
    taxRate: TAX_RATES.INCOME_TAX.TAX_RATE,
    baseTaxOwed,
    entityTaxCredits,
    otherCredits,
    totalCredits,
    netTaxOwed,
    penalties,
    interest,
    totalDue,
  };
}

/**
 * Calculate VAT
 */
export function calculateVat(params: {
  totalRetailSales: number;
  previousCredits?: number;
  penalties?: number;
  interest?: number;
}): VatCalculation {
  const {
    totalRetailSales,
    previousCredits = 0,
    penalties = 0,
    interest = 0,
  } = params;

  const valueAdded = totalRetailSales * TAX_RATES.VAT.VALUE_ADDED_PERCENTAGE;
  const baseVatOwed = valueAdded * TAX_RATES.VAT.TAX_RATE;
  const netVatOwed = Math.max(0, baseVatOwed - previousCredits);
  const totalDue = netVatOwed + penalties + interest;

  return {
    totalRetailSales,
    valueAdded,
    vatRate: TAX_RATES.VAT.TAX_RATE,
    baseVatOwed,
    previousCredits,
    netVatOwed,
    penalties,
    interest,
    totalDue,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Get quarter dates
 */
export function getQuarterDates(year: number, quarter: number): { start: Date; end: Date } {
  const quarterStartMonths = [0, 3, 6, 9];
  const startMonth = quarterStartMonths[quarter - 1];

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);

  return { start, end };
}

/**
 * Check if a tax return is past due
 */
export function isIncomeTaxPastDue(taxYear: number): boolean {
  const dueDate = new Date(taxYear + 1, 3, 30);
  return new Date() > dueDate;
}

export function isVatPastDue(taxYear: number, quarter: number): boolean {
  const { end } = getQuarterDates(taxYear, quarter);
  const dueDate = new Date(end);
  dueDate.setDate(dueDate.getDate() + 15);
  return new Date() > dueDate;
}

/**
 * Get current tax year (previous year)
 */
export function getCurrentTaxYear(): number {
  return new Date().getFullYear() - 1;
}

/**
 * Get current quarter
 */
export function getCurrentQuarter(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}
