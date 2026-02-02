import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      residentId?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    } & DefaultSession["user"];
  }
}
