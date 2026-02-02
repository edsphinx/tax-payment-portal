"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <CardTitle className="text-red-600">Authentication Error</CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link href="/auth/signin">
          <Button>Try Again</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
