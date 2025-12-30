# Phase 01: BE Domain Layer

> 백엔드 도메인 레이어 - 엔티티, 비즈니스 규칙, Repository 인터페이스, 에러 정의

## 목표

- 핵심 도메인 엔티티 타입 정의
- 비즈니스 규칙 함수 구현
- Repository 인터페이스 정의
- 도메인 에러 정의

## 선행 조건

- Phase 00 완료 (프로젝트 셋업)

## 핵심 원칙

- **외부 의존성 없음**: Domain 레이어는 Prisma, Hono 등 외부 라이브러리에 의존하지 않음
- **순수 TypeScript**: 타입과 순수 함수만 포함
- **테스트 용이성**: 모든 함수는 부작용 없이 테스트 가능

---

## 1. 폴더 구조

```
apps/server/src/domain/
├── entities/
│   ├── User.ts
│   ├── Post.ts
│   ├── Comment.ts
│   ├── Category.ts
│   └── Reaction.ts
├── rules/
│   ├── postRules.ts
│   ├── commentRules.ts
│   ├── userRules.ts
│   └── anonymousRules.ts
├── repositories/
│   ├── UserRepository.ts
│   ├── PostRepository.ts
│   ├── CommentRepository.ts
│   ├── CategoryRepository.ts
│   └── ReactionRepository.ts
└── errors/
    ├── DomainError.ts
    └── ErrorCodes.ts
```

---

## 2. 태스크 체크리스트

### 2.1 Entities

- [ ] `User.ts` - 사용자 엔티티
- [ ] `Post.ts` - 게시글 엔티티
- [ ] `Comment.ts` - 댓글 엔티티
- [ ] `Category.ts` - 카테고리 엔티티 (그룹, 카테고리, 서브카테고리)
- [ ] `Reaction.ts` - 좋아요/싫어요, 신고 엔티티

### 2.2 Rules

- [ ] `postRules.ts` - 게시글 검증 및 권한 규칙
- [ ] `commentRules.ts` - 댓글 검증 및 권한 규칙
- [ ] `userRules.ts` - 사용자 검증 규칙
- [ ] `anonymousRules.ts` - 익명 ID 생성 규칙

### 2.3 Repositories

- [ ] `UserRepository.ts` - 사용자 Repository 인터페이스
- [ ] `PostRepository.ts` - 게시글 Repository 인터페이스
- [ ] `CommentRepository.ts` - 댓글 Repository 인터페이스
- [ ] `CategoryRepository.ts` - 카테고리 Repository 인터페이스
- [ ] `ReactionRepository.ts` - 반응 Repository 인터페이스

### 2.4 Errors

- [ ] `ErrorCodes.ts` - 에러 코드 정의
- [ ] `DomainError.ts` - 도메인 에러 클래스

---

## 3. Entities 상세

### 3.1 User.ts

```typescript
// domain/entities/User.ts

export type UserRole = "USER" | "BOARD_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: number;
  kakaoId: bigint;
  nickname: string;
  email: string | null;
  name: string | null;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserProfile {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: Date;
}
```

### 3.2 Post.ts

```typescript
// domain/entities/Post.ts

import type { UserProfile } from "./User";
import type { Category, SubCategory } from "./Category";

export interface Post {
  id: number;
  title: string;
  content: string;
  images: string[];
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  dislikeCount: number;
  isNotice: boolean;
  isAnonymous: boolean;
  categoryId: number;
  subCategoryId: number | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export interface PostListItem {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  commentCount: number;
  isNotice: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  author: {
    nickname: string;
    profileImageUrl: string | null;
  } | null; // 익명 게시판에서는 null
  anonymousId: string | null; // 익명 게시판에서만
}

export interface PostDetail extends Post {
  author: UserProfile | null;
  anonymousId: string | null;
  category: Category;
  subCategory: SubCategory | null;
  commentCount: number;
  myReaction: {
    liked: boolean;
    disliked: boolean;
  } | null; // 로그인한 사용자만
}

export interface CreatePostInput {
  title: string;
  content: string;
  images: string[];
  categoryId: number;
  subCategoryId?: number;
  isNotice?: boolean;
}
```

### 3.3 Comment.ts

```typescript
// domain/entities/Comment.ts

import type { UserProfile } from "./User";

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  parentId: number | null;
  rootId: number;
  likeCount: number;
  dislikeCount: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CommentListItem {
  id: number;
  content: string;
  parentId: number | null;
  rootId: number;
  likeCount: number;
  dislikeCount: number;
  isPrivate: boolean;
  isDeleted: boolean;
  createdAt: Date;
  author: UserProfile | null;
  anonymousId: string | null;
  parentAnonymousId: string | null; // 대댓글 시 부모 익명 ID
  myReaction: {
    liked: boolean;
    disliked: boolean;
  } | null;
  canView: boolean; // 비공개 댓글 조회 가능 여부
}

export interface CreateCommentInput {
  content: string;
  postId: number;
  parentId?: number;
  isPrivate?: boolean;
}
```

### 3.4 Category.ts

```typescript
// domain/entities/Category.ts

export interface CategoryGroup {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
}

export interface Category {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
  isAnonymous: boolean;
  isPrivateComment: boolean;
  groupId: number;
}

export interface SubCategory {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
  categoryId: number;
}

export interface CategoryWithSubs extends Category {
  subCategories: SubCategory[];
}

export interface CategoryGroupWithCategories extends CategoryGroup {
  categories: CategoryWithSubs[];
}
```

### 3.5 Reaction.ts

```typescript
// domain/entities/Reaction.ts

export type ReactionType = "LIKE" | "DISLIKE";
export type ReportTargetType = "POST" | "COMMENT";

export interface PostReaction {
  userId: number;
  postId: number;
  type: ReactionType;
}

export interface CommentReaction {
  userId: number;
  commentId: number;
  type: ReactionType;
}

export interface Report {
  id: number;
  userId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  createdAt: Date;
}

export interface AnonymousUserInPost {
  userId: number;
  postId: number;
  anonymousId: string;
}
```

---

## 4. Rules 상세

### 4.1 postRules.ts

```typescript
// domain/rules/postRules.ts

import type { Post } from "../entities/Post";
import type { UserRole } from "../entities/User";

// 상수
export const POST_TITLE_MIN_LENGTH = 1;
export const POST_TITLE_MAX_LENGTH = 100;
export const POST_CONTENT_MIN_LENGTH = 1;
export const POST_CONTENT_MAX_LENGTH = 50000;
export const POST_MAX_IMAGES = 20;

// 검증 결과 타입
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

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
  // HTML 태그 제거
  const textOnly = content.replace(/<[^>]*>/g, "");
  if (textOnly.length <= maxLength) return textOnly;
  return textOnly.slice(0, maxLength) + "...";
}

// 썸네일 추출
export function extractThumbnail(images: string[]): string | null {
  return images.length > 0 ? images[0] : null;
}
```

### 4.2 commentRules.ts

```typescript
// domain/rules/commentRules.ts

import type { Comment } from "../entities/Comment";
import type { UserRole } from "../entities/User";

// 상수
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 5000;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

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
```

### 4.3 userRules.ts

```typescript
// domain/rules/userRules.ts

// 상수
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9_]+$/;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

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
```

### 4.4 anonymousRules.ts

```typescript
// domain/rules/anonymousRules.ts

// 익명 ID 생성
export function generateAnonymousId(sequence: number): string {
  return `익명${sequence}`;
}

// 다음 익명 ID 시퀀스 계산
export function getNextAnonymousSequence(existingIds: string[]): number {
  if (existingIds.length === 0) return 1;

  const sequences = existingIds
    .map((id) => {
      const match = id.match(/^익명(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
}

// 익명 게시판 기본 프로필 이미지
export function getAnonymousProfileImage(): string {
  return "/images/anonymous-profile.png";
}
```

---

## 5. Repositories 상세

### 5.1 UserRepository.ts

```typescript
// domain/repositories/UserRepository.ts

import type { User, UserProfile } from "../entities/User";

export interface CreateUserData {
  kakaoId: bigint;
  nickname: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface UpdateUserData {
  nickname?: string;
  profileImageUrl?: string;
}

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByKakaoId(kakaoId: bigint): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  findProfile(id: number): Promise<UserProfile | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: number, data: UpdateUserData): Promise<User>;
  existsByNickname(nickname: string, excludeId?: number): Promise<boolean>;
}
```

### 5.2 PostRepository.ts

```typescript
// domain/repositories/PostRepository.ts

import type { Post, PostListItem, PostDetail, CreatePostInput } from "../entities/Post";

export interface PostListParams {
  categoryId?: number;
  subCategoryId?: number;
  page: number;
  limit: number;
}

export interface PostRepository {
  findById(id: number): Promise<Post | null>;
  findDetail(id: number, userId?: number): Promise<PostDetail | null>;
  findList(params: PostListParams): Promise<PostListItem[]>;
  findNoticeList(categoryId: number): Promise<PostListItem[]>;
  findPopularList(page: number, limit: number): Promise<PostListItem[]>;
  findRecentByCategories(categoryIds: number[], limit: number): Promise<Map<number, PostListItem[]>>;
  findByUserId(userId: number, page: number, limit: number): Promise<PostListItem[]>;
  count(params: { categoryId?: number; subCategoryId?: number }): Promise<number>;
  countByUserId(userId: number): Promise<number>;
  create(userId: number, data: CreatePostInput): Promise<Post>;
  update(id: number, data: Partial<CreatePostInput>): Promise<Post>;
  softDelete(id: number): Promise<void>;
  incrementViews(id: number): Promise<void>;
}
```

### 5.3 CommentRepository.ts

```typescript
// domain/repositories/CommentRepository.ts

import type { Comment, CommentListItem, CreateCommentInput } from "../entities/Comment";

export interface CommentListParams {
  postId: number;
  page: number;
  limit: number;
  userId?: number; // 현재 사용자 (반응 정보용)
}

export interface CommentRepository {
  findById(id: number): Promise<Comment | null>;
  findList(params: CommentListParams): Promise<CommentListItem[]>;
  findByUserId(userId: number, page: number, limit: number): Promise<CommentListItem[]>;
  count(postId: number): Promise<number>;
  countByUserId(userId: number): Promise<number>;
  create(userId: number, data: CreateCommentInput): Promise<Comment>;
  softDelete(id: number): Promise<void>;
  updateRootId(id: number, rootId: number): Promise<void>;
}
```

### 5.4 CategoryRepository.ts

```typescript
// domain/repositories/CategoryRepository.ts

import type {
  Category,
  CategoryGroup,
  SubCategory,
  CategoryWithSubs,
  CategoryGroupWithCategories,
} from "../entities/Category";

export interface CategoryRepository {
  findGroupById(id: number): Promise<CategoryGroup | null>;
  findCategoryById(id: number): Promise<Category | null>;
  findSubCategoryById(id: number): Promise<SubCategory | null>;
  findAllGroups(): Promise<CategoryGroupWithCategories[]>;
  findCategoriesByGroupId(groupId: number): Promise<CategoryWithSubs[]>;
  findSubCategoriesByCategoryId(categoryId: number): Promise<SubCategory[]>;
  findActiveCategories(): Promise<Category[]>;
}
```

### 5.5 ReactionRepository.ts

```typescript
// domain/repositories/ReactionRepository.ts

import type {
  PostReaction,
  CommentReaction,
  Report,
  ReactionType,
  ReportTargetType,
  AnonymousUserInPost,
} from "../entities/Reaction";

export interface ReactionRepository {
  // Post reactions
  findPostReaction(userId: number, postId: number): Promise<PostReaction | null>;
  findPostReactions(userId: number, postId: number): Promise<{ liked: boolean; disliked: boolean }>;
  createPostLike(userId: number, postId: number): Promise<void>;
  deletePostLike(userId: number, postId: number): Promise<void>;
  createPostDislike(userId: number, postId: number): Promise<void>;
  deletePostDislike(userId: number, postId: number): Promise<void>;

  // Comment reactions
  findCommentReaction(userId: number, commentId: number): Promise<CommentReaction | null>;
  findCommentReactions(userId: number, commentId: number): Promise<{ liked: boolean; disliked: boolean }>;
  createCommentLike(userId: number, commentId: number): Promise<void>;
  deleteCommentLike(userId: number, commentId: number): Promise<void>;
  createCommentDislike(userId: number, commentId: number): Promise<void>;
  deleteCommentDislike(userId: number, commentId: number): Promise<void>;

  // Reports
  findReport(userId: number, targetType: ReportTargetType, targetId: number): Promise<Report | null>;
  createReport(userId: number, targetType: ReportTargetType, targetId: number, reason: string): Promise<Report>;
  findReportedPosts(page: number, limit: number): Promise<Report[]>;
  findReportedComments(page: number, limit: number): Promise<Report[]>;

  // Anonymous
  findAnonymousId(userId: number, postId: number): Promise<string | null>;
  findOrCreateAnonymousId(userId: number, postId: number): Promise<string>;
  findAnonymousIdsInPost(postId: number): Promise<AnonymousUserInPost[]>;
}
```

---

## 6. Errors 상세

### 6.1 ErrorCodes.ts

```typescript
// domain/errors/ErrorCodes.ts

export const ErrorCodes = {
  // Auth (1xxx)
  AUTH_INVALID_TOKEN: { code: "AUTH_001", status: 401, message: "유효하지 않은 토큰입니다." },
  AUTH_EXPIRED_TOKEN: { code: "AUTH_002", status: 401, message: "토큰이 만료되었습니다." },
  AUTH_REQUIRED: { code: "AUTH_003", status: 401, message: "로그인이 필요합니다." },
  AUTH_FORBIDDEN: { code: "AUTH_004", status: 403, message: "권한이 없습니다." },
  AUTH_KAKAO_FAILED: { code: "AUTH_005", status: 400, message: "카카오 인증에 실패했습니다." },

  // User (2xxx)
  USER_NOT_FOUND: { code: "USER_001", status: 404, message: "사용자를 찾을 수 없습니다." },
  USER_DUPLICATE_NICKNAME: { code: "USER_002", status: 409, message: "이미 사용 중인 닉네임입니다." },
  USER_INVALID_NICKNAME: { code: "USER_003", status: 400, message: "유효하지 않은 닉네임입니다." },

  // Post (3xxx)
  POST_NOT_FOUND: { code: "POST_001", status: 404, message: "게시글을 찾을 수 없습니다." },
  POST_ALREADY_DELETED: { code: "POST_002", status: 410, message: "이미 삭제된 게시글입니다." },
  POST_FORBIDDEN: { code: "POST_003", status: 403, message: "게시글 권한이 없습니다." },
  POST_INVALID_TITLE: { code: "POST_004", status: 400, message: "유효하지 않은 제목입니다." },
  POST_INVALID_CONTENT: { code: "POST_005", status: 400, message: "유효하지 않은 내용입니다." },

  // Comment (4xxx)
  COMMENT_NOT_FOUND: { code: "CMT_001", status: 404, message: "댓글을 찾을 수 없습니다." },
  COMMENT_ALREADY_DELETED: { code: "CMT_002", status: 410, message: "이미 삭제된 댓글입니다." },
  COMMENT_FORBIDDEN: { code: "CMT_003", status: 403, message: "댓글 권한이 없습니다." },
  COMMENT_INVALID_CONTENT: { code: "CMT_004", status: 400, message: "유효하지 않은 댓글 내용입니다." },

  // Category (5xxx)
  CATEGORY_NOT_FOUND: { code: "CAT_001", status: 404, message: "카테고리를 찾을 수 없습니다." },
  CATEGORY_INACTIVE: { code: "CAT_002", status: 400, message: "비활성화된 카테고리입니다." },

  // Reaction (6xxx)
  ALREADY_REPORTED: { code: "RCT_001", status: 409, message: "이미 신고한 게시글/댓글입니다." },
  CANNOT_REPORT_OWN: { code: "RCT_002", status: 400, message: "본인 글/댓글은 신고할 수 없습니다." },
  REPORT_REASON_REQUIRED: { code: "RCT_003", status: 400, message: "신고 사유를 입력해주세요." },

  // Validation (9xxx)
  VALIDATION_ERROR: { code: "VAL_001", status: 400, message: "입력값이 올바르지 않습니다." },
  INTERNAL_ERROR: { code: "ERR_001", status: 500, message: "서버 오류가 발생했습니다." },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;
export type ErrorCodeValue = (typeof ErrorCodes)[ErrorCodeKey];
```

### 6.2 DomainError.ts

```typescript
// domain/errors/DomainError.ts

import type { ErrorCodeValue } from "./ErrorCodes";

export class DomainError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(errorCode: ErrorCodeValue, customMessage?: string) {
    super(customMessage ?? errorCode.message);
    this.code = errorCode.code;
    this.status = errorCode.status;
    this.name = "DomainError";

    // Error.captureStackTrace가 있으면 사용 (Node.js)
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
```

---

## 7. 검증 체크리스트

- [ ] 모든 Entity 타입이 정의됨
- [ ] 모든 Rule 함수가 순수 함수로 구현됨
- [ ] 모든 Repository 인터페이스가 정의됨
- [ ] 모든 에러 코드가 정의됨
- [ ] 외부 라이브러리 import 없음 (domain 폴더 내)
- [ ] TypeScript 컴파일 에러 없음

---

## 8. 다음 Phase

Phase 01 완료 후 → **Phase 02: BE_INFRASTRUCTURE.md** (Prisma schema, Repository 구현체)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
