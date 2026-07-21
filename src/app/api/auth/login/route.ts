import { NextRequest, NextResponse } from "next/server";
import { login, InvalidEmailError } from "@backend/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email;

  try {
    const { token, user } = await login(email);
    return NextResponse.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error instanceof InvalidEmailError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
