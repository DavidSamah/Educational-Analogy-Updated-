import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index.js";

describe("API Integration", () => {
  it("should return health check", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "api-test@example.com",
        password: "SecurePass123!",
        name: "API Test User",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("api-test@example.com");
    expect(response.body.accessToken).toBeDefined();
  });

  it("should login with valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "login-test@example.com",
        password: "SecurePass123!",
        name: "Login Test",
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login-test@example.com",
        password: "SecurePass123!",
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it("should reject invalid login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "WrongPass123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should protect routes without auth", async () => {
    const response = await request(app).get("/api/concepts");
    expect(response.status).toBe(401);
  });

  it("should return concepts with auth", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: "concepts-test@example.com",
        password: "SecurePass123!",
        name: "Concepts Test",
      });

    const token = loginResponse.body.accessToken;
    const response = await request(app)
      .get("/api/concepts")
      .set("Authorization", "Bearer " + token);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});
