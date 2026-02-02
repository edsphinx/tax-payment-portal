"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-3 py-1.5 text-sm border border-slate-600 rounded text-slate-300 hover:text-white hover:border-slate-400 transition-colors"
    >
      Sign Out
    </button>
  );
}
