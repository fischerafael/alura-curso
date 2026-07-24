import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@backend/auth";
import { InvalidStatusError, listTasks } from "@backend/tasks";

export async function GET(request: NextRequest) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  try {
    const result = await listTasks(auth.sub, status);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InvalidStatusError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}

// POST (criar task) chega na A3, junto com os alunos.
