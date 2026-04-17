import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      // NextAuth must remain reachable without an existing session.
      if (pathname.startsWith("/api/auth")) return true;

      // Don't gate API routes in middleware. Individual route handlers are
      // responsible for auth (and some endpoints are intentionally public).
      if (pathname.startsWith("/api")) return true;

      // Public routes
      if (
        pathname === "/" ||
        pathname.startsWith("/store") ||
        pathname.startsWith("/qr") ||
        pathname.startsWith("/we") ||
        pathname.startsWith("/api/public")
      ) {
        return true;
      }

      // Auth pages
      if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
        return true;
      }

      if (!token) return false;

      if (pathname.startsWith("/admin")) return token.role === "COMPANY_ADMIN";

      // Employees can sign in before being approved; access to portal pages is
      // handled in the employee layout (redirects to /sign-in?pending=1).
      if (pathname.startsWith("/employee")) return token.role === "EMPLOYEE";

      if (pathname.startsWith("/customer")) return token.role === "CUSTOMER";

      return true;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});

export const config = {
  // Exclude Next.js internals and all direct file requests (e.g. /we/p.jpg).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
