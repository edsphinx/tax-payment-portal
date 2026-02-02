import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { VatService } from "@/lib/services/vat.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/tax-calculations";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${statusColors[vatReturn.status]}`}>
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

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Return Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium">Q{vatReturn.quarter} {vatReturn.taxYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Range</p>
                <p className="font-medium">
                  {format(new Date(vatReturn.periodStart), "MMM d", { locale: enUS })} -{" "}
                  {format(new Date(vatReturn.periodEnd), "MMM d, yyyy", { locale: enUS })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Financial Details</h4>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Total Retail Sales:</span>
                <span className="font-medium text-right">
                  {formatCurrency(Number(vatReturn.totalRetailSales))}
                </span>

                <span className="text-gray-600">Value Added (50%):</span>
                <span className="text-right">
                  {formatCurrency(Number(vatReturn.valueAdded))}
                </span>

                <span className="text-gray-600">VAT Rate:</span>
                <span className="text-right">5%</span>

                <span className="text-gray-600">Base VAT:</span>
                <span className="text-right">
                  {formatCurrency(Number(vatReturn.vatOwed))}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Previous Credits:</span>
                <span className="text-green-600 text-right">
                  -{formatCurrency(Number(vatReturn.previousCredits))}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-lg">Total Due:</span>
                <span className="font-bold text-xl text-right text-green-600">
                  {formatCurrency(Number(vatReturn.totalDue))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Card */}
        {vatReturn.signatureData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4">
                <Image
                  src={vatReturn.signatureData}
                  alt="Digital signature"
                  width={200}
                  height={96}
                  unoptimized
                  className="mx-auto"
                />
              </div>
              {vatReturn.signedAt && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Signed on {new Date(vatReturn.signedAt).toLocaleString("en-US")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
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
