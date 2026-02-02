"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vatApi } from "@/lib/api";
import { calculateVat, getCurrentQuarter } from "@/lib/tax-calculations";
import type { VatFormData, VatCalculation, VatReturn } from "@/types";
import { ApiError, ACCOUNTING_METHODS } from "@/types";

/**
 * Validation schema for VAT Form (Form 3)
 * Based on Próspera ZEDE Retail VAT Quarterly Return
 */
const vatSchema = z.object({
  // Step 1: Taxpayer Info
  firstName: z.string().min(1, "First name is required"),
  middleInitial: z.string().max(1, "Single character only").optional().default(""),
  lastName: z.string().min(1, "Last name is required"),
  accountingMethod: z.enum([ACCOUNTING_METHODS.CASH, ACCOUNTING_METHODS.ACCRUAL], {
    required_error: "Accounting method is required",
  }),
  residentId: z.string().min(1, "(e)Resident Permit Number is required"),

  // Step 2: Address
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City/Town/Jurisdiction is required"),
  state: z.string().min(1, "Dept/State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Valid (e)Residency email is required"),

  // Step 3: Tax Period
  taxYear: z.number().int().min(2020).max(2030),
  quarter: z.number().int().min(1).max(4),

  // Step 4: Sales (Line 1)
  totalRetailSales: z.number().min(0, "Must be 0 or greater"),
  salesBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),

  // Step 5: Credits (Line 4)
  // Marketable Trade Credit - cannot exceed initial VAT (Line 3)
  mtcCredit: z.number().min(0, "Must be 0 or greater"),

  // Step 6: Certification
  certificationAccepted: z.boolean(),
  signatureData: z.string().optional(),
});

const currentYear = new Date().getFullYear();

const defaultValues: VatFormData = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  accountingMethod: ACCOUNTING_METHODS.CASH,
  residentId: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Honduras",
  email: "",
  taxYear: currentYear,
  quarter: getCurrentQuarter(),
  totalRetailSales: 0,
  mtcCredit: 0,
  certificationAccepted: false,
  signatureData: "",
};

interface UseVatFormOptions {
  totalSteps?: number;
  onSuccess?: (id: string) => void;
}

export function useVatForm(options: UseVatFormOptions = {}) {
  const { totalSteps = 6, onSuccess } = options;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingReturns, setExistingReturns] = useState<VatReturn[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(true);

  // Fetch existing returns on mount
  useEffect(() => {
    async function fetchExistingReturns() {
      try {
        const returns = await vatApi.getAll();
        setExistingReturns(returns);
      } catch (err) {
        console.error("Error fetching existing returns:", err);
      } finally {
        setLoadingReturns(false);
      }
    }
    fetchExistingReturns();
  }, []);

  // Check if a period already has a submitted return
  const isFiledPeriod = useCallback((year: number, q: number) => {
    return existingReturns.some(
      (r) => r.taxYear === year && r.quarter === q && r.status !== "DRAFT"
    );
  }, [existingReturns]);

  // Get filed periods for display
  const filedPeriods = useMemo(() => {
    return existingReturns
      .filter((r) => r.status !== "DRAFT")
      .map((r) => ({ year: r.taxYear, quarter: r.quarter }));
  }, [existingReturns]);

  const form = useForm<VatFormData>({
    resolver: zodResolver(vatSchema),
    defaultValues,
    mode: "onChange",
  });

  const { watch } = form;
  const totalRetailSales = watch("totalRetailSales") || 0;
  const mtcCredit = watch("mtcCredit") || 0;
  const taxYear = watch("taxYear");
  const quarter = watch("quarter");

  // Memoized VAT calculation using correct Form 3 logic
  const vatCalculation: VatCalculation = useMemo(
    () => calculateVat({ totalRetailSales, mtcCredit }),
    [totalRetailSales, mtcCredit]
  );

  // Step validation fields
  const stepFields = useMemo<Record<number, (keyof VatFormData)[]>>(() => ({
    1: ["firstName", "lastName", "accountingMethod", "residentId"],
    2: ["addressLine1", "city", "state", "postalCode", "country", "email"],
    3: ["taxYear", "quarter"],
    4: ["totalRetailSales"],
    5: ["mtcCredit"],
    6: ["certificationAccepted"],
  }), []);

  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    const fields = stepFields[step];
    if (fields.length === 0) return true;
    return form.trigger(fields);
  }, [form, stepFields]);

  const nextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
    return isValid;
  }, [currentStep, totalSteps, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const submit = useCallback(async (data: VatFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let vatReturnId: string;

      try {
        // Try to create a new return
        const created = await vatApi.create({
          taxYear: data.taxYear,
          quarter: data.quarter,
          totalRetailSales: data.totalRetailSales,
          previousCredits: data.mtcCredit,
          salesBreakdown: data.salesBreakdown,
        });
        vatReturnId = created.id;
      } catch (createError) {
        // If return already exists (409), update it instead
        if (createError instanceof ApiError && createError.status === 409 && createError.existingId) {
          await vatApi.update(createError.existingId, {
            totalRetailSales: data.totalRetailSales,
            previousCredits: data.mtcCredit,
            salesBreakdown: data.salesBreakdown,
          });
          vatReturnId = createError.existingId;
        } else {
          throw createError;
        }
      }

      // Submit with signature
      if (data.signatureData) {
        await vatApi.submit(vatReturnId, data.signatureData);
      }

      setReturnId(vatReturnId);
      setIsSubmitted(true);
      onSuccess?.(vatReturnId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess]);

  const reset = useCallback(() => {
    form.reset(defaultValues);
    setCurrentStep(1);
    setIsSubmitted(false);
    setReturnId(null);
    setError(null);
  }, [form]);

  return {
    // Form
    form,
    // State
    currentStep,
    totalSteps,
    isSubmitting,
    isSubmitted,
    returnId,
    error,
    taxYear,
    quarter,
    loadingReturns,
    // Calculations
    vatCalculation,
    // Filed periods
    filedPeriods,
    isFiledPeriod,
    // Actions
    nextStep,
    prevStep,
    goToStep,
    submit,
    reset,
    validateStep,
  };
}
