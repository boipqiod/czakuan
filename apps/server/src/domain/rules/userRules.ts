import type { ValidationResult } from "./types";

// 상수
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_]+$/;

// 닉네임 검증
export function validateNickname(nickname: string): ValidationResult {
  if (!nickname || nickname.trim().length < NICKNAME_MIN_LENGTH) {
    return { valid: false, message: `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상 입력해주세요.` };
  }
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return { valid: false, message: `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.` };
  }
  if (!NICKNAME_PATTERN.test(nickname)) {
    return { valid: false, message: "닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다." };
  }
  return { valid: true };
}

// 관리자 여부
export function isAdmin(role: string): boolean {
  return role === "BOARD_ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}
