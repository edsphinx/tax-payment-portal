import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Próspera Tax Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            File your income tax and VAT returns quickly and easily.
            Simple, transparent, and legally compliant.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Income Tax Card */}
          <Link href="/tax/income" className="group">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-200">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Income Tax Return
              </h2>
              <p className="text-gray-600 mb-4">
                Annual individual income tax filing. Effective rate: 5% of gross income.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  Due: April 30th yearly
                </span>
              </div>
            </div>
          </Link>

          {/* VAT Card */}
          <Link href="/tax/vat" className="group">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-200">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                VAT Return
              </h2>
              <p className="text-gray-600 mb-4">
                Quarterly retail VAT filing. Effective rate: 2.5% of retail sales.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  Due: Quarterly (15 days after quarter end)
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Tax Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              About Próspera Taxes
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Income Tax</h4>
                <p className="text-sm">
                  50% of gross income is deemed &quot;presumed income&quot; and taxed at 10%,
                  resulting in an effective 5% tax rate.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Retail VAT</h4>
                <p className="text-sm">
                  5% tax on retail value add (50% of retail sales price),
                  resulting in an effective 2.5% sales tax.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
