"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IncomeTaxForm } from "@/components/forms/income-tax-form";

const STEPS = [
  { id: 1, name: "Personal Info", description: "Your basic information" },
  { id: 2, name: "Address", description: "Your residence details" },
  { id: 3, name: "Income", description: "Report your earnings" },
  { id: 4, name: "Credits", description: "Tax credits & adjustments" },
  { id: 5, name: "Preparer", description: "Tax preparer (optional)" },
  { id: 6, name: "Review & Sign", description: "Certify and submit" },
];

export default function IncomeTaxPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Individual Income Tax Return
              </h1>
              <p className="text-sm text-gray-500">Form 1 - Annual Filing</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />

          {/* Step indicators */}
          <div className="hidden md:flex justify-between mt-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? "bg-blue-600 text-white"
                      : step.id === currentStep
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.id < currentStep ? "✓" : step.id}
                </div>
                <span className="text-xs mt-1 hidden lg:block">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8">
        <IncomeTaxForm
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          totalSteps={STEPS.length}
        />
      </main>
    </div>
  );
}
