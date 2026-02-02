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
import { useVatForm } from "@/hooks";
import { formatCurrency, getQuarterDates, VAT_PAYMENT_INFO } from "@/lib/tax-calculations";
import { ACCOUNTING_METHODS } from "@/types";
import { SignaturePad } from "./signature-pad";
import { format } from "date-fns";

const currentYear = new Date().getFullYear();
const taxYears = [currentYear, currentYear - 1];
const quarters = [
  { value: 1, label: "Q1 (Jan - Mar)" },
  { value: 2, label: "Q2 (Apr - Jun)" },
  { value: 3, label: "Q3 (Jul - Sep)" },
  { value: 4, label: "Q4 (Oct - Dec)" },
];

interface VatFormProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

export function VatForm({ currentStep, onStepChange, totalSteps }: VatFormProps) {
  const {
    form,
    vatCalculation,
    taxYear,
    quarter,
    isSubmitting,
    isSubmitted,
    submit,
    nextStep,
    prevStep,
    isFiledPeriod,
    filedPeriods,
  } = useVatForm({
    totalSteps,
    onSuccess: () => {},
  });

  // Check if current selection is already filed
  const currentPeriodFiled = isFiledPeriod(taxYear, quarter);

  const handleNext = async () => {
    if (currentStep === 3 && currentPeriodFiled) {
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

  const totalRetailSales = form.watch("totalRetailSales") || 0;
  const mtcCredit = form.watch("mtcCredit") || 0;
  const quarterDates = getQuarterDates(taxYear, quarter);

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl text-green-600">VAT Return Submitted!</CardTitle>
          <CardDescription>
            Your VAT return for Q{quarter} {taxYear} has been submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">Total Retail Sales:</span>
              <span className="font-medium">{formatCurrency(totalRetailSales)}</span>
              <span className="text-gray-600">VAT Due:</span>
              <span className="font-medium text-green-600">{formatCurrency(vatCalculation.totalDue)}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Payment Instructions</h4>
            <div className="text-sm text-amber-800 space-y-2">
              <p><strong>Make check payable to:</strong> {VAT_PAYMENT_INFO.checkPayableTo}</p>
              <p><strong>Mail to:</strong> {VAT_PAYMENT_INFO.checkMailingAddress.line2}, {VAT_PAYMENT_INFO.checkMailingAddress.city}, {VAT_PAYMENT_INFO.checkMailingAddress.state} {VAT_PAYMENT_INFO.checkMailingAddress.postalCode}</p>
              <Separator className="my-2" />
              <p><strong>Or wire transfer to:</strong></p>
              <p>{VAT_PAYMENT_INFO.wireTransfer.beneficiary}</p>
              <p>{VAT_PAYMENT_INFO.wireTransfer.bankName}, {VAT_PAYMENT_INFO.wireTransfer.address}</p>
              <p>Account: {VAT_PAYMENT_INFO.wireTransfer.accountNumber}</p>
              <p>Routing: {VAT_PAYMENT_INFO.wireTransfer.routingNumber}</p>
            </div>
          </div>

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
          {/* Step 1: Taxpayer Info */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Taxpayer Information</CardTitle>
                <CardDescription>
                  Form 3 - Retail VAT Quarterly Return (Natural Person Retailer)
                  <br />
                  <span className="text-xs">Tax Statute 2019, Sections 2-1-38-9-0-0-56, et seq.</span>
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
                      <FormLabel>Accounting Method (Mark One) *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accounting method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ACCOUNTING_METHODS.CASH}>Cash (Dinero en efectivo)</SelectItem>
                          <SelectItem value={ACCOUNTING_METHODS.ACCRUAL}>Accrual (Acumulacion)</SelectItem>
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>(e)Residency E-Mail (Taxpayer) *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="business@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </>
          )}

          {/* Step 3: Tax Period */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Tax Period</CardTitle>
                <CardDescription>Select the fiscal quarter you are filing for.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {taxYears.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quarter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Quarter *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quarter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {quarters.map((q) => {
                              const isFiled = isFiledPeriod(taxYear, q.value);
                              return (
                                <SelectItem
                                  key={q.value}
                                  value={q.value.toString()}
                                  disabled={isFiled}
                                >
                                  {q.label} {isFiled && "(Already filed)"}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Selected Period</h4>
                  <p className="text-sm text-gray-600">
                    {format(quarterDates.start, "MMMM d, yyyy")} - {format(quarterDates.end, "MMMM d, yyyy")}
                  </p>
                </div>

                {currentPeriodFiled && (
                  <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3 text-red-700">
                      <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-lg">This period has already been filed!</span>
                    </div>
                    <p className="text-red-600 mt-2 ml-9">
                      You cannot file again for Q{quarter} {taxYear}. Please select a different period.
                    </p>
                  </div>
                )}

                {filedPeriods.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Already filed periods:</p>
                    <div className="flex flex-wrap gap-2">
                      {filedPeriods.map((p) => (
                        <span key={`${p.year}-${p.quarter}`} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          Q{p.quarter} {p.year}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Due:</strong> Email to Prospera Tax Commissioner at the end of each quarter: gsp@prospera.hn
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Retail Sales */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Retail Sales Information</CardTitle>
                <CardDescription>
                  Report your total retail sales for Q{quarter} {taxYear}.
                  <br />
                  <span className="text-xs text-gray-500">State in USD or Lempira</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-3">VAT Calculation Lines</h4>

                  {/* Line 1 */}
                  <FormField
                    control={form.control}
                    name="totalRetailSales"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>
                          <span className="font-bold">Line 1:</span> Value received for sale of goods and services *
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
                          Value received in this specific tax quarter for the sale of goods and services supplied
                          by you from a location in Prospera ZEDE to end user(s) per Sections 2-1-38-9-0-0-60(2), et seq.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Line 2 - Calculated */}
                  <div className="bg-white rounded p-3 mb-4 border">
                    <p className="text-sm">
                      <span className="font-bold">Line 2:</span> Presumed Value Added by Retail Activity
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      50% of Line 1
                    </p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(vatCalculation.valueAdded)}
                    </p>
                  </div>

                  {/* Line 3 - Calculated */}
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm">
                      <span className="font-bold">Line 3:</span> Initial Retail VAT Calculation
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      5% of Line 2 (if exemption or different rate applies, calculate accordingly)
                    </p>
                    <p className="font-medium text-green-700">
                      {formatCurrency(vatCalculation.initialVat)}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-green-900">VAT Calculation Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-green-700">Line 1: Total Retail Sales:</span>
                    <span className="font-medium">{formatCurrency(totalRetailSales)}</span>
                    <span className="text-green-700">Line 2: Value Added (50%):</span>
                    <span>{formatCurrency(vatCalculation.valueAdded)}</span>
                    <span className="text-green-700">VAT Rate:</span>
                    <span>5%</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="text-green-700 font-bold">Line 3: Initial VAT:</span>
                    <span className="font-bold text-green-900">{formatCurrency(vatCalculation.initialVat)}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Credits */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle>Marketable Trade Credit (MTC)</CardTitle>
                <CardDescription>
                  Line 4: Credit for Marketable Trade Credit Applied
                  <br />
                  <span className="text-xs text-red-600">Attach MTC forms to support the amount. CANNOT EXCEED the amount in Line 3.</span>
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
                          max={vatCalculation.initialVat}
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum allowed: {formatCurrency(vatCalculation.initialVat)} (Line 3 amount)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mtcCredit > vatCalculation.initialVat && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium">
                      Warning: MTC Credit cannot exceed Line 3 ({formatCurrency(vatCalculation.initialVat)}).
                      The credit will be capped at the maximum.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Final VAT Calculation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Line 3: Initial VAT:</span>
                    <span>{formatCurrency(vatCalculation.initialVat)}</span>
                    <span className="text-gray-600">Line 4: MTC Credit Applied:</span>
                    <span className="text-green-600">-{formatCurrency(vatCalculation.mtcCredit)}</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="font-bold">Line 5: Retail VAT Liability:</span>
                    <span className="font-bold text-green-600">{formatCurrency(vatCalculation.vatLiability)}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 6: Review & Sign */}
          {currentStep === 6 && (
            <>
              <CardHeader>
                <CardTitle>Certification</CardTitle>
                <CardDescription>Review your information and sign to submit your VAT return.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Return Summary</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span>{form.getValues("firstName")} {form.getValues("middleInitial")} {form.getValues("lastName")}</span>
                    <span className="text-gray-600">Period:</span>
                    <span>Q{quarter} {taxYear}</span>
                    <span className="text-gray-600">Line 1 (Total Sales):</span>
                    <span>{formatCurrency(totalRetailSales)}</span>
                    <span className="text-gray-600">Line 2 (Value Added):</span>
                    <span>{formatCurrency(vatCalculation.valueAdded)}</span>
                    <span className="text-gray-600">Line 3 (Initial VAT):</span>
                    <span>{formatCurrency(vatCalculation.initialVat)}</span>
                    <span className="text-gray-600">Line 4 (MTC Credit):</span>
                    <span className="text-green-600">-{formatCurrency(vatCalculation.mtcCredit)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Line 5: Retail VAT Liability:</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(vatCalculation.vatLiability)}</span>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-3">Payment Instructions</h4>
                  <div className="text-sm text-amber-800 space-y-3">
                    <div>
                      <p className="font-medium">Option 1: Mail Check</p>
                      <p>Make check payable to: <strong>{VAT_PAYMENT_INFO.checkPayableTo}</strong></p>
                      <p>{VAT_PAYMENT_INFO.checkMailingAddress.line1}</p>
                      <p>{VAT_PAYMENT_INFO.checkMailingAddress.line2}</p>
                      <p>{VAT_PAYMENT_INFO.checkMailingAddress.city}, {VAT_PAYMENT_INFO.checkMailingAddress.state} {VAT_PAYMENT_INFO.checkMailingAddress.postalCode}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-medium">Option 2: Wire Transfer</p>
                      <p>Bank: <strong>{VAT_PAYMENT_INFO.wireTransfer.bankName}</strong></p>
                      <p>Beneficiary: <strong>{VAT_PAYMENT_INFO.wireTransfer.beneficiary}</strong></p>
                      <p>Address: {VAT_PAYMENT_INFO.wireTransfer.address}</p>
                      <p>Account Number: <strong>{VAT_PAYMENT_INFO.wireTransfer.accountNumber}</strong></p>
                      <p>Routing Number: <strong>{VAT_PAYMENT_INFO.wireTransfer.routingNumber}</strong></p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="certificationAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-green-50">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-bold">I certify under penalty of perjury *</FormLabel>
                        <FormDescription className="text-xs">
                          I declare that the foregoing information is true, correct, and complete to the best of my knowledge.
                          All statements applicable to the form of proof under the Prospera Civil Penalty Schedule, International
                          Commercial Terms Inc., Ed. 2017, are incorporated herein to the full extent applicable. Jurisdiction
                          applies to the local law of Prospera ZEDE. For negative values, enter zero as positive numbers; disregard effective.
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

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 3 && currentPeriodFiled}
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
