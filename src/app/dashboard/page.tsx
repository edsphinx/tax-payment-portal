import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/signout-button";
import { TaxReturnsList } from "@/components/dashboard/tax-returns-list";
import { TaxFilingCards } from "@/components/dashboard/tax-filing-cards";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userName = session.user.firstName || session.user.name || session.user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white print:hidden">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold tracking-tight">Próspera</span>
              <span className="text-lg font-light text-slate-400 ml-1">Tax Portal</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-slate-400">Signed in as</span>
                <span className="font-medium">{userName}</span>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Welcome Section */}
        <section className="bg-slate-50 border-b py-8">
          <div className="container mx-auto px-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Welcome, {userName}
            </h1>
            <p className="text-slate-600">
              Manage your tax filings and view submission history.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">File a Return</h2>
            <TaxFilingCards />
          </div>
        </section>

        {/* Filing History */}
        <section className="py-8">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Filing History</h2>
              <p className="text-sm text-slate-600 mb-6">Your previous tax submissions</p>
              <div className="border rounded-lg overflow-hidden">
                <TaxReturnsList />
              </div>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="py-8 bg-slate-50 border-t">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
              <div className="bg-white border rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Email</div>
                    <div className="font-medium text-slate-900">{session.user.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Resident ID</div>
                    <div className="font-medium text-slate-900">
                      {session.user.residentId || (
                        <span className="text-amber-600 text-sm">Not configured</span>
                      )}
                    </div>
                  </div>
                </div>

                {!session.user.residentId && (
                  <div className="mt-4 p-4 rounded bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Complete your profile</p>
                        <p className="text-xs text-amber-700">Your Resident ID will be captured when you file your first return.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-6 print:hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <span>© {new Date().getFullYear()} Próspera ZEDE Tax Administration</span>
            <a href="mailto:gsp@prospera.hn" className="hover:text-white transition-colors">
              gsp@prospera.hn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
