import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { accountForRefresh, sessionToken } from "@/lib/accounts";
import { REFRESH_COOKIE, SESSION_COOKIE, SESSION_SECONDS, cookieOptions, readSession } from "@/lib/session";

/**
 * Staff pages need a signed-in account; the couple portal and sign-in page stay public.
 * Sessions are short, so when one is missing or about to expire the refresh cookie
 * renews it here, for pages and for the API calls the app makes (including the
 * Python planning API, which checks the same cookie).
 */
const RENEW_BEFORE = 5 * 60;

export async function proxy(request: NextRequest) {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session && session.exp - Date.now() / 1000 > RENEW_BEFORE) return NextResponse.next();

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const account = refresh ? await accountForRefresh(refresh).catch(() => null) : null;
  if (account) {
    const token = sessionToken(account, account.session_id);
    request.cookies.set(SESSION_COOKIE, token);
    const headers = new Headers(request.headers);
    headers.set("cookie", request.cookies.toString());
    const response = NextResponse.next({ request: { headers } });
    response.cookies.set(SESSION_COOKIE, token, cookieOptions(SESSION_SECONDS));
    return response;
  }
  if (session) return NextResponse.next();
  // APIs answer 401 themselves; pages go to sign-in and come back afterwards.
  if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();
  const signIn = new URL("/signin", request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next !== "/") signIn.searchParams.set("next", next);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/", "/weddings", "/weddings/:path*", "/api/records", "/api/records/:path*", "/api/portal/:path*", "/api/v1/:path*", "/api/team", "/api/shares"]
};
