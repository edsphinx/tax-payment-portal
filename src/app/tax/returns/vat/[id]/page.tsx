import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { VatService } from "@/lib/services/vat.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, VAT_PAYMENT_INFO } from "@/lib/tax-calculations";
import { DownloadPdfButton } from "@/components/tax/download-pdf-button";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function VatReturnPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const vatReturn = await VatService.getById(id, session.user.id);

  if (!vatReturn) {
    notFound();
  }

  // Calculate line values for display
  const totalRetailSales = Number(vatReturn.totalRetailSales);
  const valueAdded = Number(vatReturn.valueAdded);
  const vatOwed = Number(vatReturn.vatOwed);
  const previousCredits = Number(vatReturn.previousCredits);
  const totalDue = Number(vatReturn.totalDue);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white print:min-h-0">
      {/* Header - Hide on print */}
      <header className="bg-white border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                VAT Return Q{vatReturn.quarter} {vatReturn.taxYear}
              </h1>
              <p className="text-sm text-gray-500">ID: {vatReturn.id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl print:py-0 print:max-w-none">
        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-center">
            Prospera ZEDE Retail VAT Quarterly Return
          </h1>
          <p className="text-center text-sm text-gray-600">
            Form 3 - Tax Quarter {vatReturn.quarter}, Tax Year {vatReturn.taxYear}
          </p>
          <p className="text-center text-xs text-gray-500">
            Tax Statute 2019, Sections 2-1-38-9-0-0-56, et seq.
          </p>
        </div>

        {/* Status Banner - Hide on print */}
        <div className={`rounded-lg p-4 mb-6 ${statusColors[vatReturn.status]} print:hidden`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span>{statusLabels[vatReturn.status]}</span>
            </div>
            {vatReturn.submittedAt && (
              <span className="text-sm">
                Submitted: {new Date(vatReturn.submittedAt).toLocaleDateString("en-US")}
              </span>
            )}
          </div>
        </div>

        {/* Taxpayer Info */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="print:py-2">
            <CardTitle className="print:text-lg">Taxpayer Information</CardTitle>
          </CardHeader>
          <CardContent className="print:py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{vatReturn.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">(e)Resident Permit Number</p>
                <p className="font-medium">{vatReturn.user?.residentId || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Period</p>
                <p className="font-medium">Q{vatReturn.quarter} {vatReturn.taxYear}</p>
              </div>
              <div>
                <p className="text-gray-500">Date Range</p>
                <p className="font-medium">
                  {format(new Date(vatReturn.periodStart), "MMM d", { locale: enUS })} -{" "}
                  {format(new Date(vatReturn.periodEnd), "MMM d, yyyy", { locale: enUS })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Calculation - Form 3 Lines */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="print:py-2">
            <CardTitle className="print:text-lg">Retail Value Added Tax Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 print:py-2">
            <div className="bg-green-50 rounded-lg p-4 print:bg-white print:border">
              <h4 className="font-medium text-green-900 mb-3 print:text-black">Information Lines</h4>

              <div className="space-y-3 text-sm">
                {/* Line 1 */}
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-2 text-gray-700">
                    <strong>Line 1:</strong> Value received for sale of goods and services
                    <br />
                    <span className="text-xs text-gray-500">
                      Per Sections 2-1-38-9-0-0-60(2), et seq.
                    </span>
                  </span>
                  <span className="text-right font-medium">
                    {formatCurrency(totalRetailSales)}
                  </span>
                </div>

                {/* Line 2 */}
                <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded print:bg-gray-50">
                  <span className="col-span-2 text-gray-700">
                    <strong>Line 2:</strong> Presumed Value Added by Retail Activity
                    <br />
                    <span className="text-xs text-gray-500">50% of Line 1</span>
                  </span>
                  <span className="text-right font-medium text-green-600">
                    {formatCurrency(valueAdded)}
                  </span>
                </div>

                {/* Line 3 */}
                <div className="grid grid-cols-3 gap-2 bg-green-100 p-2 rounded print:bg-gray-100">
                  <span className="col-span-2 text-gray-700">
                    <strong>Line 3:</strong> Initial Retail VAT Calculation (5% of Line 2)
                  </span>
                  <span className="text-right font-bold text-green-700">
                    {formatCurrency(vatOwed)}
                  </span>
                </div>

                {/* Line 4 */}
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-2 text-gray-700">
                    <strong>Line 4:</strong> Credit for Marketable Trade Credit Applied (MTC)
                    <br />
                    <span className="text-xs text-gray-500">Cannot exceed amount in Line 3</span>
                  </span>
                  <span className="text-right font-medium text-green-600">
                    -{formatCurrency(previousCredits)}
                  </span>
                </div>

                <Separator />

                {/* Line 5 */}
                <div className="grid grid-cols-3 gap-2 bg-gray-100 p-3 rounded">
                  <span className="col-span-2 text-gray-900 font-semibold text-lg">
                    <strong>Line 5:</strong> Your Retail VAT Liability for Tax Quarter
                  </span>
                  <span className="text-right font-bold text-xl text-green-600">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="print:py-2">
            <CardTitle className="print:text-lg">Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="print:py-2">
            <div className="space-y-4 text-sm">
              <div className="bg-amber-50 rounded-lg p-4 print:bg-white print:border">
                <p className="font-medium text-amber-900 mb-2 print:text-black">Option 1: Mail Check</p>
                <p className="text-amber-800 print:text-black">
                  Please deliver check to name of: <strong>{VAT_PAYMENT_INFO.checkPayableTo}</strong>
                </p>
                <p className="text-amber-800 print:text-black">
                  {VAT_PAYMENT_INFO.checkMailingAddress.line1}
                </p>
                <p className="text-amber-800 print:text-black">
                  {VAT_PAYMENT_INFO.checkMailingAddress.line2}
                </p>
                <p className="text-amber-800 print:text-black">
                  {VAT_PAYMENT_INFO.checkMailingAddress.city}, {VAT_PAYMENT_INFO.checkMailingAddress.state} {VAT_PAYMENT_INFO.checkMailingAddress.postalCode}
                </p>
              </div>

              <Separator />

              <div className="bg-blue-50 rounded-lg p-4 print:bg-white print:border">
                <p className="font-medium text-blue-900 mb-2 print:text-black">Option 2: Wire Transfer</p>
                <div className="text-blue-800 print:text-black space-y-1">
                  <p>Bank: <strong>{VAT_PAYMENT_INFO.wireTransfer.bankName}</strong></p>
                  <p>Beneficiary: <strong>{VAT_PAYMENT_INFO.wireTransfer.beneficiary}</strong></p>
                  <p>Address: {VAT_PAYMENT_INFO.wireTransfer.address}</p>
                  <p>Account Number: <strong>{VAT_PAYMENT_INFO.wireTransfer.accountNumber}</strong></p>
                  <p>Routing Number: <strong>{VAT_PAYMENT_INFO.wireTransfer.routingNumber}</strong></p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-gray-700">
                  <strong>Due:</strong> Email to Prospera Tax Commissioner at the end of each quarter: <strong>gsp@prospera.hn</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certification & Signature */}
        <Card className="mb-6 print:shadow-none print:border">
          <CardHeader className="print:py-2">
            <CardTitle className="print:text-lg">Certification</CardTitle>
          </CardHeader>
          <CardContent className="print:py-2">
            {vatReturn.certificationAccepted && (
              <div className="bg-green-50 rounded-lg p-4 mb-4 print:bg-white print:border">
                <p className="text-sm text-green-800 print:text-black">
                  I certify under penalty of perjury that the foregoing information is true, correct,
                  and complete to the best of my knowledge. All statements applicable to the form of
                  proof under the Prospera Civil Penalty Schedule, International Commercial Terms Inc.,
                  Ed. 2017, are incorporated herein to the full extent applicable. For negative values,
                  enter zero as positive numbers; disregard effective.
                </p>
              </div>
            )}

            {vatReturn.signatureData && (
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Digital Signature:</p>
                <Image
                  src={vatReturn.signatureData}
                  alt="Digital signature"
                  width={200}
                  height={96}
                  unoptimized
                  className="mx-auto"
                />
                {vatReturn.signedAt && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Signed on {new Date(vatReturn.signedAt).toLocaleString("en-US")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions - Hide on print */}
        <div className="flex gap-4 justify-center print:hidden">
          <DownloadPdfButton
            type="vat"
            id={vatReturn.id}
            year={vatReturn.taxYear}
            quarter={vatReturn.quarter}
          />
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
