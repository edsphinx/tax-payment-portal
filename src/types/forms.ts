/**
 * Form-related types and interfaces
 */

import type { IncomeSource, SalesBreakdownItem } from "./tax";

// ============================================================================
// INCOME TAX FORM
// ============================================================================

export interface IncomeTaxFormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  residentId: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;

  // Step 2: Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;

  // Step 3: Income
  taxYear: number;
  grossIncome: number;
  incomeSources?: IncomeSource[];

  // Step 4: Credits
  entityTaxCredits: number;
  otherCredits: number;

  // Step 5: Preparer
  useTaxPreparer: boolean;
  preparerName?: string;
  preparerEmail?: string;
  preparerPhone?: string;

  // Step 6: Certification
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
    name: "Personal Info",
    description: "Your basic information",
    fields: ["firstName", "lastName", "middleName", "residentId", "email", "phone"],
  },
  {
    id: 2,
    name: "Address",
    description: "Your residence details",
    fields: ["addressLine1", "addressLine2", "city", "state", "country", "postalCode"],
  },
  {
    id: 3,
    name: "Income",
    description: "Report your earnings",
    fields: ["taxYear", "grossIncome", "incomeSources"],
  },
  {
    id: 4,
    name: "Credits",
    description: "Tax credits & adjustments",
    fields: ["entityTaxCredits", "otherCredits"],
  },
  {
    id: 5,
    name: "Preparer",
    description: "Tax preparer (optional)",
    fields: ["useTaxPreparer", "preparerName", "preparerEmail", "preparerPhone"],
  },
  {
    id: 6,
    name: "Review & Sign",
    description: "Certify and submit",
    fields: ["certificationAccepted", "signatureData"],
  },
];

// ============================================================================
// VAT FORM
// ============================================================================

export interface VatFormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  residentId: string;
  email: string;
  phone?: string;

  // Step 2: Period
  taxYear: number;
  quarter: number;

  // Step 3: Sales
  totalRetailSales: number;
  salesBreakdown?: SalesBreakdownItem[];

  // Step 4: Adjustments
  previousCredits: number;

  // Step 5: Certification
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
    name: "Business Info",
    description: "Your business details",
    fields: ["firstName", "lastName", "residentId", "email", "phone"],
  },
  {
    id: 2,
    name: "Tax Period",
    description: "Select the quarter",
    fields: ["taxYear", "quarter"],
  },
  {
    id: 3,
    name: "Sales",
    description: "Report retail sales",
    fields: ["totalRetailSales", "salesBreakdown"],
  },
  {
    id: 4,
    name: "Adjustments",
    description: "Credits & adjustments",
    fields: ["previousCredits"],
  },
  {
    id: 5,
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
