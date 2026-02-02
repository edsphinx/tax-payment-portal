"use client";

import { useFillForm } from "@/hooks/use-fill-form";
import type { RandomFormData } from "@/lib/random-data";

interface FillFormButtonProps {
  onDataFetched: (data: RandomFormData) => void;
  className?: string;
}

/**
 * Discreet button to fill form with random test data
 */
export function FillFormButton({ onDataFetched, className = "" }: FillFormButtonProps) {
  const { isLoading, fetchData } = useFillForm();

  const handleFill = async () => {
    const data = await fetchData();
    if (data) {
      onDataFetched(data);
    }
  };

  return (
    <button
      type="button"
      onClick={handleFill}
      disabled={isLoading}
      className={`text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 ${className}`}
      title="Fill form with random test data"
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Fill with test data
        </span>
      )}
    </button>
  );
}
