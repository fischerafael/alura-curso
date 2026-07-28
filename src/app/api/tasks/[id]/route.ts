import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@backend/auth";
import { deleteTask, TaskNotFoundError } from "@backend/tasks/use-cases";

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
