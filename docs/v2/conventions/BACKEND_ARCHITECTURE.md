# Backend Architecture

> 마지막 업데이트: 2025-12-30

## 1. 개요

### 1.1 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | Hono |
| **Language** | TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Auth** | JWT + 카카오 OAuth |

### 1.2 아키텍처 패턴

**Clean Architecture** 기반 레이어드 아키텍처

- 4개 레이어 (Presentation → Application → Domain ← Infrastructure)
- Domain이 핵심, 외부 의존성 없음
- Repository 인터페이스를 통한 의존성 역전

---

## 2. 폴더 구조

```
apps/server/src/
│
├── app/                              # 🚀 App (앱 초기화)
│   ├── index.ts                      # Hono 앱 + 라우트 등록
│   └── config.ts                     # 환경 변수 설정
│
├── presentation/                     # 🎨 Presentation Layer
│   ├── routes/
│   │   ├── AuthRoute.ts
│   │   ├── PostRoute.ts
│   │   ├── CommentRoute.ts
│   │   ├── CategoryRoute.ts
│   │   └── UserRoute.ts
│   ├── middlewares/
│   │   ├── AuthMiddleware.ts
│   │   ├── ErrorMiddleware.ts
│   │   └── LogMiddleware.ts
│   └── dto/
│       ├── post/
│       │   ├── CreatePostRequest.ts
│       │   ├── UpdatePostRequest.ts
│       │   ├── PostResponse.ts
│       │   └── PostListResponse.ts
│       ├── comment/
│       │   ├── CreateCommentRequest.ts
│       │   ├── CommentResponse.ts
│       │   └── CommentListResponse.ts
│       ├── auth/
│       │   ├── KakaoLoginRequest.ts
│       │   └── TokenResponse.ts
│       ├── user/
│       │   ├── UpdateUserRequest.ts
│       │   └── UserResponse.ts
│       ├── category/
│       │   └── CategoryResponse.ts
│       └── common/
│           ├── ApiResponse.ts
│           └── PaginationResponse.ts
│
├── application/                      # ⚙️ Application Layer
│   ├── post/
│   │   ├── PostService.ts
│   │   └── dto/
│   │       ├── CreatePostDto.ts
│   │       └── UpdatePostDto.ts
│   ├── comment/
│   │   ├── CommentService.ts
│   │   └── dto/
│   │       └── CreateCommentDto.ts
│   ├── auth/
│   │   ├── AuthService.ts
│   │   └── dto/
│   │       └── KakaoLoginDto.ts
│   ├── category/
│   │   └── CategoryService.ts
│   ├── user/
│   │   ├── UserService.ts
│   │   └── dto/
│   │       └── UpdateUserDto.ts
│   └── common/
│       └── AnonymousService.ts
│
├── domain/                           # 📦 Domain Layer
│   ├── entities/
│   │   ├── Post.ts
│   │   ├── Comment.ts
│   │   ├── User.ts
│   │   ├── Category.ts
│   │   └── Reaction.ts
│   ├── rules/
│   │   ├── postRules.ts
│   │   ├── commentRules.ts
│   │   └── userRules.ts
│   ├── repositories/
│   │   ├── PostRepository.ts
│   │   ├── CommentRepository.ts
│   │   ├── UserRepository.ts
│   │   ├── CategoryRepository.ts
│   │   └── ReactionRepository.ts
│   └── errors/
│       ├── DomainError.ts
│       └── ErrorCodes.ts
│
├── infrastructure/                   # 🔌 Infrastructure Layer
│   ├── repositories/
│   │   ├── PostRepositoryImpl.ts
│   │   ├── CommentRepositoryImpl.ts
│   │   ├── UserRepositoryImpl.ts
│   │   ├── CategoryRepositoryImpl.ts
│   │   └── ReactionRepositoryImpl.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── auth/
│   │   └── JwtProvider.ts
│   └── kakao/
│       └── KakaoClient.ts
│
└── common/                           # 🧩 Common
    ├── utils/
    │   ├── hashUtils.ts
    │   └── dateUtils.ts
    ├── helpers/
    │   └── responseHelper.ts
    └── constants/
        └── constants.ts
```

---

## 3. 레이어 설명

### 3.1 Presentation Layer

HTTP 요청/응답 처리. Route, Middleware, DTO 포함.

| 폴더 | 역할 |
|------|------|
| `routes/` | HTTP 엔드포인트 정의, Service 호출 |
| `middlewares/` | 인증, 에러 핸들링, 로깅 |
| `dto/` | Request/Response 타입 정의 |

```typescript
// presentation/routes/PostRoute.ts
import { Hono } from "hono";
import { authMiddleware } from "@/presentation/middlewares/AuthMiddleware";
import { PostService } from "@/application/post/PostService";
import { successResponse } from "@/common/helpers/responseHelper";
import type { CreatePostRequest } from "@/presentation/dto/post/CreatePostRequest";

export function createPostRoute() {
  const route = new Hono();
  const postService = new PostService();

  // GET /posts
  route.get("/", async (c) => {
    const categoryId = Number(c.req.query("categoryId"));
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 20;

    const result = await postService.getPostList({ categoryId, page, limit });

    return c.json(successResponse(result));
  });

  // POST /posts
  route.post("/", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json<CreatePostRequest>();

    const result = await postService.createPost({ userId, ...body });

    return c.json(successResponse(result));
  });

  return route;
}
```

### 3.2 Application Layer

비즈니스 로직 오케스트레이션. 도메인별 Service 클래스.

| 폴더 | 역할 |
|------|------|
| `{domain}/` | 도메인별 서비스 및 DTO |
| `{domain}/dto/` | Application 레이어 DTO (선택) |
| `common/` | 여러 Service에서 공유하는 로직 |

```typescript
// application/post/PostService.ts
import type { PostRepository } from "@/domain/repositories/PostRepository";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import { validatePost } from "@/domain/rules/postRules";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";

interface CreatePostInput {
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  subCategoryId?: number;
}

interface CreatePostOutput {
  id: number;
}

export class PostService {
  private postRepository: PostRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.postRepository = new PostRepositoryImpl();
    this.categoryRepository = new CategoryRepositoryImpl();
  }

  async createPost(input: CreatePostInput): Promise<CreatePostOutput> {
    // 1. 유효성 검사
    const validation = validatePost({ title: input.title, content: input.content });
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.VALIDATION_ERROR, validation.message);
    }

    // 2. 카테고리 확인
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category || !category.isActive) {
      throw new DomainError(ErrorCodes.CATEGORY_NOT_FOUND);
    }

    // 3. 생성
    const post = await this.postRepository.create({
      title: input.title,
      content: input.content,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      userId: input.userId,
    });

    return { id: post.id };
  }

  async getPostList(params: { categoryId: number; page: number; limit: number }) {
    const [posts, total] = await Promise.all([
      this.postRepository.findMany(params),
      this.postRepository.count({ categoryId: params.categoryId }),
    ]);

    return { posts, total, page: params.page, limit: params.limit };
  }

  async getPostDetail(id: number) {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    await this.postRepository.incrementViews(id);
    return post;
  }
}
```

### 3.3 Domain Layer

비즈니스 핵심 로직. **외부 의존성 없음**.

| 폴더 | 역할 |
|------|------|
| `entities/` | 도메인 엔티티 타입 정의 |
| `rules/` | 비즈니스 규칙 (검증, 판단 로직) |
| `repositories/` | Repository 인터페이스 (추상화) |
| `errors/` | 도메인 에러 정의 |

```typescript
// domain/entities/Post.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  views: number;
  likeCount: number;
  dislikeCount: number;
  isNotice: boolean;
  categoryId: number;
  subCategoryId: number | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}
```

```typescript
// domain/rules/postRules.ts
export const POST_TITLE_MIN_LENGTH = 1;
export const POST_TITLE_MAX_LENGTH = 100;
export const POST_CONTENT_MIN_LENGTH = 1;
export const POST_CONTENT_MAX_LENGTH = 10000;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePost(data: { title: string; content: string }): ValidationResult {
  if (data.title.length < POST_TITLE_MIN_LENGTH) {
    return { valid: false, message: "제목을 입력해주세요." };
  }
  if (data.title.length > POST_TITLE_MAX_LENGTH) {
    return { valid: false, message: `제목은 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.` };
  }
  if (data.content.length < POST_CONTENT_MIN_LENGTH) {
    return { valid: false, message: "내용을 입력해주세요." };
  }
  if (data.content.length > POST_CONTENT_MAX_LENGTH) {
    return { valid: false, message: `내용은 ${POST_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.` };
  }
  return { valid: true };
}

export function isEditable(postUserId: number, currentUserId: number): boolean {
  return postUserId === currentUserId;
}

export function isDeletable(postUserId: number, currentUserId: number, isAdmin: boolean): boolean {
  return postUserId === currentUserId || isAdmin;
}
```

```typescript
// domain/repositories/PostRepository.ts
import type { Post } from "@/domain/entities/Post";

export interface CreatePostData {
  title: string;
  content: string;
  categoryId: number;
  subCategoryId?: number;
  userId: number;
}

export interface PostRepository {
  findById(id: number): Promise<Post | null>;
  findMany(params: { categoryId: number; page: number; limit: number }): Promise<Post[]>;
  count(params: { categoryId: number }): Promise<number>;
  create(data: CreatePostData): Promise<Post>;
  update(id: number, data: Partial<{ title: string; content: string }>): Promise<Post>;
  softDelete(id: number): Promise<void>;
  incrementViews(id: number): Promise<void>;
}
```

### 3.4 Infrastructure Layer

외부 시스템 연동. Domain 인터페이스의 구현체.

| 폴더 | 역할 |
|------|------|
| `repositories/` | Repository 구현체 (`~Impl.ts`) |
| `db/` | Prisma 클라이언트 |
| `auth/` | JWT 처리 |
| `kakao/` | 카카오 API 클라이언트 |

```typescript
// infrastructure/repositories/PostRepositoryImpl.ts
import { prisma } from "@/infrastructure/db/prisma";
import type { PostRepository, CreatePostData } from "@/domain/repositories/PostRepository";
import type { Post } from "@/domain/entities/Post";

export class PostRepositoryImpl implements PostRepository {
  async findById(id: number): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: { id: true, nickname: true, profileImageUrl: true },
        },
        category: true,
        subCategory: true,
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async findMany(params: { categoryId: number; page: number; limit: number }): Promise<Post[]> {
    const { categoryId, page, limit } = params;

    return prisma.post.findMany({
      where: { categoryId, deletedAt: null },
      include: {
        user: {
          select: { id: true, nickname: true, profileImageUrl: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: [{ isNotice: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(params: { categoryId: number }): Promise<number> {
    return prisma.post.count({
      where: { categoryId: params.categoryId, deletedAt: null },
    });
  }

  async create(data: CreatePostData): Promise<Post> {
    return prisma.post.create({ data });
  }

  async update(id: number, data: Partial<{ title: string; content: string }>): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async incrementViews(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }
}
```

### 3.5 Common

공용 유틸리티. 모든 레이어에서 사용 가능.

```typescript
// common/helpers/responseHelper.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(code: string, message: string): ApiResponse<null> {
  return {
    success: false,
    error: { code, message },
  };
}
```

---

## 4. 레이어 의존성 규칙

```
┌─────────────────────────────────────────────────────┐
│  presentation                                       │
│    ↓                                                │
├─────────────────────────────────────────────────────┤
│  application                                        │
│    ↓                                                │
├─────────────────────────────────────────────────────┤
│  domain  ←──────────────────────────────────────────│ (핵심, 의존성 없음)
│    ↑                                                │
├─────────────────────────────────────────────────────┤
│  infrastructure (domain 인터페이스 구현)             │
├─────────────────────────────────────────────────────┤
│  common  ←──────────────────────────────────────────│ (어디서든 사용)
└─────────────────────────────────────────────────────┘
```

### 규칙

1. **Presentation → Application → Domain** 방향으로만 의존
2. **Domain은 다른 레이어에 의존하지 않음** (핵심)
3. **Infrastructure는 Domain의 인터페이스를 구현** (의존성 역전)
4. **Common은 어디서든 사용 가능**
5. **순환 의존성 금지**

---

## 5. 네이밍 컨벤션

### 5.1 파일명

| 레이어 | 패턴 | 예시 |
|--------|------|------|
| Route | `{Domain}Route.ts` | `PostRoute.ts`, `AuthRoute.ts` |
| Middleware | `{Name}Middleware.ts` | `AuthMiddleware.ts`, `ErrorMiddleware.ts` |
| DTO Request | `{Action}{Domain}Request.ts` | `CreatePostRequest.ts`, `UpdateUserRequest.ts` |
| DTO Response | `{Domain}Response.ts` | `PostResponse.ts`, `PostListResponse.ts` |
| Service | `{Domain}Service.ts` | `PostService.ts`, `AuthService.ts` |
| Entity | `{Domain}.ts` | `Post.ts`, `User.ts` |
| Rules | `{domain}Rules.ts` | `postRules.ts`, `userRules.ts` |
| Repository (인터페이스) | `{Domain}Repository.ts` | `PostRepository.ts` |
| Repository (구현체) | `{Domain}RepositoryImpl.ts` | `PostRepositoryImpl.ts` |
| Provider | `{Name}Provider.ts` | `JwtProvider.ts` |
| Client | `{Name}Client.ts` | `KakaoClient.ts` |

### 5.2 클래스/인터페이스명

| 구분 | 패턴 | 예시 |
|------|------|------|
| Route 함수 | `create{Domain}Route` | `createPostRoute()` |
| Middleware 함수 | `{name}Middleware` | `authMiddleware` |
| Service 클래스 | `{Domain}Service` | `PostService`, `AuthService` |
| Repository 인터페이스 | `{Domain}Repository` | `PostRepository` |
| Repository 구현체 | `{Domain}RepositoryImpl` | `PostRepositoryImpl` |
| Provider 클래스 | `{Name}Provider` | `JwtProvider` |
| Client 클래스 | `{Name}Client` | `KakaoClient` |

### 5.3 DTO 타입명

| 용도 | 패턴 | 예시 |
|------|------|------|
| 생성 요청 | `Create{Domain}Request` | `CreatePostRequest` |
| 수정 요청 | `Update{Domain}Request` | `UpdatePostRequest` |
| 단일 응답 | `{Domain}Response` | `PostResponse` |
| 목록 응답 | `{Domain}ListResponse` | `PostListResponse` |
| 상세 응답 | `{Domain}DetailResponse` | `PostDetailResponse` |

### 5.4 Domain Rules 함수명

| 용도 | 패턴 | 예시 |
|------|------|------|
| 유효성 검사 | `validate{Domain}` | `validatePost()`, `validateComment()` |
| 조건 판단 | `is{Condition}` | `isEditable()`, `isDeletable()` |
| 값 계산 | `get{Value}` | `getPreview()`, `getAnonymousId()` |

### 5.5 추상화 규칙

**추상화 O (인터페이스 + 구현체)**
| 종류 | 인터페이스 | 구현체 | 이유 |
|------|------------|--------|------|
| Repository | `PostRepository` | `PostRepositoryImpl` | DB 교체 가능성 |
| Provider | `JwtProvider` | `JwtProviderImpl` | 라이브러리 교체 가능성 |
| Client | `KakaoClient` | `KakaoClientImpl` | 외부 API 모킹 |

**추상화 X (직접 구현)**
| 종류 | 파일명 | 이유 |
|------|--------|------|
| Service | `PostService.ts` | 비즈니스 로직, 교체 불필요 |
| Utils | `hashUtils.ts` | 순수 함수, 테스트 용이 |
| DTO | `CreatePostRequest.ts` | 단순 타입 정의 |
| Rules | `postRules.ts` | 순수 함수, 의존성 없음 |

---

## 6. 에러 처리

### 6.1 에러 코드 정의

```typescript
// domain/errors/ErrorCodes.ts
export const ErrorCodes = {
  // Auth
  AUTH_INVALID_TOKEN: { code: "AUTH_INVALID_TOKEN", message: "유효하지 않은 토큰입니다." },
  AUTH_EXPIRED_TOKEN: { code: "AUTH_EXPIRED_TOKEN", message: "토큰이 만료되었습니다." },
  AUTH_USER_NOT_FOUND: { code: "AUTH_USER_NOT_FOUND", message: "사용자를 찾을 수 없습니다." },
  AUTH_KAKAO_FAILED: { code: "AUTH_KAKAO_FAILED", message: "카카오 인증에 실패했습니다." },

  // Post
  POST_NOT_FOUND: { code: "POST_NOT_FOUND", message: "게시글을 찾을 수 없습니다." },
  POST_NO_PERMISSION: { code: "POST_NO_PERMISSION", message: "권한이 없습니다." },
  POST_ALREADY_DELETED: { code: "POST_ALREADY_DELETED", message: "이미 삭제된 게시글입니다." },

  // Comment
  COMMENT_NOT_FOUND: { code: "COMMENT_NOT_FOUND", message: "댓글을 찾을 수 없습니다." },
  COMMENT_NO_PERMISSION: { code: "COMMENT_NO_PERMISSION", message: "권한이 없습니다." },
  COMMENT_ALREADY_DELETED: { code: "COMMENT_ALREADY_DELETED", message: "이미 삭제된 댓글입니다." },

  // Category
  CATEGORY_NOT_FOUND: { code: "CATEGORY_NOT_FOUND", message: "카테고리를 찾을 수 없습니다." },
  CATEGORY_INACTIVE: { code: "CATEGORY_INACTIVE", message: "비활성화된 카테고리입니다." },

  // User
  USER_NOT_FOUND: { code: "USER_NOT_FOUND", message: "사용자를 찾을 수 없습니다." },
  DUPLICATE_NICKNAME: { code: "DUPLICATE_NICKNAME", message: "이미 사용 중인 닉네임입니다." },

  // Common
  VALIDATION_ERROR: { code: "VALIDATION_ERROR", message: "입력값이 올바르지 않습니다." },
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
```

### 6.2 DomainError 클래스

```typescript
// domain/errors/DomainError.ts
import { ErrorCodes, type ErrorCode } from "./ErrorCodes";

export class DomainError extends Error {
  public code: string;
  public statusCode: number;

  constructor(errorCode: (typeof ErrorCodes)[ErrorCode], customMessage?: string) {
    super(customMessage ?? errorCode.message);
    this.code = errorCode.code;
    this.statusCode = 200; // 비즈니스 에러는 200
  }
}
```

### 6.3 Error Middleware

```typescript
// presentation/middlewares/ErrorMiddleware.ts
import type { Context, Next } from "hono";
import { DomainError } from "@/domain/errors/DomainError";
import { errorResponse } from "@/common/helpers/responseHelper";

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    if (error instanceof DomainError) {
      return c.json(errorResponse(error.code, error.message), error.statusCode);
    }

    console.error("Unexpected error:", error);
    return c.json(errorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다."), 500);
  }
}
```

---

## 7. 인증 처리

### 7.1 JWT Provider

```typescript
// infrastructure/auth/JwtProvider.ts
import { sign, verify } from "hono/jwt";
import { config } from "@/app/config";

export interface TokenPayload {
  userId: number;
  role: string;
}

export class JwtProvider {
  private readonly secret: string;
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;

  constructor() {
    this.secret = config.JWT_SECRET;
    this.accessTokenExpiry = 60 * 60; // 1시간
    this.refreshTokenExpiry = 60 * 60 * 24 * 14; // 14일
  }

  async createAccessToken(payload: TokenPayload): Promise<string> {
    return sign(
      { ...payload, exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry },
      this.secret
    );
  }

  async createRefreshToken(payload: TokenPayload): Promise<string> {
    return sign(
      { ...payload, exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry },
      this.secret
    );
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return verify(token, this.secret) as Promise<TokenPayload>;
  }
}
```

### 7.2 Auth Middleware

```typescript
// presentation/middlewares/AuthMiddleware.ts
import type { Context, Next } from "hono";
import { JwtProvider } from "@/infrastructure/auth/JwtProvider";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";

const jwtProvider = new JwtProvider();

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new DomainError(ErrorCodes.AUTH_INVALID_TOKEN);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await jwtProvider.verifyToken(token);
    c.set("userId", payload.userId);
    c.set("userRole", payload.role);
    await next();
  } catch (error) {
    throw new DomainError(ErrorCodes.AUTH_EXPIRED_TOKEN);
  }
}

// Optional auth (userId가 있을 수도 없을 수도)
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = await jwtProvider.verifyToken(token);
      c.set("userId", payload.userId);
      c.set("userRole", payload.role);
    } catch {
      // 토큰이 유효하지 않아도 통과 (optional)
    }
  }

  await next();
}
```

---

## 8. Import 별칭

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 사용 예시

```typescript
// ❌ 상대 경로
import { PostRepository } from "../../../infrastructure/repositories/PostRepository";

// ✅ 별칭
import { PostRepository } from "@/infrastructure/repositories/PostRepository";
```

---

## 9. 병렬 작업 가이드

### 9.1 작업 단위

| 담당 | 작업 범위 |
|------|-----------|
| A | `domain/` + `infrastructure/repositories/` |
| B | `application/auth/` + `application/user/` |
| C | `application/post/` |
| D | `application/comment/` + `application/category/` |
| E | `presentation/routes/` + `presentation/dto/` |

### 9.2 선행 작업

1. `domain/entities/` - 엔티티 타입 정의
2. `domain/repositories/` - Repository 인터페이스
3. `domain/errors/` - 에러 코드
4. `common/` - 공용 유틸

### 9.3 충돌 방지

- 각자 담당 폴더에서만 작업
- `domain/` 수정 시 PR 리뷰 필수
- 직접 import 사용 (barrel export 금지)

---

## 10. 파일 생성 체크리스트

### 새 도메인 추가 시

```
domain/
├── entities/{Domain}.ts
├── rules/{domain}Rules.ts
└── repositories/{Domain}Repository.ts

infrastructure/repositories/{Domain}RepositoryImpl.ts

application/{domain}/
├── {Domain}Service.ts
└── dto/
    └── Create{Domain}Dto.ts (선택)

presentation/
├── routes/{Domain}Route.ts
└── dto/{domain}/
    ├── Create{Domain}Request.ts
    ├── Update{Domain}Request.ts
    └── {Domain}Response.ts
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
| 1.1 | 2025-12-30 | UseCase → Service 패턴, Impl suffix, barrel export 제거 |
