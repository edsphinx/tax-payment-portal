"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { incomeTaxApi } from "@/lib/api";
import { calculateIncomeTax, getCurrentTaxYear } from "@/lib/tax-calculations";
import type { IncomeTaxFormData, IncomeTaxCalculation, IncomeTaxReturn } from "@/types";
import { ApiError, ACCOUNTING_METHODS } from "@/types";

/**
 * Validation schema for Income Tax Form (Form 1)
 * Based on Próspera ZEDE Natural Person Income Tax Return
 */
const incomeTaxSchema = z.object({
  // Step 1: Taxpayer Info
  firstName: z.string().min(1, "First name is required"),
  middleInitial: z.string().max(1, "Single character only").optional().default(""),
  lastName: z.string().min(1, "Last name is required"),
  accountingMethod: z.enum([ACCOUNTING_METHODS.CASH, ACCOUNTING_METHODS.ACCRUAL], {
    required_error: "Accounting method is required",
  }),
  residentId: z.string().min(1, "(e)Resident Permit Number is required"),
  email: z.string().email("Valid (e)Residency email is required"),

  // Step 2: Address
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City/Town/Jurisdiction is required"),
  state: z.string().min(1, "Dept/State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),

  // Step 3: Income (Lines 1, 3, 5)
  taxYear: z.number().int().min(2020).max(2030),
  // Line 1: Employment income
  employmentIncome: z.number().min(0, "Must be 0 or greater"),
  // Line 3: Business income
  businessIncome: z.number().min(0, "Must be 0 or greater"),
  // Line 5 input: Distributions from owned companies
  entityDistributions: z.number().min(0, "Must be 0 or greater"),
  incomeSources: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),

  // Step 4: Credits (Line 8)
  // Marketable Tax Credit - cannot exceed initial tax (Line 7)
  mtcCredit: z.number().min(0, "Must be 0 or greater"),

  // Step 5: Preparer
  useTaxPreparer: z.boolean().default(false),
  preparerName: z.string().optional(),
  preparerEmail: z.string().optional(),
  preparerPhone: z.string().optional(),
  preparerAddress: z.string().optional(),

  // Step 6: Certification
  certificationAccepted: z.boolean(),
  signatureData: z.string().optional(),
});

const defaultValues: IncomeTaxFormData = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  accountingMethod: ACCOUNTING_METHODS.CASH,
  residentId: "",
  email: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Honduras",
  taxYear: getCurrentTaxYear(),
  employmentIncome: 0,
  businessIncome: 0,
  entityDistributions: 0,
  mtcCredit: 0,
  useTaxPreparer: false,
  preparerName: "",
  preparerEmail: "",
  preparerPhone: "",
  preparerAddress: "",
  certificationAccepted: false,
  signatureData: "",
};

interface UseIncomeTaxFormOptions {
  totalSteps?: number;
  onSuccess?: (id: string) => void;
}

export function useIncomeTaxForm(options: UseIncomeTaxFormOptions = {}) {
  const { totalSteps = 6, onSuccess } = options;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingReturns, setExistingReturns] = useState<IncomeTaxReturn[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(true);

  // Fetch existing returns on mount
  useEffect(() => {
    async function fetchExistingReturns() {
      try {
        const returns = await incomeTaxApi.getAll();
        setExistingReturns(returns);
      } catch (err) {
        console.error("Error fetching existing returns:", err);
      } finally {
        setLoadingReturns(false);
      }
    }
    fetchExistingReturns();
  }, []);

  // Check if a year already has a submitted return
  const isFiledYear = useCallback((year: number) => {
    return existingReturns.some(
      (r) => r.taxYear === year && r.status !== "DRAFT"
    );
  }, [existingReturns]);

  // Get filed years for display
  const filedYears = useMemo(() => {
    return existingReturns
      .filter((r) => r.status !== "DRAFT")
      .map((r) => r.taxYear);
  }, [existingReturns]);

  const form = useForm<IncomeTaxFormData>({
    resolver: zodResolver(incomeTaxSchema),
    defaultValues,
    mode: "onChange",
  });

  const { watch } = form;
  const employmentIncome = watch("employmentIncome") || 0;
  const businessIncome = watch("businessIncome") || 0;
  const entityDistributions = watch("entityDistributions") || 0;
  const mtcCredit = watch("mtcCredit") || 0;
  const taxYear = watch("taxYear");

  // Memoized tax calculation using correct Form 1 logic
  const taxCalculation: IncomeTaxCalculation = useMemo(
    () => calculateIncomeTax({
      employmentIncome,
      businessIncome,
      entityDistributions,
      mtcCredit,
    }),
    [employmentIncome, businessIncome, entityDistributions, mtcCredit]
  );

  // Step validation fields
  const stepFields = useMemo<Record<number, (keyof IncomeTaxFormData)[]>>(() => ({
    1: ["firstName", "lastName", "accountingMethod", "residentId", "email"],
    2: ["addressLine1", "city", "state", "postalCode", "country"],
    3: ["taxYear", "employmentIncome", "businessIncome"],
    4: ["mtcCredit"],
    5: [],
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

  const submit = useCallback(async (data: IncomeTaxFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let taxReturnId: string;

      // Calculate total gross income for API compatibility
      const grossIncome = data.employmentIncome + data.businessIncome;

      try {
        // Try to create a new return
        const created = await incomeTaxApi.create({
          taxYear: data.taxYear,
          grossIncome: grossIncome,
          entityTaxCredits: data.mtcCredit,
          otherCredits: 0,
          incomeSources: data.incomeSources,
          preparerName: data.useTaxPreparer ? data.preparerName : undefined,
          preparerEmail: data.useTaxPreparer ? data.preparerEmail : undefined,
          preparerPhone: data.useTaxPreparer ? data.preparerPhone : undefined,
        });
        taxReturnId = created.id;
      } catch (createError) {
        // If return already exists (409), update it instead
        if (createError instanceof ApiError && createError.status === 409 && createError.existingId) {
          await incomeTaxApi.update(createError.existingId, {
            grossIncome: grossIncome,
            entityTaxCredits: data.mtcCredit,
            otherCredits: 0,
            incomeSources: data.incomeSources,
            preparerName: data.useTaxPreparer ? data.preparerName : undefined,
            preparerEmail: data.useTaxPreparer ? data.preparerEmail : undefined,
            preparerPhone: data.useTaxPreparer ? data.preparerPhone : undefined,
          });
          taxReturnId = createError.existingId;
        } else {
          throw createError;
        }
      }

      // Submit with signature
      if (data.signatureData) {
        await incomeTaxApi.submit(taxReturnId, data.signatureData);
      }

      setReturnId(taxReturnId);
      setIsSubmitted(true);
      onSuccess?.(taxReturnId);
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
    loadingReturns,
    // Calculations
    taxCalculation,
    // Filed years
    filedYears,
    isFiledYear,
    // Actions
    nextStep,
    prevStep,
    goToStep,
    submit,
    reset,
    validateStep,
  };
}
