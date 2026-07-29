import { describe, it, expect, beforeEach } from "vitest";
import { AuthService } from "../src/services/auth/AuthService.js";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it("should register a new user", async () => {
    const result = await authService.register({
      email: "test@example.com",
      password: "SecurePass123!",
      name: "Test User",
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("test@example.com");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it("should reject duplicate registration", async () => {
    await authService.register({
      email: "duplicate@example.com",
      password: "SecurePass123!",
      name: "First User",
    });

    await expect(
      authService.register({
        email: "duplicate@example.com",
        password: "AnotherPass123!",
        name: "Second User",
      })
    ).rejects.toThrow("User already exists");
  });

  it("should login with valid credentials", async () => {
    await authService.register({
      email: "login@example.com",
      password: "SecurePass123!",
      name: "Login User",
    });

    const result = await authService.login({
      email: "login@example.com",
      password: "SecurePass123!",
    });

    expect(result.user).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });

  it("should reject invalid login", async () => {
    await expect(
      authService.login({
        email: "nonexistent@example.com",
        password: "WrongPass123!",
      })
    ).rejects.toThrow("Invalid credentials");
  });
});
