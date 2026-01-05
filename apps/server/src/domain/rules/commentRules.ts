import type { Comment } from "../entities/Comment";
import type { UserRole } from "../entities/User";
import type { ValidationResult } from "./types";

// 상수
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 5000;

// 댓글 검증
export function validateComment(content: string): ValidationResult {
  if (!content || content.trim().length < COMMENT_MIN_LENGTH) {
    return { valid: false, message: "댓글 내용을 입력해주세요." };
  }
  if (content.length > COMMENT_MAX_LENGTH) {
    return { valid: false, message: `댓글은 ${COMMENT_MAX_LENGTH}자 이하로 입력해주세요.` };
  }
  return { valid: true };
}

// 권한 체크
export function canDeleteComment(comment: Comment, userId: number, userRole: UserRole): boolean {
  if (comment.deletedAt !== null) return false;
  return comment.userId === userId || userRole === "BOARD_ADMIN" || userRole === "SUPER_ADMIN";
}

// 비공개 댓글 조회 가능 여부
export function canViewPrivateComment(
  comment: Comment,
  userId: number | null,
  postAuthorId: number,
  userRole: UserRole | null
): boolean {
  if (!comment.isPrivate) return true;
  if (!userId) return false;
  if (comment.userId === userId) return true;
  if (postAuthorId === userId) return true;
  if (userRole === "SUPER_ADMIN") return true;
  return false;
}

// 삭제된 댓글 표시 텍스트
export function getDeletedCommentText(): string {
  return "삭제된 댓글입니다.";
}

// 비공개 댓글 표시 텍스트
export function getPrivateCommentText(): string {
  return "비공개 댓글입니다.";
}
