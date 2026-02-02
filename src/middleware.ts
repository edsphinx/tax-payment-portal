import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware using lightweight auth config (no Prisma)
 * This keeps the Edge Function under 1MB limit
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
