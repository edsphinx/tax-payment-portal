/**
 * VAT API client
 */

import { apiClient } from "./client";
import type { VatReturn, CreateVatInput, UpdateVatInput } from "@/types";

export const vatApi = {
  getAll: () => apiClient.get<VatReturn[]>("/api/tax/vat"),

  getById: (id: string) => apiClient.get<VatReturn>(`/api/tax/vat/${id}`),

  create: (data: CreateVatInput) => apiClient.post<VatReturn>("/api/tax/vat", data),

  update: (id: string, data: UpdateVatInput) =>
    apiClient.patch<VatReturn>(`/api/tax/vat/${id}`, data),

  submit: (id: string, signatureData: string) =>
    apiClient.post<VatReturn>(`/api/tax/vat/${id}/submit`, { signatureData }),

  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/tax/vat/${id}`),
};
