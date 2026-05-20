import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(getSessionCookieName(), "", {
    path: "/",
    expires: new Date(0),
  });
  return response;
}
