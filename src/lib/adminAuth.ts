import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET environment variable. Add it to .env.local.");
  }
  return secret;
}

export function createSessionToken(): string {
  return createHmac("sha256", getSessionSecret()).update("admin-session").digest("hex");
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) {
    return false;
  }

  const expected = Buffer.from(createSessionToken());
  const actual = Buffer.from(token);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function isAdminRequest(request: NextRequest): boolean {
  return isValidSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}
