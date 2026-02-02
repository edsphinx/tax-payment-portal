/**
 * Form-related types and interfaces
 * Based on Próspera ZEDE Adobe Sign Forms
 */

import type { IncomeSource, SalesBreakdownItem, AccountingMethod } from "./tax";

// ============================================================================
// INCOME TAX FORM (Form 1)
// Based on: Próspera ZEDE Natural Person Income Tax Return
// Tax Statute 2019, §§2-1-38-4-0-0-21, et seq.
// ============================================================================

export interface IncomeTaxFormData {
  // Step 1: Personal Info (as per Form 1 header)
  firstName: string;
  middleInitial: string; // Required per original document
  lastName: string;
  accountingMethod: AccountingMethod; // Cash or Accrual - required
  residentId: string; // (e)Resident Permit Number
  email: string; // (e)Residency E-Mail

  // Step 2: Address (as per Form 1 header)
  addressLine1: string; // Home Address (number, apt & street)
  city: string; // City/Town/Jurisdiction
  state: string; // Dept/State - required
  postalCode: string; // Postal - required
  country: string; // Country

  // Step 3: Income (Lines 1, 3, 5 of Form 1)
  taxYear: number;
  // Line 1: Revenue from employment (wages, salary, compensation)
  employmentIncome: number;
  // Line 3: Revenue from business (royalties, dividends, distributions)
  businessIncome: number;
  // Line 5: Distributions from owned companies (for 10% deduction)
  entityDistributions: number;
  incomeSources?: IncomeSource[];

  // Step 4: Credits (Line 8 of Form 1)
  // Marketable Tax Credit (MTC) - attach MTC forms to support
  mtcCredit: number;

  // Step 5: Preparer (optional section at bottom of Form 1)
  useTaxPreparer: boolean;
  preparerName?: string;
  preparerEmail?: string;
  preparerPhone?: string;
  preparerAddress?: string;

  // Step 6: Certification (as per Form 1 certification section)
  certificationAccepted: boolean;
  signatureData?: string;
}

export interface IncomeTaxFormStep {
  id: number;
  name: string;
  description: string;
  fields: (keyof IncomeTaxFormData)[];
}

export const INCOME_TAX_STEPS: IncomeTaxFormStep[] = [
  {
    id: 1,
    name: "Taxpayer Info",
    description: "Your identification details",
    fields: ["firstName", "middleInitial", "lastName", "accountingMethod", "residentId", "email"],
  },
  {
    id: 2,
    name: "Address",
    description: "Your residence details",
    fields: ["addressLine1", "city", "state", "postalCode", "country"],
  },
  {
    id: 3,
    name: "Income",
    description: "Report employment & business income",
    fields: ["taxYear", "employmentIncome", "businessIncome", "entityDistributions"],
  },
  {
    id: 4,
    name: "Tax Credits",
    description: "Marketable Tax Credit (MTC)",
    fields: ["mtcCredit"],
  },
  {
    id: 5,
    name: "Preparer",
    description: "Tax preparer (optional)",
    fields: ["useTaxPreparer", "preparerName", "preparerEmail", "preparerPhone", "preparerAddress"],
  },
  {
    id: 6,
    name: "Review & Sign",
    description: "Certify and submit",
    fields: ["certificationAccepted", "signatureData"],
  },
];

// ============================================================================
// VAT FORM (Form 3)
// Based on: Próspera ZEDE Retail VAT Quarterly Return (Natural Person Retailer)
// Tax Statute 2019, §§2-1-38-9-0-0-56, et seq.
// ============================================================================

export interface VatFormData {
  // Step 1: Taxpayer Info (as per Form 3 header)
  firstName: string;
  middleInitial: string; // Required per original document
  lastName: string;
  accountingMethod: AccountingMethod; // Cash or Accrual - required
  residentId: string; // (e)Resident Permit Number

  // Step 2: Address (as per Form 3 header)
  addressLine1: string; // Home Address (number, apt & street)
  city: string; // City/Town/Jurisdiction
  state: string; // Dept/State - required
  postalCode: string; // Postal - required
  country: string; // Country
  email: string; // (e)Residency E-Mail

  // Step 3: Tax Period
  taxYear: number;
  quarter: number;

  // Step 4: Sales (Line 1 of Form 3)
  // Value received for sale of goods and services from Próspera ZEDE location
  totalRetailSales: number;
  salesBreakdown?: SalesBreakdownItem[];

  // Step 5: Credits (Line 4 of Form 3)
  // Marketable Trade Credit (MTC) - cannot exceed Line 3
  mtcCredit: number;

  // Step 6: Certification (as per Form 3 certification section)
  certificationAccepted: boolean;
  signatureData?: string;
}

export interface VatFormStep {
  id: number;
  name: string;
  description: string;
  fields: (keyof VatFormData)[];
}

export const VAT_STEPS: VatFormStep[] = [
  {
    id: 1,
    name: "Taxpayer Info",
    description: "Your identification details",
    fields: ["firstName", "middleInitial", "lastName", "accountingMethod", "residentId"],
  },
  {
    id: 2,
    name: "Address",
    description: "Your residence details",
    fields: ["addressLine1", "city", "state", "postalCode", "country", "email"],
  },
  {
    id: 3,
    name: "Tax Period",
    description: "Select the quarter",
    fields: ["taxYear", "quarter"],
  },
  {
    id: 4,
    name: "Retail Sales",
    description: "Report sales value",
    fields: ["totalRetailSales", "salesBreakdown"],
  },
  {
    id: 5,
    name: "Tax Credits",
    description: "Marketable Trade Credit (MTC)",
    fields: ["mtcCredit"],
  },
  {
    id: 6,
    name: "Review & Sign",
    description: "Certify and submit",
    fields: ["certificationAccepted", "signatureData"],
  },
];

// ============================================================================
// FORM STATE
// ============================================================================

export interface FormState<T> {
  data: T;
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

export type FormAction<T> =
  | { type: "SET_FIELD"; field: keyof T; value: T[keyof T] }
  | { type: "SET_STEP"; step: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_SUBMITTED"; value: boolean }
  | { type: "SET_ERROR"; field: string; message: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "RESET" };
