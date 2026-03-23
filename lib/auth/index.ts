import { sign, verify, JwtPayload } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";

const JWT_SECRET: string = process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET environment variable is required"); })();

export interface TokenPayload extends JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateToken(payload: {
  userId: number;
  email: string;
  role: string;
}): string {
  return sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
}

export function getTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
