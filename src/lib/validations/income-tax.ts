import { z } from "zod";

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  residentId: z.string().min(1, "Próspera Resident ID is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
});

// Step 2: Address Information
export const addressSchema = z.object({
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),
});

// Step 3: Income Information
export const incomeInfoSchema = z.object({
  taxYear: z.number().int().min(2020).max(2030),
  grossIncome: z.number().min(0, "Gross income must be 0 or greater"),
  // Optional breakdown of income sources
  incomeSources: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
});

// Step 4: Credits & Adjustments
export const creditsSchema = z.object({
  entityTaxCredits: z.number().min(0).default(0),
  otherCredits: z.number().min(0).default(0),
});

// Step 5: Tax Preparer (optional)
export const preparerSchema = z.object({
  useTaxPreparer: z.boolean().default(false),
  preparerName: z.string().optional(),
  preparerEmail: z.string().email().optional().or(z.literal("")),
  preparerPhone: z.string().optional(),
}).refine(
  (data) => {
    if (data.useTaxPreparer) {
      return data.preparerName && data.preparerName.length > 0;
    }
    return true;
  },
  { message: "Preparer name is required when using a tax preparer", path: ["preparerName"] }
);

// Step 6: Review & Certification
export const certificationSchema = z.object({
  certificationAccepted: z.boolean().refine(val => val === true, {
    message: "You must certify that the information is accurate",
  }),
  signatureData: z.string().min(1, "Signature is required"),
});

// Complete Income Tax Form Schema
export const incomeTaxFormSchema = z.object({
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  residentId: z.string().min(1, "Próspera Resident ID is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),

  // Address
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),

  // Income
  taxYear: z.number().int().min(2020).max(2030),
  grossIncome: z.number().min(0, "Gross income must be 0 or greater"),
  incomeSources: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),

  // Credits
  entityTaxCredits: z.number().min(0).default(0),
  otherCredits: z.number().min(0).default(0),

  // Preparer
  useTaxPreparer: z.boolean().default(false),
  preparerName: z.string().optional(),
  preparerEmail: z.string().optional(),
  preparerPhone: z.string().optional(),

  // Certification
  certificationAccepted: z.boolean(),
  signatureData: z.string().optional(),
});

export type IncomeTaxFormData = z.infer<typeof incomeTaxFormSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type IncomeInfoData = z.infer<typeof incomeInfoSchema>;
export type CreditsData = z.infer<typeof creditsSchema>;
export type PreparerData = z.infer<typeof preparerSchema>;
export type CertificationData = z.infer<typeof certificationSchema>;
