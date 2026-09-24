import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register"];

// TODO: Middleware để kiểm tra quyền truy cập
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip public paths and static assets
    if (
        publicPaths.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check for access token in cookie (server-side check)
    // Client-side auth is handled by the auth store and axios interceptor
    // This middleware primarily prevents flashing of protected pages
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/calendar/:path*", "/notes/:path*", "/settings/:path*"],
};
