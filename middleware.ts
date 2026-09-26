import { NextRequest, NextResponse } from "next/server";

/**
 * Demo resolves brand by route prefix: /s/[brand]/...
 * Setting NEXT_PUBLIC_BRAND_BY_HOSTNAME=true switches to subdomain-based resolution
 * (e.g. studymaterial.localhost:3000 -> /s/studymaterial/...), for when each brand gets
 * its own real subdomain/domain later. Off by default so the demo works on one URL.
 */
const HOSTNAME_TO_BRAND: Record<string, string> = {
  studymaterial: "ignoustudymaterial",
  questionpaper: "ignouquestionpaper",
  solvedassignment: "ignousolvedassignment",
  project: "ignouproject",
  main: "shrichakradhar",
};

export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_BRAND_BY_HOSTNAME !== "true") {
    return NextResponse.next();
  }

  const hostname = request.headers.get("host") ?? "";
  const subdomain = hostname.split(".")[0];
  const brand = HOSTNAME_TO_BRAND[subdomain];
  if (!brand) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (!url.pathname.startsWith(`/s/${brand}`) && !url.pathname.startsWith("/admin")) {
    url.pathname = `/s/${brand}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
