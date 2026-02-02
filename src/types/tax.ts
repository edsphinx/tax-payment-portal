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
  grossIncome: number;
  entityTaxCredits?: number;
  otherCredits?: number;
  incomeSources?: IncomeSource[];
  preparerName?: string;
  preparerEmail?: string;
  preparerPhone?: string;
}

export interface UpdateIncomeTaxInput {
  grossIncome?: number;
  entityTaxCredits?: number;
  otherCredits?: number;
  incomeSources?: IncomeSource[];
  preparerName?: string;
  preparerEmail?: string;
  preparerPhone?: string;
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
  totalRetailSales: number;
  previousCredits?: number;
  salesBreakdown?: SalesBreakdownItem[];
}

export interface UpdateVatInput {
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

// ============================================================================
// TAX RATES (Constants)
// ============================================================================

export const TAX_RATES = {
  INCOME_TAX: {
    PRESUMED_INCOME_PERCENTAGE: 0.5,
    TAX_RATE: 0.1,
    EFFECTIVE_RATE: 0.05,
  },
  BUSINESS_TAX: {
    PRESUMED_INCOME_PERCENTAGE: 0.1,
    TAX_RATE: 0.1,
    EFFECTIVE_RATE: 0.01,
  },
  VAT: {
    VALUE_ADDED_PERCENTAGE: 0.5,
    TAX_RATE: 0.05,
    EFFECTIVE_RATE: 0.025,
  },
} as const;
