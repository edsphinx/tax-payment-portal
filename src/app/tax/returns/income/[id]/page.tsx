import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IncomeTaxService } from "@/lib/services/income-tax.service";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/tax-calculations";
import { TAX_RATES } from "@/types";
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
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
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

  // Calculate line values for display
  const grossIncome = Number(taxReturn.grossIncome);
  const presumedIncome = Number(taxReturn.presumedIncome);
  const taxOwed = Number(taxReturn.taxOwed);
  const entityTaxCredits = Number(taxReturn.entityTaxCredits);
  const otherCredits = Number(taxReturn.otherCredits);
  const totalDue = Number(taxReturn.totalDue);
  const totalCredits = entityTaxCredits + otherCredits;

  return (
    <div className="min-h-screen bg-white flex flex-col print:min-h-0">
      {/* Header - Hide on print */}
      <header className="bg-slate-900 text-white print:hidden">
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

      {/* Title & Status */}
      <div className="bg-slate-50 border-b print:hidden">
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">
                Income Tax Return {taxReturn.taxYear}
              </h1>
              <p className="text-sm text-slate-600">Form 1 - Annual Filing</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[taxReturn.status]}`}>
              {statusLabels[taxReturn.status]}
            </div>
          </div>
          {taxReturn.submittedAt && (
            <p className="text-sm text-slate-500">
              Submitted: {new Date(taxReturn.submittedAt).toLocaleDateString("en-US")}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8 max-w-3xl print:py-0 print:max-w-none">
        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-center">
            Prospera ZEDE Natural Person Income Tax Return
          </h1>
          <p className="text-center text-sm text-slate-600">
            Form 1 - Tax Year {taxReturn.taxYear}
          </p>
          <p className="text-center text-xs text-slate-500">
            Tax Statute 2019, Sections 2-1-38-4-0-0-21, et seq.
          </p>
        </div>

        {/* Taxpayer Info */}
        <div className="border rounded-lg mb-6 print:shadow-none">
          <div className="px-6 py-4 border-b bg-slate-50 print:bg-white">
            <h2 className="font-semibold text-slate-900">Taxpayer Information</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Name</p>
                <p className="font-medium text-slate-900">{taxReturn.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">(e)Resident Permit Number</p>
                <p className="font-medium text-slate-900">{taxReturn.user?.residentId || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{taxReturn.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">Tax Year</p>
                <p className="font-medium text-slate-900">{taxReturn.taxYear}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Income Tax Calculation - Form 1 Lines */}
        <div className="border rounded-lg mb-6 print:shadow-none">
          <div className="px-6 py-4 border-b bg-slate-50 print:bg-white">
            <h2 className="font-semibold text-slate-900">Income Tax Calculation</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 print:bg-white print:border">
              <h4 className="font-medium text-blue-900 mb-3 print:text-black">Information Lines</h4>

              <div className="space-y-3 text-sm">
                {/* Line 1 */}
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-2 text-slate-700">
                    <strong>Line 1:</strong> Revenue from employment (wages, salary, compensation)
                  </span>
                  <span className="text-right font-medium">
                    {formatCurrency(grossIncome)}
                  </span>
                </div>

                {/* Line 2 */}
                <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded print:bg-slate-50">
                  <span className="col-span-2 text-slate-700">
                    <strong>Line 2:</strong> Presumed Income from Employment
                    <br />
                    <span className="text-xs text-slate-500">
                      (50% of Line 1 less ${TAX_RATES.INCOME_TAX.EMPLOYMENT_DEDUCTION.toLocaleString()}) per Sections 2-1-38-2-0-0-4
                    </span>
                  </span>
                  <span className="text-right font-medium text-blue-600">
                    {formatCurrency(presumedIncome)}
                  </span>
                </div>

                <Separator />

                {/* Line 6 */}
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-2 text-slate-700">
                    <strong>Line 6:</strong> Aggregate Presumed Income
                  </span>
                  <span className="text-right font-medium">
                    {formatCurrency(presumedIncome)}
                  </span>
                </div>

                {/* Line 7 */}
                <div className="grid grid-cols-3 gap-2 bg-blue-100 p-2 rounded print:bg-slate-100">
                  <span className="col-span-2 text-slate-700">
                    <strong>Line 7:</strong> Initial Income Tax Calculation (10% of Line 6)
                  </span>
                  <span className="text-right font-bold text-blue-700">
                    {formatCurrency(taxOwed)}
                  </span>
                </div>

                {/* Line 8 */}
                <div className="grid grid-cols-3 gap-2">
                  <span className="col-span-2 text-slate-700">
                    <strong>Line 8:</strong> Credit for Marketable Tax Credit Applied (MTC)
                    <br />
                    <span className="text-xs text-slate-500">Cannot exceed amount in Line 7</span>
                  </span>
                  <span className="text-right font-medium text-green-600">
                    -{formatCurrency(totalCredits)}
                  </span>
                </div>

                <Separator />

                {/* Line 9 */}
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded">
                  <span className="col-span-2 text-slate-900 font-semibold text-lg">
                    <strong>Line 9:</strong> Income Tax Liability for Tax Year
                  </span>
                  <span className="text-right font-bold text-xl text-blue-600">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 print:bg-white">
              <p className="text-sm text-amber-800 print:text-black">
                <strong>Email by April 1, {taxReturn.taxYear + 1} to Prospera Tax Commissioner:</strong> gsp@prospera.hn
              </p>
            </div>
          </div>
        </div>

        {/* Certification & Signature */}
        <div className="border rounded-lg mb-6 print:shadow-none">
          <div className="px-6 py-4 border-b bg-slate-50 print:bg-white">
            <h2 className="font-semibold text-slate-900">Certification</h2>
          </div>
          <div className="px-6 py-4">
            {taxReturn.certificationAccepted && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 print:bg-white print:border">
                <p className="text-sm text-blue-800 print:text-black">
                  I certify under penalty of perjury that the foregoing information is true, correct,
                  and complete to the best of my knowledge. All statements applicable to the form of
                  proof under the Prospera Civil Penalty Schedule, International Commercial Terms Inc.,
                  Ed. 2017, are incorporated herein to the full extent applicable.
                </p>
              </div>
            )}

            {taxReturn.signatureData && (
              <div className="border rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Digital Signature:</p>
                <Image
                  src={taxReturn.signatureData}
                  alt="Digital signature"
                  width={200}
                  height={96}
                  unoptimized
                  className="mx-auto"
                />
                {taxReturn.signedAt && (
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Signed on {new Date(taxReturn.signedAt).toLocaleString("en-US")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Hide on print */}
        <div className="flex gap-4 justify-center print:hidden">
          <DownloadPdfButton
            type="income"
            id={taxReturn.id}
            year={taxReturn.taxYear}
          />
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-slate-300 rounded font-medium text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-4 print:hidden">
        <div className="container mx-auto px-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Próspera ZEDE Tax Administration
        </div>
      </footer>
    </div>
  );
}
