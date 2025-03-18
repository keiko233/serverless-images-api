import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { checkAndRecordRequest } from "./actions/query/request";

const DASHBOARD_PATH = "/dashboard";

function handleCORS(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin") || "*";

  response.headers.set("Access-Control-Allow-Origin", origin);
  // only allow GET requests
  response.headers.set("Access-Control-Allow-Methods", "GET");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

export default async function authMiddleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && request.nextUrl.pathname.startsWith(DASHBOARD_PATH)) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (!request.nextUrl.pathname.startsWith(DASHBOARD_PATH)) {
    await checkAndRecordRequest({
      ipAddress:
        request.headers.get("x-real-ip") ||
        request.headers.get("x-forwarded-for") ||
        "Unknown",
      method: request.method,
      endpoint: request.nextUrl.pathname,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    const response = NextResponse.next();
    return handleCORS(request, response);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
