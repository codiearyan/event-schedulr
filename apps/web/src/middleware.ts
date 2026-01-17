import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = [
	"/events",
	"/create-event",
	"/announcements",
	"/analytics",
	"/profile",
];

export function middleware(request: NextRequest) {
	const sessionCookie = request.cookies
		.getAll()
		.find((c) => c.name.endsWith("better-auth.session_token"));
	const isAuthenticated = !!sessionCookie;
	const { pathname } = request.nextUrl;

	if (
		protectedRoutes.some((route) => pathname.startsWith(route)) &&
		!isAuthenticated
	) {
		const redirectUrl = new URL("/auth", request.url);
		redirectUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(redirectUrl);
	}

	if (pathname === "/auth" && isAuthenticated) {
		return NextResponse.redirect(new URL("/events", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
