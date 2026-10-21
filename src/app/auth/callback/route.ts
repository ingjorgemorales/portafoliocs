import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const db = await sessionClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL("/admin/login?mode=update", process.env.APP_URL || url.origin),
      );
  }
  return NextResponse.redirect(
    new URL("/admin/login?error=recovery", process.env.APP_URL || url.origin),
  );
}
