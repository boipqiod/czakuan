import type { Post } from "../entities/Post";
import type { UserRole } from "../entities/User";
import type { ValidationResult } from "./types";

// 상수
export const POST_TITLE_MIN_LENGTH = 1;
export const POST_TITLE_MAX_LENGTH = 100;
export const POST_CONTENT_MIN_LENGTH = 1;
export const POST_CONTENT_MAX_LENGTH = 50000;
export const POST_MAX_IMAGES = 20;

// 게시글 검증
export function validatePost(data: { title: string; content: string }): ValidationResult {
  if (!data.title || data.title.trim().length < POST_TITLE_MIN_LENGTH) {
    return { valid: false, message: "제목을 입력해주세요." };
  }
  if (data.title.length > POST_TITLE_MAX_LENGTH) {
    return { valid: false, message: `제목은 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.` };
  }
  if (!data.content || data.content.trim().length < POST_CONTENT_MIN_LENGTH) {
    return { valid: false, message: "내용을 입력해주세요." };
  }
  if (data.content.length > POST_CONTENT_MAX_LENGTH) {
    return { valid: false, message: `내용은 ${POST_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.` };
  }
  return { valid: true };
}

// 권한 체크
export function canEditPost(post: Post, userId: number): boolean {
  return post.userId === userId && post.deletedAt === null;
}

export function canDeletePost(post: Post, userId: number, userRole: UserRole): boolean {
  if (post.deletedAt !== null) return false;
  return post.userId === userId || userRole === "BOARD_ADMIN" || userRole === "SUPER_ADMIN";
}

export function canCreateNotice(userRole: UserRole): boolean {
  return userRole === "BOARD_ADMIN" || userRole === "SUPER_ADMIN";
}

// 미리보기 텍스트 생성
export function getContentPreview(content: string, maxLength = 100): string {
  const textOnly = content.replace(/<[^>]*>/g, "");
  if (textOnly.length <= maxLength) return textOnly;
  return textOnly.slice(0, maxLength) + "...";
}

// 썸네일 추출
export function extractThumbnail(images: string[]): string | null {
  return images.length > 0 ? images[0] : null;
}
