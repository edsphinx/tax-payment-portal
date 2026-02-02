"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have access to this resource.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An error occurred during authentication.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="w-full max-w-md">
      <div className="border rounded-lg p-8 text-center bg-white">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h1>
        <p className="text-sm text-slate-600 mb-6">{errorMessage}</p>
        <Link
          href="/auth/signin"
          className="inline-block px-4 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-6 py-4">
          <Link href="/">
            <span className="text-lg font-bold tracking-tight">Próspera</span>
            <span className="text-lg font-light text-slate-400 ml-1">Tax Portal</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center bg-slate-50 p-4">
        <Suspense
          fallback={
            <div className="w-full max-w-md">
              <div className="border rounded-lg p-8 text-center bg-white">
                <p className="text-slate-600">Loading...</p>
              </div>
            </div>
          }
        >
          <ErrorContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-4">
        <div className="container mx-auto px-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Próspera ZEDE Tax Administration
        </div>
      </footer>
    </div>
  );
}
