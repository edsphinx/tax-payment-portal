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
import { TAX_RATES } from "@/types";
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
    isSubmitting,
    isSubmitted,
    submit,
    nextStep,
    prevStep,
  } = useIncomeTaxForm({
    totalSteps,
    onSuccess: () => {},
  });

  // Sync external step changes
  const handleNext = async () => {
    const isValid = await nextStep();
    if (isValid) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    prevStep();
    onStepChange(currentStep - 1);
  };

  const grossIncome = form.watch("grossIncome") || 0;
  const entityTaxCredits = form.watch("entityTaxCredits") || 0;
  const otherCredits = form.watch("otherCredits") || 0;

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
              <span className="text-gray-600">Gross Income:</span>
              <span className="font-medium">{formatCurrency(grossIncome)}</span>
              <span className="text-gray-600">Total Tax Due:</span>
              <span className="font-medium text-blue-600">{formatCurrency(taxCalculation.totalDue)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            You will receive a confirmation email at {form.getValues("email")}.
            Payment is due by April 30th.
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
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your personal details as registered with Próspera.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="residentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próspera Resident ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="PZ-XXXXX" {...field} />
                      </FormControl>
                      <FormDescription>Your unique Próspera resident identifier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
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
                <CardDescription>Your current residence address for tax purposes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt, Suite, etc." {...field} />
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
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Roatán" {...field} />
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
                <CardDescription>Report your gross income earned within Próspera ZEDE.</CardDescription>
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
                  name="grossIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Income (USD) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Total income earned within Próspera. Enter 0 if none.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-blue-900">Tax Calculation Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-blue-700">Gross Income:</span>
                    <span className="font-medium">{formatCurrency(grossIncome)}</span>
                    <span className="text-blue-700">Presumed Income (50%):</span>
                    <span>{formatCurrency(taxCalculation.presumedIncome)}</span>
                    <span className="text-blue-700">Tax Rate:</span>
                    <span>10%</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="text-blue-700 font-medium">Estimated Tax:</span>
                    <span className="font-bold text-blue-900">{formatCurrency(taxCalculation.baseTaxOwed)}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Effective tax rate: {(TAX_RATES.INCOME_TAX.EFFECTIVE_RATE * 100).toFixed(0)}% of gross income
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Credits & Adjustments */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Credits & Adjustments</CardTitle>
                <CardDescription>Enter any tax credits you&apos;re eligible to claim.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="entityTaxCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Tax Credits (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Credits from income tax paid by legal entities you own.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Credits (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Updated Tax Calculation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Base Tax:</span>
                    <span>{formatCurrency(taxCalculation.baseTaxOwed)}</span>
                    <span className="text-gray-600">Entity Credits:</span>
                    <span className="text-green-600">-{formatCurrency(entityTaxCredits)}</span>
                    <span className="text-gray-600">Other Credits:</span>
                    <span className="text-green-600">-{formatCurrency(otherCredits)}</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="font-medium">Net Tax Due:</span>
                    <span className="font-bold">{formatCurrency(taxCalculation.totalDue)}</span>
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
                  <div className="space-y-4 pt-4">
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
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Step 6: Review & Sign */}
          {currentStep === 6 && (
            <>
              <CardHeader>
                <CardTitle>Review & Certification</CardTitle>
                <CardDescription>Review your information and sign to submit your return.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Return Summary</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span>{form.getValues("firstName")} {form.getValues("lastName")}</span>
                    <span className="text-gray-600">Tax Year:</span>
                    <span>{form.getValues("taxYear")}</span>
                    <span className="text-gray-600">Gross Income:</span>
                    <span>{formatCurrency(grossIncome)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Tax Due:</span>
                    <span className="font-bold text-xl text-blue-600">{formatCurrency(taxCalculation.totalDue)}</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="certificationAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I certify under penalty of perjury *</FormLabel>
                        <FormDescription>
                          I declare that the information provided is true, correct, and complete.
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
                      <FormLabel>Signature *</FormLabel>
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
              <Button type="button" onClick={handleNext}>
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
