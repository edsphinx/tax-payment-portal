/**
 * Income Tax API client
 */

import { apiClient } from "./client";
import type {
  IncomeTaxReturn,
  CreateIncomeTaxInput,
  UpdateIncomeTaxInput,
} from "@/types";

export const incomeTaxApi = {
  getAll: () => apiClient.get<IncomeTaxReturn[]>("/api/tax/income"),

  getById: (id: string) => apiClient.get<IncomeTaxReturn>(`/api/tax/income/${id}`),

  create: (data: CreateIncomeTaxInput) =>
    apiClient.post<IncomeTaxReturn>("/api/tax/income", data),

  update: (id: string, data: UpdateIncomeTaxInput) =>
    apiClient.patch<IncomeTaxReturn>(`/api/tax/income/${id}`, data),

  submit: (id: string, signatureData: string) =>
    apiClient.post<IncomeTaxReturn>(`/api/tax/income/${id}/submit`, { signatureData }),

  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/tax/income/${id}`),
};
