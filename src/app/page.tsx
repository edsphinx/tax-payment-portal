import Link from "next/link";
import { auth } from "@/auth";

// Get current tax deadlines
function getNextDeadlines() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const deadlines = [];

  // Income Tax deadline - April 30th
  const incomeTaxDeadline = new Date(currentYear, 3, 30);
  if (now < incomeTaxDeadline) {
    deadlines.push({
      type: "Income Tax",
      date: incomeTaxDeadline,
      label: `April 30, ${currentYear}`,
      urgent: (incomeTaxDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 30,
    });
  }

  // VAT quarterly deadlines - 15 days after quarter end
  const quarters = [
    { end: new Date(currentYear, 2, 31), label: "Q1" },
    { end: new Date(currentYear, 5, 30), label: "Q2" },
    { end: new Date(currentYear, 8, 30), label: "Q3" },
    { end: new Date(currentYear, 11, 31), label: "Q4" },
  ];

  for (const q of quarters) {
    const dueDate = new Date(q.end);
    dueDate.setDate(dueDate.getDate() + 15);
    if (now < dueDate && now > new Date(q.end.getTime() - 90 * 24 * 60 * 60 * 1000)) {
      deadlines.push({
        type: `VAT ${q.label}`,
        date: dueDate,
        label: dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        urgent: (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 15,
      });
      break;
    }
  }

  return deadlines.slice(0, 2);
}

export default async function Home() {
  const session = await auth();
  const deadlines = getNextDeadlines();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-lg text-foreground">Próspera</span>
                <span className="text-muted-foreground ml-1">Tax Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Dashboard</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Sign In</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-ocean-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-coral-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-50 text-ocean-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Official Próspera ZEDE Tax Filing System</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              File Your Taxes
              <span className="block text-ocean-500">Simply & Securely</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Experience the most efficient tax filing system in the Americas.
              Low rates, transparent calculations, and complete digital compliance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={session?.user ? "/dashboard" : "/auth/signin"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Start Filing Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#tax-types"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-border text-foreground font-semibold text-lg hover:bg-muted/50 transition-all"
              >
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "5%", label: "Income Tax Rate", sublabel: "Effective" },
              { value: "2.5%", label: "VAT Rate", sublabel: "On retail sales" },
              { value: "0%", label: "Capital Gains", sublabel: "No tax" },
              { value: "100%", label: "Digital", sublabel: "Filing process" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-luxury">
                <div className="text-3xl md:text-4xl font-bold text-ocean-600 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-foreground">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines Alert */}
      {deadlines.length > 0 && (
        <section className="py-6 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200/50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 text-amber-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Upcoming Deadlines:</span>
              </div>
              {deadlines.map((deadline) => (
                <div
                  key={deadline.type}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${deadline.urgent
                      ? "bg-red-100 text-red-700"
                      : "bg-white text-gray-700"
                    } font-medium text-sm`}
                >
                  <span>{deadline.type}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className={deadline.urgent ? "font-bold" : ""}>{deadline.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tax Types Section */}
      <section id="tax-types" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Filing Type
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Próspera offers one of the simplest tax systems in the world.
              Select your return type to begin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Income Tax Card */}
            <Link href="/tax/income" className="group">
              <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-ocean-50 via-white to-cyan-50 border border-ocean-100 shadow-luxury hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-ocean-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center mb-6 shadow-lg shadow-ocean-500/25">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-ocean-600 transition-colors">
                    Income Tax Return
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Annual filing for individuals. Report your employment and business income
                    with our guided step-by-step process.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1.5 rounded-lg bg-ocean-100 text-ocean-700 text-sm font-medium">
                      5% Effective Rate
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white text-gray-600 text-sm font-medium border border-gray-200">
                      Due: April 30
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white text-gray-600 text-sm font-medium border border-gray-200">
                      ~10 min to complete
                    </span>
                  </div>

                  <div className="flex items-center text-ocean-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    <span>Start Income Tax Filing</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* VAT Card */}
            <Link href="/tax/vat" className="group">
              <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-luxury hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-emerald-600 transition-colors">
                    VAT Return
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Quarterly filing for retailers. Report your retail sales and calculate
                    the value-added tax with automatic calculations.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium">
                      2.5% Effective Rate
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white text-gray-600 text-sm font-medium border border-gray-200">
                      Quarterly Filing
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-white text-gray-600 text-sm font-medium border border-gray-200">
                      ~5 min to complete
                    </span>
                  </div>

                  <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    <span>Start VAT Filing</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why File with Próspera?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our digital tax system is designed for simplicity and compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Instant Calculations",
                description: "Tax amounts calculated in real-time as you enter your data. No spreadsheets needed.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Legally Compliant",
                description: "Every submission meets Próspera ZEDE Tax Statute requirements. Digital signatures included.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Multiple Payment Options",
                description: "Pay via credit card, bank transfer, or cryptocurrency. Bitcoin accepted.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-luxury transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-ocean-500 to-ocean-600 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTZWMGg2djMwem0tNiAwSDB2LTZoMzB2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to File Your Taxes?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of Próspera residents enjoying the simplest tax system in the region.
              </p>
              <Link
                href={session?.user ? "/dashboard" : "/auth/signin"}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-ocean-600 font-semibold text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {session?.user ? "Go to Dashboard" : "Create Free Account"}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Próspera ZEDE. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="mailto:gsp@prospera.hn" className="hover:text-foreground transition-colors">
                Contact: gsp@prospera.hn
              </a>
              <a href="https://prospera.hn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                prospera.hn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
