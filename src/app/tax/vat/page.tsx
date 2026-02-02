"use client";

import { useState } from "react";
import Link from "next/link";
import { VatForm } from "@/components/forms/vat-form";

const STEPS = [
  { id: 1, name: "Taxpayer Info" },
  { id: 2, name: "Address" },
  { id: 3, name: "Tax Period" },
  { id: 4, name: "Retail Sales" },
  { id: 5, name: "Credits" },
  { id: 6, name: "Review" },
];

export default function VatPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold tracking-tight">Próspera</span>
              <span className="text-lg font-light text-slate-400 ml-1">Tax Portal</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      {/* Title & Progress */}
      <div className="bg-slate-50 border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">VAT Return</h1>
              <p className="text-sm text-slate-600">Form 3 - Quarterly Filing</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="max-w-2xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">
                Step {currentStep}: {STEPS[currentStep - 1].name}
              </span>
              <span className="text-slate-500">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Step dots */}
            <div className="flex justify-between mt-3">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      step.id <= currentStep ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  />
                  <span className="text-xs text-slate-500 mt-1 hidden md:block">
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <VatForm
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          totalSteps={STEPS.length}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-4">
        <div className="container mx-auto px-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Próspera ZEDE Tax Administration
        </div>
      </footer>
    </div>
  );
}
