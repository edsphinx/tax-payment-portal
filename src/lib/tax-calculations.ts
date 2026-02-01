/**
 * Próspera ZEDE Tax Calculations
 *
 * Based on the Próspera Tax Statute:
 * - Personal Income Tax: 50% of gross income deemed "presumed income", taxed at 10%
 *   Effective rate: 5% of gross income
 * - Business Income Tax: 10% of revenues deemed presumed income, taxed at 10%
 *   Effective rate: 1% of gross income
 * - Retail VAT: 50% of retail sales price deemed "value added", taxed at 5%
 *   Effective rate: 2.5% of retail sales
 */

// Tax rates as defined by Próspera Charter
export const TAX_RATES = {
  INCOME_TAX: {
    PRESUMED_INCOME_PERCENTAGE: 0.5,  // 50% of gross income
    TAX_RATE: 0.1,                     // 10% statutory rate
    EFFECTIVE_RATE: 0.05,              // 5% effective rate
  },
  BUSINESS_TAX: {
    PRESUMED_INCOME_PERCENTAGE: 0.1,  // 10% of revenues
    TAX_RATE: 0.1,                     // 10% statutory rate
    EFFECTIVE_RATE: 0.01,              // 1% effective rate
  },
  VAT: {
    VALUE_ADDED_PERCENTAGE: 0.5,       // 50% of retail sales
    TAX_RATE: 0.05,                    // 5% VAT rate
    EFFECTIVE_RATE: 0.025,             // 2.5% effective rate
  },
};

export interface IncomeTaxCalculation {
  grossIncome: number;
  presumedIncome: number;
  taxRate: number;
  baseTaxOwed: number;
  entityTaxCredits: number;
  otherCredits: number;
  totalCredits: number;
  netTaxOwed: number;
  penalties: number;
  interest: number;
  totalDue: number;
}

export interface VatCalculation {
  totalRetailSales: number;
  valueAdded: number;
  vatRate: number;
  baseVatOwed: number;
  previousCredits: number;
  netVatOwed: number;
  penalties: number;
  interest: number;
  totalDue: number;
}

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

  // Calculate presumed income (50% of gross)
  const presumedIncome = grossIncome * TAX_RATES.INCOME_TAX.PRESUMED_INCOME_PERCENTAGE;

  // Calculate base tax (10% of presumed income)
  const baseTaxOwed = presumedIncome * TAX_RATES.INCOME_TAX.TAX_RATE;

  // Total credits
  const totalCredits = entityTaxCredits + otherCredits;

  // Net tax after credits (cannot be negative)
  const netTaxOwed = Math.max(0, baseTaxOwed - totalCredits);

  // Total due including penalties and interest
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

  // Calculate value added (50% of retail sales)
  const valueAdded = totalRetailSales * TAX_RATES.VAT.VALUE_ADDED_PERCENTAGE;

  // Calculate base VAT (5% of value added)
  const baseVatOwed = valueAdded * TAX_RATES.VAT.TAX_RATE;

  // Net VAT after credits (cannot be negative)
  const netVatOwed = Math.max(0, baseVatOwed - previousCredits);

  // Total due including penalties and interest
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
  const quarterStartMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
  const startMonth = quarterStartMonths[quarter - 1];

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0); // Last day of the quarter

  return { start, end };
}

/**
 * Check if a tax return is past due
 */
export function isIncomeTaxPastDue(taxYear: number): boolean {
  const dueDate = new Date(taxYear + 1, 3, 30); // April 30th of the following year
  return new Date() > dueDate;
}

export function isVatPastDue(taxYear: number, quarter: number): boolean {
  const { end } = getQuarterDates(taxYear, quarter);
  const dueDate = new Date(end);
  dueDate.setDate(dueDate.getDate() + 15); // 15 days after quarter end
  return new Date() > dueDate;
}
