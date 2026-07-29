import { UserRepository } from "../../repositories/UserRepository.js";
import { hashPassword, verifyPassword } from "./PasswordService.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, type TokenPayload } from "./TokenService.js";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  private userRepo = new UserRepository();

  async register(data: unknown) {
    const parsed = RegisterSchema.parse(data);
    const existing = this.userRepo.findByEmail(parsed.email);
    if (existing) {
      throw new Error("User already exists");
    }
    const passwordHash = await hashPassword(parsed.password);
    const user = this.userRepo.create({
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      role: "student",
      preferences: {},
    });
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(data: unknown) {
    const parsed = LoginSchema.parse(data);
    const user = this.userRepo.findByEmail(parsed.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const valid = await verifyPassword(parsed.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { user: this.sanitize(user), ...tokens };
  }

  refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }
    const tokens = this.generateTokens(payload.userId, payload.email, payload.role);
    return tokens;
  }

  verifyToken(token: string): TokenPayload | null {
    return verifyAccessToken(token);
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload: TokenPayload = { userId, email, role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  private sanitize(user: { id: string; email: string; name: string; role: string; preferences: Record<string, unknown>; createdAt: string; updatedAt: string }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...rest } = user as unknown as { passwordHash: string; [key: string]: unknown };
    return rest;
  }
}

