import { NextResponse } from "next/server";
import { getHelloMessage } from "@backend/hello";

export function GET() {
  return NextResponse.json(getHelloMessage());
}
