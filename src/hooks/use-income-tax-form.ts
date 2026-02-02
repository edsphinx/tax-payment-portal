"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { incomeTaxApi } from "@/lib/api";
import { calculateIncomeTax, getCurrentTaxYear } from "@/lib/tax-calculations";
import type { IncomeTaxFormData, IncomeTaxCalculation, IncomeTaxReturn } from "@/types";
import { ApiError } from "@/types";

// Validation schema
const incomeTaxSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  residentId: z.string().min(1, "Resident ID is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional(),
  taxYear: z.number().int().min(2020).max(2030),
  grossIncome: z.number().min(0, "Must be 0 or greater"),
  incomeSources: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
  entityTaxCredits: z.number().min(0).default(0),
  otherCredits: z.number().min(0).default(0),
  useTaxPreparer: z.boolean().default(false),
  preparerName: z.string().optional(),
  preparerEmail: z.string().optional(),
  preparerPhone: z.string().optional(),
  certificationAccepted: z.boolean(),
  signatureData: z.string().optional(),
});

const defaultValues: IncomeTaxFormData = {
  firstName: "",
  lastName: "",
  middleName: "",
  residentId: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  nationality: "",
  passportNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "Honduras",
  postalCode: "",
  taxYear: getCurrentTaxYear(),
  grossIncome: 0,
  entityTaxCredits: 0,
  otherCredits: 0,
  useTaxPreparer: false,
  preparerName: "",
  preparerEmail: "",
  preparerPhone: "",
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
  const grossIncome = watch("grossIncome") || 0;
  const entityTaxCredits = watch("entityTaxCredits") || 0;
  const otherCredits = watch("otherCredits") || 0;
  const taxYear = watch("taxYear");

  // Memoized tax calculation
  const taxCalculation: IncomeTaxCalculation = useMemo(
    () => calculateIncomeTax({ grossIncome, entityTaxCredits, otherCredits }),
    [grossIncome, entityTaxCredits, otherCredits]
  );

  // Step validation fields (memoized to avoid recreation)
  const stepFields = useMemo<Record<number, (keyof IncomeTaxFormData)[]>>(() => ({
    1: ["firstName", "lastName", "residentId", "email"],
    2: ["addressLine1", "city", "country"],
    3: ["taxYear", "grossIncome"],
    4: ["entityTaxCredits", "otherCredits"],
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

      try {
        // Try to create a new return
        const created = await incomeTaxApi.create({
          taxYear: data.taxYear,
          grossIncome: data.grossIncome,
          entityTaxCredits: data.entityTaxCredits,
          otherCredits: data.otherCredits,
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
            grossIncome: data.grossIncome,
            entityTaxCredits: data.entityTaxCredits,
            otherCredits: data.otherCredits,
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
