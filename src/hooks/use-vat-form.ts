"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vatApi } from "@/lib/api";
import { calculateVat, getCurrentQuarter } from "@/lib/tax-calculations";
import type { VatFormData, VatCalculation } from "@/types";

// Validation schema
const vatSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  residentId: z.string().min(1, "Resident ID is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  taxYear: z.number().int().min(2020).max(2030),
  quarter: z.number().int().min(1).max(4),
  totalRetailSales: z.number().min(0, "Must be 0 or greater"),
  salesBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
  previousCredits: z.number().min(0).default(0),
  certificationAccepted: z.boolean(),
  signatureData: z.string().optional(),
});

const currentYear = new Date().getFullYear();

const defaultValues: VatFormData = {
  firstName: "",
  lastName: "",
  residentId: "",
  email: "",
  phone: "",
  taxYear: currentYear,
  quarter: getCurrentQuarter(),
  totalRetailSales: 0,
  previousCredits: 0,
  certificationAccepted: false,
  signatureData: "",
};

interface UseVatFormOptions {
  totalSteps?: number;
  onSuccess?: (id: string) => void;
}

export function useVatForm(options: UseVatFormOptions = {}) {
  const { totalSteps = 5, onSuccess } = options;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VatFormData>({
    resolver: zodResolver(vatSchema),
    defaultValues,
    mode: "onChange",
  });

  const { watch } = form;
  const totalRetailSales = watch("totalRetailSales") || 0;
  const previousCredits = watch("previousCredits") || 0;
  const taxYear = watch("taxYear");
  const quarter = watch("quarter");

  // Memoized VAT calculation
  const vatCalculation: VatCalculation = useMemo(
    () => calculateVat({ totalRetailSales, previousCredits }),
    [totalRetailSales, previousCredits]
  );

  // Step validation fields (memoized to avoid recreation)
  const stepFields = useMemo<Record<number, (keyof VatFormData)[]>>(() => ({
    1: ["firstName", "lastName", "residentId", "email"],
    2: ["taxYear", "quarter"],
    3: ["totalRetailSales"],
    4: ["previousCredits"],
    5: ["certificationAccepted"],
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
      // Create the return
      const created = await vatApi.create({
        taxYear: data.taxYear,
        quarter: data.quarter,
        totalRetailSales: data.totalRetailSales,
        previousCredits: data.previousCredits,
        salesBreakdown: data.salesBreakdown,
      });

      // Submit with signature
      if (data.signatureData) {
        await vatApi.submit(created.id, data.signatureData);
      }

      setReturnId(created.id);
      setIsSubmitted(true);
      onSuccess?.(created.id);
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
    // Calculations
    vatCalculation,
    // Actions
    nextStep,
    prevStep,
    goToStep,
    submit,
    reset,
    validateStep,
  };
}
