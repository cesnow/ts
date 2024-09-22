import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  console.log('process.env.NEXT_PUBLIC_SENTRY_DSN', process.env.NEXT_PUBLIC_SENTRY_DSN);
  return NextResponse.json({ data: process.env.NEXT_PUBLIC_SENTRY_DSN });
}
