import { z } from "zod";

// Step 1: Business/Personal Information
export const vatPersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  residentId: z.string().min(1, "Próspera Resident ID is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
});

// Step 2: Tax Period
export const vatPeriodSchema = z.object({
  taxYear: z.number().int().min(2020).max(2030),
  quarter: z.number().int().min(1).max(4),
});

// Step 3: Sales Information
export const vatSalesSchema = z.object({
  totalRetailSales: z.number().min(0, "Total retail sales must be 0 or greater"),
  // Optional breakdown of sales
  salesBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
});

// Step 4: Adjustments
export const vatAdjustmentsSchema = z.object({
  previousCredits: z.number().min(0).default(0),
});

// Step 5: Review & Certification
export const vatCertificationSchema = z.object({
  certificationAccepted: z.boolean().refine(val => val === true, {
    message: "You must certify that the information is accurate",
  }),
  signatureData: z.string().min(1, "Signature is required"),
});

// Complete VAT Form Schema
export const vatFormSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  residentId: z.string().min(1, "Próspera Resident ID is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),

  // Period
  taxYear: z.number().int().min(2020).max(2030),
  quarter: z.number().int().min(1).max(4),

  // Sales
  totalRetailSales: z.number().min(0, "Total retail sales must be 0 or greater"),
  salesBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),

  // Adjustments
  previousCredits: z.number().min(0).default(0),

  // Certification
  certificationAccepted: z.boolean(),
  signatureData: z.string().optional(),
});

export type VatFormData = z.infer<typeof vatFormSchema>;
export type VatPersonalInfoData = z.infer<typeof vatPersonalInfoSchema>;
export type VatPeriodData = z.infer<typeof vatPeriodSchema>;
export type VatSalesData = z.infer<typeof vatSalesSchema>;
export type VatAdjustmentsData = z.infer<typeof vatAdjustmentsSchema>;
export type VatCertificationData = z.infer<typeof vatCertificationSchema>;
