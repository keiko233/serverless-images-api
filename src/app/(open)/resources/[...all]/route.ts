import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const baseURL = new URL(request.url).origin;
  return NextResponse.redirect(new URL('/', baseURL));
}
