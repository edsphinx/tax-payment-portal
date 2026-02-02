/**
 * Tax-related types and interfaces
 */

// ============================================================================
// ENUMS
// ============================================================================

export const TaxReturnStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  AMENDED: "AMENDED",
} as const;

export type TaxReturnStatus = (typeof TaxReturnStatus)[keyof typeof TaxReturnStatus];

export const PaymentMethod = {
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  CRYPTOCURRENCY: "CRYPTOCURRENCY",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ============================================================================
// INCOME TAX
// ============================================================================

export interface IncomeSource {
  source: string;
  amount: number;
  description?: string;
}

export interface IncomeTaxReturn {
  id: string;
  userId: string;
  taxYear: number;
  status: TaxReturnStatus;
  submittedAt: string | null;

  // Income
  grossIncome: string;
  presumedIncome: string;
  taxableIncome: string;

  // Tax Calculation
  taxRate: string;
  taxOwed: string;

  // Credits
  entityTaxCredits: string;
  otherCredits: string;
  penalties: string;
  interest: string;
  totalDue: string;

  // Sources
  incomeSources: IncomeSource[] | null;

  // Signature
  signatureData: string | null;
  signedAt: string | null;
  certificationAccepted: boolean;

  // Preparer
  preparerName: string | null;
  preparerEmail: string | null;
  preparerPhone: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  payment?: Payment | null;
}

export interface CreateIncomeTaxInput {
  taxYear: number;
  // Taxpayer Info
  middleInitial?: string;
  accountingMethod?: string;
  // Address
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Income
  employmentIncome: number;
  businessIncome?: number;
  entityDistributions?: number;
  grossIncome?: number; // Legacy - computed from employment + business
  // Credits
  entityTaxCredits?: number;
  otherCredits?: number;
  incomeSources?: IncomeSource[];
  // Preparer
  preparerName?: string;
  preparerEmail?: string;
  preparerPhone?: string;
  preparerAddress?: string;
}

export interface UpdateIncomeTaxInput {
  // Taxpayer Info
  middleInitial?: string;
  accountingMethod?: string;
  // Address
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  // Income
  employmentIncome?: number;
  businessIncome?: number;
  entityDistributions?: number;
  grossIncome?: number;
  // Credits
  entityTaxCredits?: number;
  otherCredits?: number;
  incomeSources?: IncomeSource[];
  // Preparer
  preparerName?: string;
  preparerEmail?: string;
  preparerPhone?: string;
  preparerAddress?: string;
}

// ============================================================================
// VAT
// ============================================================================

export interface SalesBreakdownItem {
  category: string;
  amount: number;
  description?: string;
}

export interface VatReturn {
  id: string;
  userId: string;
  taxYear: number;
  quarter: number;
  periodStart: string;
  periodEnd: string;
  status: TaxReturnStatus;
  submittedAt: string | null;

  // Sales
  totalRetailSales: string;
  valueAdded: string;

  // Tax Calculation
  vatRate: string;
  vatOwed: string;

  // Adjustments
  previousCredits: string;
  penalties: string;
  interest: string;
  totalDue: string;

  // Breakdown
  salesBreakdown: SalesBreakdownItem[] | null;

  // Signature
  signatureData: string | null;
  signedAt: string | null;
  certificationAccepted: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  payment?: Payment | null;
}

export interface CreateVatInput {
  taxYear: number;
  quarter: number;
  // Taxpayer Info
  middleInitial?: string;
  accountingMethod?: string;
  // Address
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  email?: string;
  // Sales
  totalRetailSales: number;
  previousCredits?: number;
  salesBreakdown?: SalesBreakdownItem[];
}

export interface UpdateVatInput {
  // Taxpayer Info
  middleInitial?: string;
  accountingMethod?: string;
  // Address
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  email?: string;
  // Sales
  totalRetailSales?: number;
  previousCredits?: number;
  salesBreakdown?: SalesBreakdownItem[];
}

// ============================================================================
// PAYMENT
// ============================================================================

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalId: string | null;
  transactionHash: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TAX CALCULATIONS
// ============================================================================

/**
 * Income Tax Calculation following Próspera ZEDE Form 1
 * Based on Tax Statute 2019, §§2-1-38-4-0-0-21, et seq.
 */
export interface IncomeTaxCalculation {
  // Line 1: Revenue from employment (wages, salary, compensation)
  employmentIncome: number;
  // Line 2: Presumed Income from Employment = (Line 1 - $8,000) × 50%, min 0
  presumedEmploymentIncome: number;
  // Line 3: Revenue from business (royalties, dividends, distributions)
  businessIncome: number;
  // Line 4: Presumed Income from Business = Line 3 × 50%
  presumedBusinessIncome: number;
  // Line 5: Deduction for 10% of distributions from owned companies
  entityDistributionDeduction: number;
  // Line 6: Aggregate Presumed Income = Line 2 + Line 4 - Line 5
  aggregatePresumedIncome: number;
  // Line 7: Initial Income Tax = Line 6 × 10%
  initialTax: number;
  // Line 8: Marketable Tax Credit (MTC) - cannot exceed Line 7
  mtcCredit: number;
  // Line 9: Income Tax Liability = Line 7 - Line 8
  taxLiability: number;
  // Additional fields
  taxRate: number;
  penalties: number;
  interest: number;
  totalDue: number;
}

/**
 * VAT Calculation following Próspera ZEDE Form 3
 * Based on Tax Statute 2019, §§2-1-38-9-0-0-56, et seq.
 */
export interface VatCalculation {
  // Line 1: Value received for sale of goods and services
  totalRetailSales: number;
  // Line 2: Presumed Value Added = Line 1 × 50%
  valueAdded: number;
  // Line 3: Initial Retail VAT = Line 2 × 5%
  initialVat: number;
  // Line 4: Marketable Trade Credit (MTC) - cannot exceed Line 3
  mtcCredit: number;
  // Line 5: VAT Liability = Line 3 - Line 4
  vatLiability: number;
  // Additional fields
  vatRate: number;
  penalties: number;
  interest: number;
  totalDue: number;
}

// ============================================================================
// TAX RATES (Constants) - Per Próspera ZEDE Tax Statute 2019
// ============================================================================

export const TAX_RATES = {
  INCOME_TAX: {
    // Employment income: (income - $8,000) × 50% = presumed income
    EMPLOYMENT_DEDUCTION: 8000, // $8,000 or Lempira equivalent
    PRESUMED_INCOME_PERCENTAGE: 0.5, // 50%
    TAX_RATE: 0.1, // 10%
    // For business distributions deduction
    ENTITY_DISTRIBUTION_DEDUCTION_RATE: 0.1, // 10% of distributions
  },
  VAT: {
    VALUE_ADDED_PERCENTAGE: 0.5, // 50%
    TAX_RATE: 0.05, // 5%
  },
} as const;

// Accounting methods as per Form 1 and Form 3
export const ACCOUNTING_METHODS = {
  CASH: "CASH",
  ACCRUAL: "ACCRUAL",
} as const;

export type AccountingMethod = (typeof ACCOUNTING_METHODS)[keyof typeof ACCOUNTING_METHODS];
