/**
 * Próspera ZEDE Tax Calculations
 * Pure functions for tax calculations - no side effects
 *
 * Based on:
 * - Form 1: Natural Person Income Tax Return (Tax Statute 2019, §§2-1-38-4-0-0-21)
 * - Form 3: Retail VAT Quarterly Return (Tax Statute 2019, §§2-1-38-9-0-0-56)
 */

import type { IncomeTaxCalculation, VatCalculation } from "@/types";
import { TAX_RATES } from "@/types";

/**
 * Calculate Individual Income Tax (Form 1)
 *
 * Line 1: Employment income (wages, salary, compensation)
 * Line 2: Presumed Income from Employment = (Line 1 - $8,000) × 50%, min 0
 * Line 3: Business income (royalties, dividends, distributions)
 * Line 4: Presumed Income from Business = Line 3 × 50%
 * Line 5: Deduction = 10% of distributions from owned companies
 * Line 6: Aggregate Presumed Income = Line 2 + Line 4 - Line 5
 * Line 7: Initial Tax = Line 6 × 10%
 * Line 8: MTC Credit (cannot exceed Line 7)
 * Line 9: Tax Liability = Line 7 - Line 8
 */
export function calculateIncomeTax(params: {
  employmentIncome: number;
  businessIncome: number;
  entityDistributions?: number;
  mtcCredit?: number;
  penalties?: number;
  interest?: number;
}): IncomeTaxCalculation {
  const {
    employmentIncome,
    businessIncome,
    entityDistributions = 0,
    mtcCredit = 0,
    penalties = 0,
    interest = 0,
  } = params;

  // Line 2: Presumed Income from Employment = (Line 1 - $8,000) × 50%
  // Per §§2-1-38-2-0-0-4: enter $0 if negative
  const employmentAfterDeduction = Math.max(0, employmentIncome - TAX_RATES.INCOME_TAX.EMPLOYMENT_DEDUCTION);
  const presumedEmploymentIncome = employmentAfterDeduction * TAX_RATES.INCOME_TAX.PRESUMED_INCOME_PERCENTAGE;

  // Line 4: Presumed Income from Business = Line 3 × 50%
  // Per §§2-1-38-3-0-0-8
  const presumedBusinessIncome = businessIncome * TAX_RATES.INCOME_TAX.PRESUMED_INCOME_PERCENTAGE;

  // Line 5: Deduction for 10% of distributions from owned companies
  // Per §2-1-38-4-0-0-21(2)
  const entityDistributionDeduction = entityDistributions * TAX_RATES.INCOME_TAX.ENTITY_DISTRIBUTION_DEDUCTION_RATE;

  // Line 6: Aggregate Presumed Income = Line 2 + Line 4 - Line 5
  const aggregatePresumedIncome = Math.max(0, presumedEmploymentIncome + presumedBusinessIncome - entityDistributionDeduction);

  // Line 7: Initial Income Tax = Line 6 × 10%
  const initialTax = aggregatePresumedIncome * TAX_RATES.INCOME_TAX.TAX_RATE;

  // Line 8: MTC Credit - CANNOT EXCEED Line 7
  const appliedMtcCredit = Math.min(mtcCredit, initialTax);

  // Line 9: Tax Liability = Line 7 - Line 8
  const taxLiability = Math.max(0, initialTax - appliedMtcCredit);

  // Total due including penalties and interest
  const totalDue = taxLiability + penalties + interest;

  return {
    employmentIncome,
    presumedEmploymentIncome,
    businessIncome,
    presumedBusinessIncome,
    entityDistributionDeduction,
    aggregatePresumedIncome,
    initialTax,
    mtcCredit: appliedMtcCredit,
    taxLiability,
    taxRate: TAX_RATES.INCOME_TAX.TAX_RATE,
    penalties,
    interest,
    totalDue,
  };
}

/**
 * Calculate VAT (Form 3)
 *
 * Line 1: Value received for sale of goods and services
 * Line 2: Presumed Value Added = Line 1 × 50%
 * Line 3: Initial Retail VAT = Line 2 × 5%
 * Line 4: MTC Credit (cannot exceed Line 3)
 * Line 5: VAT Liability = Line 3 - Line 4
 */
export function calculateVat(params: {
  totalRetailSales: number;
  mtcCredit?: number;
  penalties?: number;
  interest?: number;
}): VatCalculation {
  const {
    totalRetailSales,
    mtcCredit = 0,
    penalties = 0,
    interest = 0,
  } = params;

  // Line 2: Presumed Value Added = Line 1 × 50%
  const valueAdded = totalRetailSales * TAX_RATES.VAT.VALUE_ADDED_PERCENTAGE;

  // Line 3: Initial Retail VAT = Line 2 × 5%
  const initialVat = valueAdded * TAX_RATES.VAT.TAX_RATE;

  // Line 4: MTC Credit - CANNOT EXCEED Line 3
  const appliedMtcCredit = Math.min(mtcCredit, initialVat);

  // Line 5: VAT Liability = Line 3 - Line 4
  const vatLiability = Math.max(0, initialVat - appliedMtcCredit);

  // Total due including penalties and interest
  const totalDue = vatLiability + penalties + interest;

  return {
    totalRetailSales,
    valueAdded,
    initialVat,
    mtcCredit: appliedMtcCredit,
    vatLiability,
    vatRate: TAX_RATES.VAT.TAX_RATE,
    penalties,
    interest,
    totalDue,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: "USD" | "HNL" = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
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
 * Income tax: Due by April 1 of following year
 */
export function isIncomeTaxPastDue(taxYear: number): boolean {
  const dueDate = new Date(taxYear + 1, 3, 1); // April 1
  return new Date() > dueDate;
}

/**
 * Check if VAT return is past due
 * Due at end of each quarter
 */
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

/**
 * VAT Payment Information
 * As per Form 3 instructions
 */
export const VAT_PAYMENT_INFO = {
  checkPayableTo: "Nick Dranias Law & Policy Analysis LLC",
  checkMailingAddress: {
    line1: "Fideicomisario Interino del Fideicomiso Próspera",
    line2: "3145 E. Chandler Blvd., Ste 110",
    city: "Phoenix",
    state: "AZ",
    postalCode: "85048",
    country: "USA",
  },
  wireTransfer: {
    bankName: "Bank of America",
    beneficiary: "Arizona IOLTA Trust",
    address: "222 Broadway, New York NY 10038",
    accountNumber: "457041473252",
    routingNumber: "122101706",
  },
} as const;
