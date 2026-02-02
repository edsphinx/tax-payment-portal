import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userName = session.user.firstName || session.user.name || session.user.email;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Próspera Tax Portal</h1>
            <p className="text-sm text-gray-500">Welcome, {userName}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">File Your Taxes</h2>
          <p className="text-gray-600">Choose a tax form to begin filing.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* Income Tax Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle>Income Tax Return</CardTitle>
              <CardDescription>
                Annual individual income tax filing. Effective rate: 5% of gross income.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  Due: April 30th yearly
                </span>
                <Link href="/tax/income">
                  <Button>Start Filing</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* VAT Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <CardTitle>VAT Return</CardTitle>
              <CardDescription>
                Quarterly retail VAT filing. Effective rate: 2.5% of retail sales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  Due: Quarterly
                </span>
                <Link href="/tax/vat">
                  <Button variant="outline">Start Filing</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card */}
        <Card className="max-w-4xl mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{session.user.email}</span>
              </div>
              {session.user.residentId && (
                <div>
                  <span className="text-gray-500">Resident ID:</span>
                  <span className="ml-2 font-medium">{session.user.residentId}</span>
                </div>
              )}
            </div>
            {!session.user.residentId && (
              <p className="text-sm text-amber-600 mt-4">
                Complete your profile with your Próspera Resident ID to file taxes.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
