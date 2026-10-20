import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../src/lib/auth";

describe("Authentication & Security", () => {
  it("hashes password with salt and successfully verifies match", async () => {
    const raw = "Student@SecurePass2026";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(raw, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("creates and verifies valid JWT session token with correct payload", async () => {
    const payload = {
      userId: "test-user-uuid-123",
      email: "student@opportunity.ai",
      role: "STUDENT" as const,
      name: "Aarav Sharma",
    };

    const token = await createSessionToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
    expect(verified?.name).toBe(payload.name);
  });

  it("rejects invalid or tampered session tokens", async () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature";
    const verified = await verifySessionToken(invalidToken);
    expect(verified).toBeNull();
  });
});
