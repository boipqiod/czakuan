import type { Context, Next } from "hono";
import { DomainError } from "@/domain/errors/DomainError";

type HttpStatusCode = 200 | 400 | 401 | 403 | 404 | 409 | 410 | 500;

const getStatusCode = (status: number): HttpStatusCode => {
  const validCodes: HttpStatusCode[] = [200, 400, 401, 403, 404, 409, 410, 500];
  return validCodes.includes(status as HttpStatusCode) ? (status as HttpStatusCode) : 500;
};

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof DomainError) {
      return c.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        getStatusCode(error.status)
      );
    }

    console.error("Unexpected error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "서버 오류가 발생했습니다.",
        },
      },
      500
    );
  }
};
