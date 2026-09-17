import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  inviteAcceptNewUserSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/types/auth.type";

describe("auth schemas", () => {
  it("validates login input", () => {
    expect(loginSchema.safeParse({ email: "hr@acme.example", password: "secret" }).success).toBe(
      true,
    );
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(
      false,
    );
    expect(loginSchema.safeParse({ email: "hr@acme.example", password: "" }).success).toBe(false);
  });

  it("requires matching 12+ character passwords on registration", () => {
    const valid = {
      organizationName: "Acme",
      firstName: "Asha",
      lastName: "Sharma",
      email: "hr@acme.example",
      password: "correct horse battery staple",
      confirmPassword: "correct horse battery staple",
    };

    expect(registerSchema.safeParse(valid).success).toBe(true);
    expect(
      registerSchema.safeParse({ ...valid, confirmPassword: "different passphrase here" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" }).success,
    ).toBe(false);
  });

  it("normalizes email case for login and recovery", () => {
    const parsed = loginSchema.parse({ email: "HR@Acme.EXAMPLE", password: "secret" });

    expect(parsed.email).toBe("hr@acme.example");
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false);
  });

  it("requires token plus matching passwords for reset and invite acceptance", () => {
    expect(
      resetPasswordSchema.safeParse({
        token: "",
        password: "correct horse battery staple",
        confirmPassword: "correct horse battery staple",
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        token: "t",
        password: "correct horse battery staple",
        confirmPassword: "correct horse battery staple",
      }).success,
    ).toBe(true);
    expect(
      inviteAcceptNewUserSchema.safeParse({
        token: "t",
        firstName: "",
        lastName: "Hire",
        password: "correct horse battery staple",
        confirmPassword: "correct horse battery staple",
      }).success,
    ).toBe(false);
  });
});
