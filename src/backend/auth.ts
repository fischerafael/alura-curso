import jwt from "jsonwebtoken";
import { prisma } from "@backend/lib/db";

const JWT_SECRET = process.env.JWT_SECRET as string;

export class InvalidEmailError extends Error {}

export type AuthPayload = { sub: string; email: string };

export function getAuthPayload(request: Request): AuthPayload | null {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function login(email: string) {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new InvalidEmailError("Email inválido");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token, user };
}
