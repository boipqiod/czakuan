import type { ErrorCodeValue } from "./ErrorCodes";

export class DomainError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(errorCode: ErrorCodeValue, customMessage?: string) {
    super(customMessage ?? errorCode.message);
    this.code = errorCode.code;
    this.status = errorCode.status;
    this.name = "DomainError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
