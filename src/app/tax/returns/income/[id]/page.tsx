import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IncomeTaxService } from "@/lib/services/income-tax.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/tax-calculations";
import { DownloadPdfButton } from "@/components/tax/download-pdf-button";

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

export default async function IncomeTaxReturnPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const taxReturn = await IncomeTaxService.getById(id, session.user.id);

  if (!taxReturn) {
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
                Income Tax Return {taxReturn.taxYear}
              </h1>
              <p className="text-sm text-gray-500">ID: {taxReturn.id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${statusColors[taxReturn.status]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span>{statusLabels[taxReturn.status]}</span>
            </div>
            {taxReturn.submittedAt && (
              <span className="text-sm">
                Submitted: {new Date(taxReturn.submittedAt).toLocaleDateString("en-US")}
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
                <p className="text-sm text-gray-500">Tax Year</p>
                <p className="font-medium">{taxReturn.taxYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Creation Date</p>
                <p className="font-medium">
                  {new Date(taxReturn.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Financial Details</h4>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Gross Income:</span>
                <span className="font-medium text-right">
                  {formatCurrency(Number(taxReturn.grossIncome))}
                </span>

                <span className="text-gray-600">Presumed Income (50%):</span>
                <span className="text-right">
                  {formatCurrency(Number(taxReturn.presumedIncome))}
                </span>

                <span className="text-gray-600">Tax Rate:</span>
                <span className="text-right">10%</span>

                <span className="text-gray-600">Base Tax:</span>
                <span className="text-right">
                  {formatCurrency(Number(taxReturn.taxOwed))}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Entity Tax Credits:</span>
                <span className="text-green-600 text-right">
                  -{formatCurrency(Number(taxReturn.entityTaxCredits))}
                </span>

                <span className="text-gray-600">Other Credits:</span>
                <span className="text-green-600 text-right">
                  -{formatCurrency(Number(taxReturn.otherCredits))}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-lg">Total Due:</span>
                <span className="font-bold text-xl text-right text-blue-600">
                  {formatCurrency(Number(taxReturn.totalDue))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Card */}
        {taxReturn.signatureData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-4">
                <Image
                  src={taxReturn.signatureData}
                  alt="Digital signature"
                  width={200}
                  height={96}
                  unoptimized
                  className="mx-auto"
                />
              </div>
              {taxReturn.signedAt && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Signed on {new Date(taxReturn.signedAt).toLocaleString("en-US")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <DownloadPdfButton
            type="income"
            id={taxReturn.id}
            year={taxReturn.taxYear}
          />
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
