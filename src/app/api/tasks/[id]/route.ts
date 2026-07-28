import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@backend/auth";
import {
  deleteTask,
  updateTaskStatus,
  InvalidStatusError,
  TaskNotFoundError,
} from "@backend/tasks/use-cases";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteTask(auth.sub, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = getAuthPayload(request);
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const task = await updateTaskStatus(auth.sub, id, body?.status);
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof InvalidStatusError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
