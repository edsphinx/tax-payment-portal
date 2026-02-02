import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

/**
 * Full auth config with Prisma adapter
 * Uses JWT sessions for Edge compatibility
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers,

    // Magic Link via Resend (email)
    Resend({
      from: "Próspera Tax Portal <noreply@prospera.hn>",
    }),

    // Credentials for development/testing
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        // For development only - remove in production
        if (process.env.NODE_ENV === "development") {
          const email = credentials?.email as string;
          if (email) {
            // Find or create user
            let user = await db.user.findUnique({
              where: { email },
            });

            if (!user) {
              user = await db.user.create({
                data: {
                  email,
                  name: email.split("@")[0],
                },
              });
            }

            return user;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch Próspera-specific fields
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            residentId: true,
            firstName: true,
            lastName: true,
          },
        });
        if (dbUser) {
          token.residentId = dbUser.residentId;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.residentId = token.residentId as string | null;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
      }
      return session;
    },
  },
});
