# Phase 06: FE Entities

> 타입 정의 및 비즈니스 규칙

## 목표

- 프론트엔드 엔티티 타입 정의
- 클라이언트 사이드 비즈니스 규칙 구현
- API 응답 타입 정의

## 선행 조건

- Phase 05 (FE Setup) 완료

---

## 1. 폴더 구조

```
apps/web/src/entities/
├── user/
│   ├── types.ts
│   └── rules.ts
│
├── post/
│   ├── types.ts
│   └── rules.ts
│
├── comment/
│   ├── types.ts
│   └── rules.ts
│
├── category/
│   └── types.ts
│
└── reaction/
    └── types.ts
```

---

## 2. 태스크 체크리스트

### 2.1 User

- [ ] `entities/user/types.ts`
- [ ] `entities/user/rules.ts`

### 2.2 Post

- [ ] `entities/post/types.ts`
- [ ] `entities/post/rules.ts`

### 2.3 Comment

- [ ] `entities/comment/types.ts`
- [ ] `entities/comment/rules.ts`

### 2.4 Category

- [ ] `entities/category/types.ts`

### 2.5 Reaction

- [ ] `entities/reaction/types.ts`

---

## 3. User Entity

### 3.1 entities/user/types.ts

```typescript
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  kakaoId: string;
  nickname: string;
  profileImage: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  profileImage: string | null;
  role: UserRole;
  postCount: number;
  commentCount: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}

// 익명 사용자 표시용
export interface AnonymousAuthor {
  anonymousId: string;
  isPostAuthor: boolean;
}

// 게시글/댓글의 작성자 (실명 또는 익명)
export type Author =
  | {
      type: "user";
      id: string;
      nickname: string;
      profileImage: string | null;
    }
  | {
      type: "anonymous";
      anonymousId: string;
      isPostAuthor: boolean;
    };
```

### 3.2 entities/user/rules.ts

```typescript
export const userRules = {
  nickname: {
    minLength: 2,
    maxLength: 20,
    pattern: /^[가-힣a-zA-Z0-9_]+$/,
  },
} as const;

export function validateNickname(nickname: string): {
  valid: boolean;
  error?: string;
} {
  const { minLength, maxLength, pattern } = userRules.nickname;

  if (nickname.length < minLength) {
    return {
      valid: false,
      error: `닉네임은 최소 ${minLength}자 이상이어야 합니다.`,
    };
  }

  if (nickname.length > maxLength) {
    return {
      valid: false,
      error: `닉네임은 최대 ${maxLength}자까지 가능합니다.`,
    };
  }

  if (!pattern.test(nickname)) {
    return {
      valid: false,
      error: "닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.",
    };
  }

  return { valid: true };
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}
```

---

## 4. Post Entity

### 4.1 entities/post/types.ts

```typescript
import { Author } from "@/entities/user/types";
import { Category } from "@/entities/category/types";
import { ReactionCounts, ReactionType } from "@/entities/reaction/types";

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  category: Category;
  isAnonymous: boolean;
  viewCount: number;
  reactions: ReactionCounts;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetail extends Post {
  myReaction: ReactionType | null;
  isAuthor: boolean;
}

export interface PostListItem {
  id: string;
  title: string;
  content: string; // 미리보기용 (truncated)
  author: Author;
  category: Pick<Category, "id" | "name">;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface CreatePostData {
  categoryId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
}

export interface PostListQuery {
  categoryId?: string;
  page?: number;
  limit?: number;
  search?: string;
}
```

### 4.2 entities/post/rules.ts

```typescript
export const postRules = {
  title: {
    minLength: 2,
    maxLength: 100,
  },
  content: {
    minLength: 10,
    maxLength: 5000,
  },
} as const;

export function validatePostTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  const { minLength, maxLength } = postRules.title;

  if (title.trim().length < minLength) {
    return {
      valid: false,
      error: `제목은 최소 ${minLength}자 이상이어야 합니다.`,
    };
  }

  if (title.length > maxLength) {
    return {
      valid: false,
      error: `제목은 최대 ${maxLength}자까지 가능합니다.`,
    };
  }

  return { valid: true };
}

export function validatePostContent(content: string): {
  valid: boolean;
  error?: string;
} {
  const { minLength, maxLength } = postRules.content;

  if (content.trim().length < minLength) {
    return {
      valid: false,
      error: `내용은 최소 ${minLength}자 이상이어야 합니다.`,
    };
  }

  if (content.length > maxLength) {
    return {
      valid: false,
      error: `내용은 최대 ${maxLength}자까지 가능합니다.`,
    };
  }

  return { valid: true };
}

export function validatePost(data: { title: string; content: string }): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const titleResult = validatePostTitle(data.title);
  if (!titleResult.valid && titleResult.error) {
    errors.title = titleResult.error;
  }

  const contentResult = validatePostContent(data.content);
  if (!contentResult.valid && contentResult.error) {
    errors.content = contentResult.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getContentPreview(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength).trim() + "...";
}

export function canEditPost(isAuthor: boolean): boolean {
  return isAuthor;
}

export function canDeletePost(isAuthor: boolean, isAdmin: boolean): boolean {
  return isAuthor || isAdmin;
}
```

---

## 5. Comment Entity

### 5.1 entities/comment/types.ts

```typescript
import { Author } from "@/entities/user/types";

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: Author;
  isAnonymous: boolean;
  isPrivate: boolean;
  likeCount: number;
  parentId: string | null;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithMeta extends Comment {
  myReaction: "LIKE" | null;
  isAuthor: boolean;
  isPostAuthor: boolean;
  canView: boolean; // 비밀 댓글 조회 권한
}

export interface CreateCommentData {
  content: string;
  isAnonymous: boolean;
  isPrivate: boolean;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}
```

### 5.2 entities/comment/rules.ts

```typescript
export const commentRules = {
  content: {
    minLength: 1,
    maxLength: 1000,
  },
} as const;

export function validateCommentContent(content: string): {
  valid: boolean;
  error?: string;
} {
  const { minLength, maxLength } = commentRules.content;

  if (content.trim().length < minLength) {
    return {
      valid: false,
      error: "댓글 내용을 입력해주세요.",
    };
  }

  if (content.length > maxLength) {
    return {
      valid: false,
      error: `댓글은 최대 ${maxLength}자까지 가능합니다.`,
    };
  }

  return { valid: true };
}

export function canEditComment(isAuthor: boolean): boolean {
  return isAuthor;
}

export function canDeleteComment(isAuthor: boolean, isAdmin: boolean): boolean {
  return isAuthor || isAdmin;
}

export function canViewPrivateComment(
  isAuthor: boolean,
  isPostAuthor: boolean,
  isAdmin: boolean
): boolean {
  return isAuthor || isPostAuthor || isAdmin;
}

export function getPrivateCommentPlaceholder(): string {
  return "비밀 댓글입니다.";
}
```

---

## 6. Category Entity

### 6.1 entities/category/types.ts

```typescript
export interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
  createdAt: string;
}

export interface CategoryListItem {
  id: string;
  name: string;
  postCount: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}
```

---

## 7. Reaction Entity

### 7.1 entities/reaction/types.ts

```typescript
export type ReactionType = "LIKE" | "DISLIKE";

export interface ReactionCounts {
  likeCount: number;
  dislikeCount: number;
}

export interface ReactionResult {
  type: ReactionType | null;
  counts: ReactionCounts;
}

export interface CommentReactionResult {
  type: "LIKE" | null;
  likeCount: number;
}

export function toggleReaction(
  currentType: ReactionType | null,
  newType: ReactionType
): ReactionType | null {
  // 같은 리액션 클릭 시 취소
  if (currentType === newType) {
    return null;
  }

  // 다른 리액션 클릭 시 변경
  return newType;
}
```

---

## 8. API 응답 타입

### 8.1 entities/api/types.ts

```typescript
// 공통 API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
}

// 에러 코드 상수
export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_TOKEN: "INVALID_TOKEN",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Resource
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  POST_NOT_FOUND: "POST_NOT_FOUND",
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",

  // Business
  ALREADY_REPORTED: "ALREADY_REPORTED",
  DUPLICATE_REACTION: "DUPLICATE_REACTION",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// 에러 메시지 매핑
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UNAUTHORIZED]: "로그인이 필요합니다.",
  [ERROR_CODES.INVALID_TOKEN]: "세션이 만료되었습니다. 다시 로그인해주세요.",
  [ERROR_CODES.FORBIDDEN]: "권한이 없습니다.",
  [ERROR_CODES.NOT_FOUND]: "요청한 리소스를 찾을 수 없습니다.",
  [ERROR_CODES.USER_NOT_FOUND]: "사용자를 찾을 수 없습니다.",
  [ERROR_CODES.POST_NOT_FOUND]: "게시글을 찾을 수 없습니다.",
  [ERROR_CODES.COMMENT_NOT_FOUND]: "댓글을 찾을 수 없습니다.",
  [ERROR_CODES.CATEGORY_NOT_FOUND]: "카테고리를 찾을 수 없습니다.",
  [ERROR_CODES.ALREADY_REPORTED]: "이미 신고한 게시글입니다.",
  [ERROR_CODES.INTERNAL_ERROR]: "서버 오류가 발생했습니다.",
};

export function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] || fallback || "오류가 발생했습니다.";
}
```

---

## 9. 타입 가드 및 유틸리티

### 9.1 entities/utils/typeGuards.ts

```typescript
import { Author } from "@/entities/user/types";

export function isAnonymousAuthor(
  author: Author
): author is Author & { type: "anonymous" } {
  return author.type === "anonymous";
}

export function isUserAuthor(
  author: Author
): author is Author & { type: "user" } {
  return author.type === "user";
}

export function getAuthorDisplayName(author: Author): string {
  if (isAnonymousAuthor(author)) {
    return `익명${author.anonymousId}`;
  }

  return author.nickname;
}

export function getAuthorProfileImage(author: Author): string | null {
  if (isUserAuthor(author)) {
    return author.profileImage;
  }

  return null;
}
```

---

## 10. 검증 체크리스트

- [ ] `entities/user/types.ts` 생성
- [ ] `entities/user/rules.ts` 생성
- [ ] `entities/post/types.ts` 생성
- [ ] `entities/post/rules.ts` 생성
- [ ] `entities/comment/types.ts` 생성
- [ ] `entities/comment/rules.ts` 생성
- [ ] `entities/category/types.ts` 생성
- [ ] `entities/reaction/types.ts` 생성
- [ ] `entities/api/types.ts` 생성
- [ ] `entities/utils/typeGuards.ts` 생성
- [ ] TypeScript 컴파일 에러 없음

---

## 11. 다음 Phase

Phase 06 완료 후 → **Phase 07: FE_FEATURES_AUTH.md** (인증 관련 기능 구현)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
