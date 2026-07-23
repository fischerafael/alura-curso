import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@backend/auth";

export async function GET(request: NextRequest) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({});
}

// POST (criar task) chega na A3, junto com os alunos.
