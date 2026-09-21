import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/token";
import { AUTH_COOKIE_NAME, SUPPORTED_ROLES } from "@/lib/auth/constants";

function getRolePrefix(pathname: string) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/lawyer")) return "lawyer";
  if (pathname.startsWith("/citizen")) return "citizen";
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const rolePrefix = getRolePrefix(pathname);

  if (!token) {
    if (rolePrefix) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    if (rolePrefix) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (!SUPPORTED_ROLES.includes(payload.role)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.sub);
  response.headers.set("x-user-role", payload.role);

  if (rolePrefix && payload.role !== rolePrefix) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
