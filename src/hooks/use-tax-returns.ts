"use client";

import { useState, useEffect, useCallback } from "react";
import { incomeTaxApi, vatApi } from "@/lib/api";
import type { IncomeTaxReturn, VatReturn } from "@/types";

interface UseTaxReturnsOptions {
  autoFetch?: boolean;
}

export function useIncomeTaxReturns(options: UseTaxReturnsOptions = {}) {
  const { autoFetch = true } = options;

  const [returns, setReturns] = useState<IncomeTaxReturn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await incomeTaxApi.getAll();
      setReturns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch returns");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await incomeTaxApi.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch return");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReturn = useCallback(async (id: string) => {
    try {
      await incomeTaxApi.delete(id);
      setReturns((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete return");
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    returns,
    isLoading,
    error,
    fetch,
    getById,
    deleteReturn,
  };
}

export function useVatReturns(options: UseTaxReturnsOptions = {}) {
  const { autoFetch = true } = options;

  const [returns, setReturns] = useState<VatReturn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vatApi.getAll();
      setReturns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch returns");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await vatApi.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch return");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReturn = useCallback(async (id: string) => {
    try {
      await vatApi.delete(id);
      setReturns((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete return");
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    returns,
    isLoading,
    error,
    fetch,
    getById,
    deleteReturn,
  };
}
