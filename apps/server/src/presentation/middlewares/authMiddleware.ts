import type { Context, Next } from "hono";
import { JwtProvider } from "@/infrastructure/auth/JwtProvider";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { UserRole } from "@/domain/entities/User";

export interface AuthContext {
  userId: number;
  role: UserRole;
}

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

const jwtProvider = new JwtProvider();

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new DomainError(ErrorCodes.AUTH_INVALID_TOKEN, "인증 토큰이 필요합니다.");
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwtProvider.verifyToken(token);
    c.set("auth", {
      userId: payload.userId,
      role: payload.role,
    });
    await next();
  } catch {
    throw new DomainError(ErrorCodes.AUTH_INVALID_TOKEN);
  }
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const payload = jwtProvider.verifyToken(token);
      c.set("auth", {
        userId: payload.userId,
        role: payload.role,
      });
    } catch {
      // 토큰이 유효하지 않아도 계속 진행 (비로그인 사용자)
    }
  }

  await next();
};
