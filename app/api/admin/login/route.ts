import { NextRequest, NextResponse } from "next/server";

const DEMO_PASSWORD = "demo1234";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password !== DEMO_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "1", { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 8 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_session");
  return res;
}
