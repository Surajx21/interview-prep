import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get the pathname from the URL
  const { pathname } = new URL(request.url);

  // If user is signed in and tries to access sign-in or sign-up pages, redirect to home
  if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not signed in and tries to access protected routes
  if (!session && pathname !== "/sign-in" && pathname !== "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/", "/chat(.*)", "/profile", "/sign-in", "/sign-up"],
};
