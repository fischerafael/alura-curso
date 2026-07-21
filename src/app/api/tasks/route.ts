import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@backend/auth";
import { listTasks } from "@backend/tasks";

export async function GET(request: NextRequest) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const tasks = await listTasks(auth.sub);
  return NextResponse.json({ tasks });
}

// POST (criar task) chega na A3, junto com os alunos.
