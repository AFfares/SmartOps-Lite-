import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "COMPANY_ADMIN" | "EMPLOYEE" | "CUSTOMER";
      organizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "COMPANY_ADMIN" | "EMPLOYEE" | "CUSTOMER";
    organizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "COMPANY_ADMIN" | "EMPLOYEE" | "CUSTOMER";
    organizationId?: string | null;
  }
}
