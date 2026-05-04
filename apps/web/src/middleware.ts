import { NextRequest, NextResponse } from "next/server";

function normalizeHost(host: string) {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const rootDomain = normalizeHost(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "lvh.me",
  );
  const host = normalizeHost(request.headers.get("host") ?? "");

  if (!host || host === "localhost" || host === rootDomain || host === `www.${rootDomain}`) {
    return NextResponse.next();
  }

  if (host.endsWith(`.${rootDomain}`) && pathname === "/") {
    const tenantSlug = host.replace(`.${rootDomain}`, "");
    const url = request.nextUrl.clone();
    url.pathname = `/t/${tenantSlug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
