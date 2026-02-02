"use client";

import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { fetchRandomFormData, type RandomFormData } from "@/lib/random-data";
import type { IncomeTaxFormData, VatFormData } from "@/types";

interface UseFillFormOptions {
  onFilled?: (data: RandomFormData) => void;
}

/**
 * Hook for filling forms with random test data
 * Abstracts the business logic of fetching and applying test data
 */
export function useFillForm(options: UseFillFormOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<RandomFormData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchRandomFormData();
      options.onFilled?.(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch random data";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isLoading,
    error,
    fetchData,
  };
}

/**
 * Fill Income Tax form with random data
 */
export function fillIncomeTaxForm(
  form: UseFormReturn<IncomeTaxFormData>,
  data: RandomFormData
) {
  // Step 1: Taxpayer Info
  form.setValue("firstName", data.firstName);
  form.setValue("lastName", data.lastName);
  form.setValue("middleInitial", data.middleInitial);
  form.setValue("email", data.email);
  form.setValue("residentId", data.residentId);
  form.setValue("accountingMethod", "CASH");

  // Step 2: Address
  form.setValue("addressLine1", data.addressLine1);
  form.setValue("city", data.city);
  form.setValue("state", data.state);
  form.setValue("postalCode", data.postalCode);
  form.setValue("country", data.country);

  // Step 3: Income
  form.setValue("employmentIncome", data.employmentIncome);
  form.setValue("businessIncome", data.businessIncome);
  form.setValue("entityDistributions", data.entityDistributions);

  // Step 4: Credits
  form.setValue("mtcCredit", data.mtcCredit);

  // Step 5: Tax Preparer
  form.setValue("useTaxPreparer", true);
  form.setValue("preparerName", data.preparerName);
  form.setValue("preparerEmail", data.preparerEmail);
  form.setValue("preparerPhone", data.preparerPhone);
  form.setValue("preparerAddress", data.preparerAddress);
}

/**
 * Fill VAT form with random data
 */
export function fillVatForm(
  form: UseFormReturn<VatFormData>,
  data: RandomFormData
) {
  // Step 1: Taxpayer Info
  form.setValue("firstName", data.firstName);
  form.setValue("lastName", data.lastName);
  form.setValue("middleInitial", data.middleInitial);
  form.setValue("residentId", data.residentId);
  form.setValue("accountingMethod", "CASH");

  // Step 2: Address
  form.setValue("addressLine1", data.addressLine1);
  form.setValue("city", data.city);
  form.setValue("state", data.state);
  form.setValue("postalCode", data.postalCode);
  form.setValue("country", data.country);
  form.setValue("email", data.email);

  // Step 4: Retail Sales
  form.setValue("totalRetailSales", data.totalRetailSales);

  // Step 5: Credits
  form.setValue("mtcCredit", 0); // Reset MTC since it depends on calculation
}
