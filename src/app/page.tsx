import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold tracking-tight">Próspera</span>
              <span className="text-lg font-light text-slate-400 ml-1">Tax Portal</span>
            </div>
            <div>
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-white text-slate-900 rounded font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 bg-white text-slate-900 rounded font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero */}
        <section className="bg-slate-50 border-b">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Tax Filing Portal
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                File your income tax and VAT returns online. Secure, simple, and fully compliant
                with Próspera ZEDE Tax Statute 2019.
              </p>
              <Link
                href={session?.user ? "/dashboard" : "/auth/signin"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
              >
                {session?.user ? "Access Your Account" : "Sign In to File"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-8">Available Services</h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              {/* Income Tax */}
              <div className="border rounded-lg p-6 hover:border-slate-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Income Tax Return</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Annual filing for natural persons. Form 1 per Tax Statute §§2-1-38-4-0-0-21.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">10% on presumed income</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">Due: April 1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* VAT */}
              <div className="border rounded-lg p-6 hover:border-slate-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">VAT Return</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Quarterly filing for retailers. Form 3 per Tax Statute §§2-1-38-9-0-0-56.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">5% on value added</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">Quarterly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-slate-50 border-t">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">How It Works</h3>
                <ol className="text-sm text-slate-600 space-y-2">
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">1.</span>
                    Sign in with your account
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">2.</span>
                    Complete the tax form
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">3.</span>
                    Review and sign digitally
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">4.</span>
                    Submit and pay
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Payment Methods</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>Check (mail to tax office)</li>
                  <li>Wire transfer</li>
                  <li>ACH bank transfer</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Contact the Próspera Tax Commissioner for assistance with your filing.
                </p>
                <a
                  href="mailto:gsp@prospera.hn"
                  className="text-sm text-blue-600 hover:underline"
                >
                  gsp@prospera.hn
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-400">
              © {new Date().getFullYear()} Próspera ZEDE Tax Administration
            </span>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="mailto:gsp@prospera.hn" className="hover:text-white transition-colors">
                gsp@prospera.hn
              </a>
              <a href="https://prospera.hn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                prospera.hn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
