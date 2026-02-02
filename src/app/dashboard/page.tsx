import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/signout-button";
import { TaxReturnsList } from "@/components/dashboard/tax-returns-list";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userName = session.user.firstName || session.user.name || session.user.email?.split("@")[0];
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - matches landing page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border print:hidden">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-lg text-foreground">Próspera</span>
                <span className="text-muted-foreground ml-1">Tax Portal</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white font-medium text-sm">
                  {userName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{userName}</span>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-ocean-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-coral-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-50 text-ocean-700 text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Welcome back, {userName}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Tax Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your tax filings and view your submission history.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 -mt-4">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {/* Income Tax Card */}
            <Link href="/tax/income" className="group">
              <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-ocean-50 via-white to-cyan-50 border border-ocean-100 shadow-luxury hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-ocean-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/25 flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-ocean-600 transition-colors">
                      Income Tax Return
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Annual filing • 5% effective rate
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-ocean-100 text-ocean-700 text-xs font-medium">
                        Due: April 30, {currentYear}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-ocean-400 group-hover:text-ocean-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* VAT Card */}
            <Link href="/tax/vat" className="group">
              <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-luxury hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-emerald-600 transition-colors">
                      VAT Return
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Quarterly filing • 2.5% effective rate
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
                        Quarterly deadline
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Filing History */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Filing History</h2>
                <p className="text-sm text-muted-foreground">Your previous tax submissions</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white/60 backdrop-blur-sm shadow-luxury overflow-hidden">
              <TaxReturnsList />
            </div>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="p-6 rounded-2xl border border-border bg-white/60 backdrop-blur-sm shadow-luxury">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white font-bold text-2xl">
                  {userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{userName}</h3>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  <div className="font-medium text-foreground">{session.user.email}</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Resident ID</div>
                  <div className="font-medium text-foreground">
                    {session.user.residentId || (
                      <span className="text-amber-600 text-sm">Not configured</span>
                    )}
                  </div>
                </div>
              </div>

              {!session.user.residentId && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Complete your profile</p>
                      <p className="text-xs text-amber-600">Add your Próspera Resident ID to file taxes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
