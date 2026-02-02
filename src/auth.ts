import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    // OAuth Providers
    Google,
    GitHub,

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
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      // Add user id and custom fields to session
      if (session.user) {
        session.user.id = user.id;
        // Add Próspera-specific fields
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: {
            residentId: true,
            firstName: true,
            lastName: true,
          },
        });
        if (dbUser) {
          session.user.residentId = dbUser.residentId;
          session.user.firstName = dbUser.firstName;
          session.user.lastName = dbUser.lastName;
        }
      }
      return session;
    },
  },
});
