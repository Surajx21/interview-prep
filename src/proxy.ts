import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const authRoutes = new Set(["/sign-in", "/sign-up"]);
const publicRoutes = new Set([
  "/sign-in",
  "/sign-up",
  "/privacy-policy",
  "/terms-of-service",
]);

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  if (session && authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && !publicRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat(.*)",
    "/profile",
    "/sign-in",
    "/sign-up",
    "/privacy-policy",
    "/terms-of-service",
  ],
};
