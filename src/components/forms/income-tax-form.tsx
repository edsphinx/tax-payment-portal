"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useIncomeTaxForm } from "@/hooks";
import { formatCurrency } from "@/lib/tax-calculations";
import { TAX_RATES, ACCOUNTING_METHODS } from "@/types";
import { SignaturePad } from "./signature-pad";

const currentYear = new Date().getFullYear();
const taxYears = [currentYear - 1, currentYear - 2, currentYear - 3];

interface IncomeTaxFormProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

export function IncomeTaxForm({ currentStep, onStepChange, totalSteps }: IncomeTaxFormProps) {
  const {
    form,
    taxCalculation,
    taxYear,
    isSubmitting,
    isSubmitted,
    submit,
    nextStep,
    prevStep,
    isFiledYear,
    filedYears,
  } = useIncomeTaxForm({
    totalSteps,
    onSuccess: () => {},
  });

  // Check if current selection is already filed
  const currentYearFiled = isFiledYear(taxYear);

  // Sync external step changes
  const handleNext = async () => {
    if (currentStep === 3 && currentYearFiled) {
      return;
    }
    const isValid = await nextStep();
    if (isValid) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    prevStep();
    onStepChange(currentStep - 1);
  };

  const employmentIncome = form.watch("employmentIncome") || 0;
  const businessIncome = form.watch("businessIncome") || 0;
  const entityDistributions = form.watch("entityDistributions") || 0;
  const mtcCredit = form.watch("mtcCredit") || 0;

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-green-600">Return Submitted Successfully!</CardTitle>
          <CardDescription>
            Your income tax return has been submitted for tax year {form.getValues("taxYear")}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Employment Income:</span>
              <span className="font-medium">{formatCurrency(employmentIncome)}</span>
              <span className="text-gray-600">Business Income:</span>
              <span className="font-medium">{formatCurrency(businessIncome)}</span>
              <span className="text-gray-600">Total Tax Due:</span>
              <span className="font-medium text-blue-600">{formatCurrency(taxCalculation.totalDue)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            You will receive a confirmation email at {form.getValues("email")}.
            <br />
            <strong>Due date: April 1, {form.getValues("taxYear") + 1}</strong>
            <br />
            Email to: gsp@prospera.hn
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.href = "/dashboard"}>
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <Card className="max-w-2xl mx-auto">
          {/* Step 1: Taxpayer Information */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Taxpayer Information</CardTitle>
                <CardDescription>
                  Form 1 - As registered with Prospera ZEDE (Tax Statute 2019, Sections 2-1-38-4-0-0-21, et seq.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name (Taxpayer) *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="middleInitial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Initial</FormLabel>
                          <FormControl>
                            <Input placeholder="M" maxLength={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name (Taxpayer) *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="accountingMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accounting Method (Select One) *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accounting method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ACCOUNTING_METHODS.CASH}>Cash</SelectItem>
                          <SelectItem value={ACCOUNTING_METHODS.ACCRUAL}>Accrual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(e)Resident Permit Number (Taxpayer) *</FormLabel>
                      <FormControl>
                        <Input placeholder="PZ-XXXXX" {...field} />
                      </FormControl>
                      <FormDescription>Your unique Prospera eResidency permit identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(e)Residency E-Mail (Taxpayer) *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>Your residence address for tax purposes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Address (number, apt & street) *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street, Apt 4B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town/Jurisdiction *</FormLabel>
                        <FormControl>
                          <Input placeholder="Roatan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dept/State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Islas de la Bahia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="34101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Income Information */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Income Information</CardTitle>
                <CardDescription>
                  Report income arising in, sourced or derived from Prospera ZEDE.
                  <br />
                  <span className="text-xs text-gray-500">State in USD or Lempira</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="taxYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Year *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taxYears.map((year) => {
                            const isFiled = isFiledYear(year);
                            return (
                              <SelectItem
                                key={year}
                                value={year.toString()}
                                disabled={isFiled}
                              >
                                {year} {isFiled && "(Already filed)"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {currentYearFiled && (
                  <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3 text-red-700">
                      <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-lg">This year has already been filed!</span>
                    </div>
                    <p className="text-red-600 mt-2 ml-9">
                      You cannot file again for {taxYear}. Please select a different year.
                    </p>
                  </div>
                )}

                {filedYears.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Already filed years:</p>
                    <div className="flex flex-wrap gap-2">
                      {filedYears.map((year) => (
                        <span key={year} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {year}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-3">Income Calculation Lines</h4>

                  {/* Line 1 */}
                  <FormField
                    control={form.control}
                    name="employmentIncome"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>
                          <span className="font-bold">Line 1:</span> Revenue from employment (wages, salary, compensation) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Including wages, salaries and other compensation from Prospera ZEDE
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Line 2 - Calculated */}
                  <div className="bg-white rounded p-3 mb-4 border">
                    <p className="text-sm">
                      <span className="font-bold">Line 2:</span> Presumed Income from Employment
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      50% of (Line 1 - ${TAX_RATES.INCOME_TAX.EMPLOYMENT_DEDUCTION.toLocaleString()}) per Sections 2-1-38-2-0-0-4
                    </p>
                    <p className="font-medium text-blue-600">
                      {formatCurrency(taxCalculation.presumedEmploymentIncome)}
                    </p>
                  </div>

                  {/* Line 3 */}
                  <FormField
                    control={form.control}
                    name="businessIncome"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>
                          <span className="font-bold">Line 3:</span> Revenue from trade, profession, business or company *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Including royalties, dividends or distributions (other than Line 1)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Line 4 - Calculated */}
                  <div className="bg-white rounded p-3 mb-4 border">
                    <p className="text-sm">
                      <span className="font-bold">Line 4:</span> Presumed Income from Business
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      50% of Line 3 per Sections 2-1-38-3-0-0-8
                    </p>
                    <p className="font-medium text-blue-600">
                      {formatCurrency(taxCalculation.presumedBusinessIncome)}
                    </p>
                  </div>

                  {/* Line 5 - Input */}
                  <FormField
                    control={form.control}
                    name="entityDistributions"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>
                          <span className="font-bold">Line 5:</span> Distributions from owned companies (for deduction)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          10% deduction for amounts distributed from companies you beneficially own and which paid income taxes at company level per Section 2-1-38-4-0-0-21(2)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Line 5 Deduction - Calculated */}
                  <div className="bg-white rounded p-3 mb-4 border">
                    <p className="text-sm">
                      <span className="font-bold">Line 5 Deduction:</span> 10% of distributions
                    </p>
                    <p className="font-medium text-green-600">
                      -{formatCurrency(taxCalculation.entityDistributionDeduction)}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-blue-900">Tax Calculation Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-blue-700 font-bold">Line 6: Aggregate Presumed Income:</span>
                    <span className="font-medium">{formatCurrency(taxCalculation.aggregatePresumedIncome)}</span>
                    <span className="text-blue-700 text-xs col-span-2">(Line 2 + Line 4 - Line 5 deduction)</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="text-blue-700 font-bold">Line 7: Initial Income Tax (10%):</span>
                    <span className="font-bold text-blue-900">{formatCurrency(taxCalculation.initialTax)}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Credits */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Marketable Tax Credit (MTC)</CardTitle>
                <CardDescription>
                  Line 8: Credit for Marketable Tax Credit Applied
                  <br />
                  <span className="text-xs text-red-600">Attach MTC forms to support amount. CANNOT EXCEED amount in Line 7.</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="mtcCredit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MTC Credit Amount (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={taxCalculation.initialTax}
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum allowed: {formatCurrency(taxCalculation.initialTax)} (Line 7 amount)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mtcCredit > taxCalculation.initialTax && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium">
                      Warning: MTC Credit cannot exceed Line 7 ({formatCurrency(taxCalculation.initialTax)}).
                      The credit will be capped at the maximum.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Final Tax Calculation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Line 7: Initial Tax:</span>
                    <span>{formatCurrency(taxCalculation.initialTax)}</span>
                    <span className="text-gray-600">Line 8: MTC Credit Applied:</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.mtcCredit)}</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="font-bold">Line 9: Income Tax Liability:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(taxCalculation.taxLiability)}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Tax Preparer */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle>Tax Preparer Information</CardTitle>
                <CardDescription>Optional: If a tax professional prepared this return.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="useTaxPreparer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This return was prepared by a tax professional</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("useTaxPreparer") && (
                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="preparerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preparer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preparerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preparer Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="preparer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preparerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preparer Address (including zip code)</FormLabel>
                          <FormControl>
                            <Input placeholder="Address, City, State, ZIP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Step 6: Review & Sign */}
          {currentStep === 6 && (
            <>
              <CardHeader>
                <CardTitle>Certification</CardTitle>
                <CardDescription>Review your information and sign to submit your return.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Return Summary</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span>{form.getValues("firstName")} {form.getValues("middleInitial")} {form.getValues("lastName")}</span>
                    <span className="text-gray-600">Tax Year:</span>
                    <span>{form.getValues("taxYear")}</span>
                    <span className="text-gray-600">Line 1 (Employment):</span>
                    <span>{formatCurrency(employmentIncome)}</span>
                    <span className="text-gray-600">Line 3 (Business):</span>
                    <span>{formatCurrency(businessIncome)}</span>
                    <span className="text-gray-600">Line 6 (Aggregate Presumed):</span>
                    <span>{formatCurrency(taxCalculation.aggregatePresumedIncome)}</span>
                    <span className="text-gray-600">Line 7 (Initial Tax):</span>
                    <span>{formatCurrency(taxCalculation.initialTax)}</span>
                    <span className="text-gray-600">Line 8 (MTC Credit):</span>
                    <span className="text-green-600">-{formatCurrency(taxCalculation.mtcCredit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Line 9: Income Tax Liability:</span>
                    <span className="font-bold text-xl text-blue-600">{formatCurrency(taxCalculation.taxLiability)}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Email by April 1 to Prospera Tax Commissioner:</strong> gsp@prospera.hn
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="certificationAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-bold">I certify under penalty of perjury *</FormLabel>
                        <FormDescription className="text-xs">
                          I declare that the foregoing information is true, correct, and complete to the best of my knowledge.
                          All statements applicable to the form of proof under the Prospera Civil Penalty Schedule, International
                          Commercial Terms Inc., Ed. 2017, are incorporated herein to the full extent applicable. Jurisdiction
                          applies to the local law of Prospera ZEDE.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signatureData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature (Taxpayer) *</FormLabel>
                      <FormControl>
                        <SignaturePad onSave={(data) => field.onChange(data)} value={field.value} />
                      </FormControl>
                      <FormDescription>Sign above using your mouse or touch screen.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 3 && currentYearFiled}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !form.getValues("certificationAccepted")}>
                {isSubmitting ? "Submitting..." : "Submit Return"}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </Form>
  );
}
