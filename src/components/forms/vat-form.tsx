"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { vatFormSchema, type VatFormData } from "@/lib/validations/vat";
import { calculateVat, formatCurrency, getQuarterDates, TAX_RATES } from "@/lib/tax-calculations";
import { SignaturePad } from "@/components/forms/signature-pad";
import { format } from "date-fns";

interface VatFormProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

const currentYear = new Date().getFullYear();
const taxYears = [currentYear, currentYear - 1];
const quarters = [
  { value: 1, label: "Q1 (Jan - Mar)" },
  { value: 2, label: "Q2 (Apr - Jun)" },
  { value: 3, label: "Q3 (Jul - Sep)" },
  { value: 4, label: "Q4 (Oct - Dec)" },
];

export function VatForm({ currentStep, onStepChange, totalSteps }: VatFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<VatFormData>({
    resolver: zodResolver(vatFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      residentId: "",
      email: "",
      phone: "",
      taxYear: currentYear,
      quarter: 1,
      totalRetailSales: 0,
      previousCredits: 0,
      certificationAccepted: false,
      signatureData: "",
    },
  });

  const totalRetailSales = form.watch("totalRetailSales") || 0;
  const previousCredits = form.watch("previousCredits") || 0;
  const taxYear = form.watch("taxYear");
  const quarter = form.watch("quarter");

  const vatCalculation = calculateVat({
    totalRetailSales,
    previousCredits,
  });

  const quarterDates = getQuarterDates(taxYear, quarter);

  const handleNext = async () => {
    let fieldsToValidate: (keyof VatFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "residentId", "email"];
        break;
      case 2:
        fieldsToValidate = ["taxYear", "quarter"];
        break;
      case 3:
        fieldsToValidate = ["totalRetailSales"];
        break;
      case 4:
        fieldsToValidate = ["previousCredits"];
        break;
      case 5:
        fieldsToValidate = ["certificationAccepted"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const onSubmit = async (data: VatFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting VAT:", data);
      console.log("VAT Calculation:", vatCalculation);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Your VAT return for Q{form.getValues("quarter")} {form.getValues("taxYear")} has been submitted.
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
          <p className="text-sm text-gray-600 text-center">
            Confirmation sent to {form.getValues("email")}.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.href = "/"}>
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="max-w-2xl mx-auto">
          {/* Step 1: Business/Personal Information */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Your details as a Próspera retail business operator.
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
                      <FormLabel>Próspera Resident/Business ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="PZ-XXXXX" {...field} />
                      </FormControl>
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
                        <Input type="email" placeholder="business@example.com" {...field} />
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

          {/* Step 2: Tax Period */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Tax Period</CardTitle>
                <CardDescription>
                  Select the quarter you are filing for.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <FormLabel>Quarter *</FormLabel>
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
                          {quarters.map((q) => (
                            <SelectItem key={q.value} value={q.value.toString()}>
                              {q.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Selected Period</h4>
                  <p className="text-sm text-gray-600">
                    {format(quarterDates.start, "MMMM d, yyyy")} - {format(quarterDates.end, "MMMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Sales Information */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Retail Sales</CardTitle>
                <CardDescription>
                  Report your total retail sales for Q{quarter} {taxYear}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="totalRetailSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Retail Sales (USD) *</FormLabel>
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
                      <FormDescription>
                        Total sales of retail goods and services during this quarter.
                        Enter 0 if you had no retail sales.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* VAT Calculation Preview */}
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-green-900">VAT Calculation Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-green-700">Total Retail Sales:</span>
                    <span className="font-medium">{formatCurrency(totalRetailSales)}</span>
                    <span className="text-green-700">Value Added (50%):</span>
                    <span>{formatCurrency(vatCalculation.valueAdded)}</span>
                    <span className="text-green-700">VAT Rate:</span>
                    <span>5%</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="text-green-700 font-medium">Estimated VAT:</span>
                    <span className="font-bold text-green-900">
                      {formatCurrency(vatCalculation.baseVatOwed)}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Effective tax rate: {(TAX_RATES.VAT.EFFECTIVE_RATE * 100).toFixed(1)}% of retail sales
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Adjustments */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle>Credits & Adjustments</CardTitle>
                <CardDescription>
                  Enter any VAT credits from previous periods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="previousCredits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Credits (USD)</FormLabel>
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
                      <FormDescription>
                        Credits carried forward from previous quarters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Updated VAT Calculation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Base VAT:</span>
                    <span>{formatCurrency(vatCalculation.baseVatOwed)}</span>
                    <span className="text-gray-600">Previous Credits:</span>
                    <span className="text-green-600">-{formatCurrency(previousCredits)}</span>
                    <Separator className="col-span-2 my-1" />
                    <span className="font-medium">Net VAT Due:</span>
                    <span className="font-bold">{formatCurrency(vatCalculation.totalDue)}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Review & Sign */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle>Review & Certification</CardTitle>
                <CardDescription>
                  Review your information and sign to submit your VAT return.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Return Summary</h4>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span>{form.getValues("firstName")} {form.getValues("lastName")}</span>
                    <span className="text-gray-600">Resident ID:</span>
                    <span>{form.getValues("residentId")}</span>
                    <span className="text-gray-600">Period:</span>
                    <span>Q{quarter} {taxYear}</span>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span className="text-gray-600">Total Retail Sales:</span>
                    <span>{formatCurrency(totalRetailSales)}</span>
                    <span className="text-gray-600">Value Added:</span>
                    <span>{formatCurrency(vatCalculation.valueAdded)}</span>
                    <span className="text-gray-600">VAT (5%):</span>
                    <span>{formatCurrency(vatCalculation.baseVatOwed)}</span>
                    <span className="text-gray-600">Credits:</span>
                    <span className="text-green-600">-{formatCurrency(previousCredits)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total VAT Due:</span>
                    <span className="font-bold text-xl text-green-600">
                      {formatCurrency(vatCalculation.totalDue)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="certificationAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I certify under penalty of perjury *
                          </FormLabel>
                          <FormDescription>
                            I declare that the information provided is true, correct,
                            and complete to the best of my knowledge and belief.
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
                          <SignaturePad
                            onSave={(data) => field.onChange(data)}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          Sign above using your mouse or touch screen.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !form.getValues("certificationAccepted")}
              >
                {isSubmitting ? "Submitting..." : "Submit Return"}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </Form>
  );
}
