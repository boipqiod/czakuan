# Phase 04: BE Presentation Layer

> Hono 라우트, 미들웨어, API 엔드포인트 구현

## 목표

- Hono 라우트 구성
- 인증, 에러 처리, 로깅 미들웨어
- Request/Response DTO 검증 (Zod)
- RESTful API 엔드포인트 구현

## 선행 조건

- Phase 03 (Application Layer) 완료
- 모든 Service 클래스 구현 완료

---

## 1. 폴더 구조

```
apps/server/src/
├── presentation/
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   └── logMiddleware.ts
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── postRoutes.ts
│   │   ├── commentRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   └── userRoutes.ts
│   │
│   └── dto/
│       ├── request/
│       │   ├── authRequest.ts
│       │   ├── postRequest.ts
│       │   ├── commentRequest.ts
│       │   └── userRequest.ts
│       │
│       └── response/
│           ├── apiResponse.ts
│           └── errorResponse.ts
│
└── app/
    └── index.ts
```

---

## 2. 태스크 체크리스트

### 2.1 미들웨어

- [ ] `authMiddleware.ts` - JWT 인증 미들웨어
- [ ] `errorMiddleware.ts` - 전역 에러 핸들러
- [ ] `logMiddleware.ts` - 요청/응답 로깅

### 2.2 Request DTOs

- [ ] `authRequest.ts` - 인증 관련 요청 스키마
- [ ] `postRequest.ts` - 게시글 관련 요청 스키마
- [ ] `commentRequest.ts` - 댓글 관련 요청 스키마
- [ ] `userRequest.ts` - 사용자 관련 요청 스키마

### 2.3 Response DTOs

- [ ] `apiResponse.ts` - 공통 응답 형식
- [ ] `errorResponse.ts` - 에러 응답 형식

### 2.4 라우트

- [ ] `authRoutes.ts` - 인증 API
- [ ] `postRoutes.ts` - 게시글 API
- [ ] `commentRoutes.ts` - 댓글 API
- [ ] `categoryRoutes.ts` - 카테고리 API
- [ ] `userRoutes.ts` - 사용자 API

### 2.5 앱 설정

- [ ] `app/index.ts` - 라우트 통합 및 서버 실행

---

## 3. 미들웨어 구현

### 3.1 presentation/middleware/authMiddleware.ts

```typescript
import { Context, Next } from "hono";
import { JwtProvider } from "@/infrastructure/auth/JwtProvider";
import { UserRepositoryImpl } from "@/infrastructure/persistence/UserRepositoryImpl";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const jwtProvider = new JwtProvider();
const userRepository = new UserRepositoryImpl(prisma);

export type AuthContext = {
  Variables: {
    userId: string;
    user: {
      id: string;
      nickname: string;
      role: string;
    };
  };
};

export async function authMiddleware(c: Context<AuthContext>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "인증 토큰이 필요합니다.",
        },
      },
      401
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwtProvider.verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "사용자를 찾을 수 없습니다.",
          },
        },
        401
      );
    }

    c.set("userId", user.id);
    c.set("user", {
      id: user.id,
      nickname: user.nickname,
      role: user.role,
    });

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "유효하지 않은 토큰입니다.",
        },
      },
      401
    );
  }
}

// 선택적 인증 미들웨어 (로그인 안해도 접근 가능)
export async function optionalAuthMiddleware(c: Context<AuthContext>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const payload = jwtProvider.verifyAccessToken(token);
      const user = await userRepository.findById(payload.userId);

      if (user) {
        c.set("userId", user.id);
        c.set("user", {
          id: user.id,
          nickname: user.nickname,
          role: user.role,
        });
      }
    } catch {
      // 토큰이 유효하지 않아도 계속 진행
    }
  }

  await next();
}

// 관리자 전용 미들웨어
export async function adminMiddleware(c: Context<AuthContext>, next: Next) {
  const user = c.get("user");

  if (!user || user.role !== "ADMIN") {
    return c.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "관리자 권한이 필요합니다.",
        },
      },
      403
    );
  }

  await next();
}
```

### 3.2 presentation/middleware/errorMiddleware.ts

```typescript
import { Context, Next } from "hono";
import { ZodError } from "zod";
import { DomainError } from "@/domain/errors/DomainError";

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error("[Error]", error);

    // Zod 검증 에러
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "입력값이 올바르지 않습니다.",
            details: messages,
          },
        },
        400
      );
    }

    // 도메인 에러
    if (error instanceof DomainError) {
      const statusMap: Record<string, number> = {
        USER_NOT_FOUND: 404,
        POST_NOT_FOUND: 404,
        COMMENT_NOT_FOUND: 404,
        CATEGORY_NOT_FOUND: 404,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        DUPLICATE_REACTION: 400,
        INVALID_CREDENTIALS: 401,
        CONTENT_TOO_SHORT: 400,
        CONTENT_TOO_LONG: 400,
        TITLE_TOO_SHORT: 400,
        TITLE_TOO_LONG: 400,
        ALREADY_REPORTED: 400,
      };

      const status = statusMap[error.code] || 400;

      return c.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        status
      );
    }

    // 알 수 없는 에러
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
}
```

### 3.3 presentation/middleware/logMiddleware.ts

```typescript
import { Context, Next } from "hono";

export async function logMiddleware(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  console.log(`--> ${method} ${path}`);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`<-- ${method} ${path} ${status} ${duration}ms`);
}
```

---

## 4. Request DTO 구현

### 4.1 presentation/dto/request/authRequest.ts

```typescript
import { z } from "zod";

export const kakaoLoginSchema = z.object({
  code: z.string().min(1, "인가 코드가 필요합니다."),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "리프레시 토큰이 필요합니다."),
});

export type KakaoLoginRequest = z.infer<typeof kakaoLoginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
```

### 4.2 presentation/dto/request/postRequest.ts

```typescript
import { z } from "zod";

export const createPostSchema = z.object({
  categoryId: z.string().uuid("올바른 카테고리 ID가 아닙니다."),
  title: z
    .string()
    .min(2, "제목은 최소 2자 이상이어야 합니다.")
    .max(100, "제목은 최대 100자까지 가능합니다."),
  content: z
    .string()
    .min(10, "내용은 최소 10자 이상이어야 합니다.")
    .max(5000, "내용은 최대 5000자까지 가능합니다."),
  isAnonymous: z.boolean().default(false),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(2, "제목은 최소 2자 이상이어야 합니다.")
    .max(100, "제목은 최대 100자까지 가능합니다.")
    .optional(),
  content: z
    .string()
    .min(10, "내용은 최소 10자 이상이어야 합니다.")
    .max(5000, "내용은 최대 5000자까지 가능합니다.")
    .optional(),
});

export const postListQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().optional(),
});

export const reactionSchema = z.object({
  type: z.enum(["LIKE", "DISLIKE"]),
});

export const reportPostSchema = z.object({
  reason: z
    .string()
    .min(5, "신고 사유는 최소 5자 이상이어야 합니다.")
    .max(500, "신고 사유는 최대 500자까지 가능합니다."),
});

export type CreatePostRequest = z.infer<typeof createPostSchema>;
export type UpdatePostRequest = z.infer<typeof updatePostSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
export type ReactionRequest = z.infer<typeof reactionSchema>;
export type ReportPostRequest = z.infer<typeof reportPostSchema>;
```

### 4.3 presentation/dto/request/commentRequest.ts

```typescript
import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(1000, "댓글은 최대 1000자까지 가능합니다."),
  isAnonymous: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(1000, "댓글은 최대 1000자까지 가능합니다."),
});

export const commentReactionSchema = z.object({
  type: z.enum(["LIKE"]),
});

export type CreateCommentRequest = z.infer<typeof createCommentSchema>;
export type UpdateCommentRequest = z.infer<typeof updateCommentSchema>;
export type CommentReactionRequest = z.infer<typeof commentReactionSchema>;
```

### 4.4 presentation/dto/request/userRequest.ts

```typescript
import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 최소 2자 이상이어야 합니다.")
    .max(20, "닉네임은 최대 20자까지 가능합니다.")
    .optional(),
  profileImage: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
```

---

## 5. Response DTO 구현

### 5.1 presentation/dto/response/apiResponse.ts

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}
```

### 5.2 presentation/dto/response/errorResponse.ts

```typescript
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: string[]
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
```

---

## 6. 라우트 구현

### 6.1 presentation/routes/authRoutes.ts

```typescript
import { Hono } from "hono";
import { AuthService } from "@/application/auth/AuthService";
import { kakaoLoginSchema, refreshTokenSchema } from "@/presentation/dto/request/authRequest";
import { successResponse } from "@/presentation/dto/response/apiResponse";
import { authMiddleware, AuthContext } from "@/presentation/middleware/authMiddleware";

export function createAuthRoutes(authService: AuthService) {
  const router = new Hono<AuthContext>();

  // POST /auth/kakao - 카카오 로그인
  router.post("/kakao", async (c) => {
    const body = await c.req.json();
    const { code } = kakaoLoginSchema.parse(body);

    const result = await authService.kakaoLogin(code);

    return c.json(successResponse(result));
  });

  // POST /auth/refresh - 토큰 갱신
  router.post("/refresh", async (c) => {
    const body = await c.req.json();
    const { refreshToken } = refreshTokenSchema.parse(body);

    const result = await authService.refreshToken(refreshToken);

    return c.json(successResponse(result));
  });

  // POST /auth/logout - 로그아웃
  router.post("/logout", authMiddleware, async (c) => {
    const userId = c.get("userId");

    await authService.logout(userId);

    return c.json(successResponse({ message: "로그아웃 되었습니다." }));
  });

  // GET /auth/me - 내 정보 조회
  router.get("/me", authMiddleware, async (c) => {
    const user = c.get("user");

    return c.json(successResponse(user));
  });

  return router;
}
```

### 6.2 presentation/routes/postRoutes.ts

```typescript
import { Hono } from "hono";
import { PostService } from "@/application/post/PostService";
import {
  createPostSchema,
  updatePostSchema,
  postListQuerySchema,
  reactionSchema,
  reportPostSchema,
} from "@/presentation/dto/request/postRequest";
import { successResponse, paginatedResponse } from "@/presentation/dto/response/apiResponse";
import {
  authMiddleware,
  optionalAuthMiddleware,
  AuthContext,
} from "@/presentation/middleware/authMiddleware";

export function createPostRoutes(postService: PostService) {
  const router = new Hono<AuthContext>();

  // GET /posts - 게시글 목록
  router.get("/", optionalAuthMiddleware, async (c) => {
    const query = postListQuerySchema.parse(c.req.query());
    const userId = c.get("userId");

    const result = await postService.getPosts({
      categoryId: query.categoryId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      userId,
    });

    return c.json(
      paginatedResponse(result.posts, query.page, query.limit, result.total)
    );
  });

  // GET /posts/:id - 게시글 상세
  router.get("/:id", optionalAuthMiddleware, async (c) => {
    const postId = c.req.param("id");
    const userId = c.get("userId");

    const post = await postService.getPost(postId, userId);

    return c.json(successResponse(post));
  });

  // POST /posts - 게시글 작성
  router.post("/", authMiddleware, async (c) => {
    const body = await c.req.json();
    const data = createPostSchema.parse(body);
    const userId = c.get("userId");

    const post = await postService.createPost({
      ...data,
      authorId: userId,
    });

    return c.json(successResponse(post), 201);
  });

  // PUT /posts/:id - 게시글 수정
  router.put("/:id", authMiddleware, async (c) => {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const data = updatePostSchema.parse(body);
    const userId = c.get("userId");

    const post = await postService.updatePost(postId, userId, data);

    return c.json(successResponse(post));
  });

  // DELETE /posts/:id - 게시글 삭제
  router.delete("/:id", authMiddleware, async (c) => {
    const postId = c.req.param("id");
    const userId = c.get("userId");

    await postService.deletePost(postId, userId);

    return c.json(successResponse({ message: "게시글이 삭제되었습니다." }));
  });

  // POST /posts/:id/reactions - 리액션 추가/토글
  router.post("/:id/reactions", authMiddleware, async (c) => {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const { type } = reactionSchema.parse(body);
    const userId = c.get("userId");

    const result = await postService.toggleReaction(postId, userId, type);

    return c.json(successResponse(result));
  });

  // POST /posts/:id/report - 게시글 신고
  router.post("/:id/report", authMiddleware, async (c) => {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const { reason } = reportPostSchema.parse(body);
    const userId = c.get("userId");

    await postService.reportPost(postId, userId, reason);

    return c.json(successResponse({ message: "신고가 접수되었습니다." }));
  });

  return router;
}
```

### 6.3 presentation/routes/commentRoutes.ts

```typescript
import { Hono } from "hono";
import { CommentService } from "@/application/comment/CommentService";
import {
  createCommentSchema,
  updateCommentSchema,
  commentReactionSchema,
} from "@/presentation/dto/request/commentRequest";
import { successResponse } from "@/presentation/dto/response/apiResponse";
import {
  authMiddleware,
  optionalAuthMiddleware,
  AuthContext,
} from "@/presentation/middleware/authMiddleware";

export function createCommentRoutes(commentService: CommentService) {
  const router = new Hono<AuthContext>();

  // GET /posts/:postId/comments - 댓글 목록
  router.get("/posts/:postId/comments", optionalAuthMiddleware, async (c) => {
    const postId = c.req.param("postId");
    const userId = c.get("userId");

    const comments = await commentService.getCommentsByPost(postId, userId);

    return c.json(successResponse(comments));
  });

  // POST /posts/:postId/comments - 댓글 작성
  router.post("/posts/:postId/comments", authMiddleware, async (c) => {
    const postId = c.req.param("postId");
    const body = await c.req.json();
    const data = createCommentSchema.parse(body);
    const userId = c.get("userId");

    const comment = await commentService.createComment({
      postId,
      authorId: userId,
      ...data,
    });

    return c.json(successResponse(comment), 201);
  });

  // PUT /comments/:id - 댓글 수정
  router.put("/comments/:id", authMiddleware, async (c) => {
    const commentId = c.req.param("id");
    const body = await c.req.json();
    const { content } = updateCommentSchema.parse(body);
    const userId = c.get("userId");

    const comment = await commentService.updateComment(commentId, userId, content);

    return c.json(successResponse(comment));
  });

  // DELETE /comments/:id - 댓글 삭제
  router.delete("/comments/:id", authMiddleware, async (c) => {
    const commentId = c.req.param("id");
    const userId = c.get("userId");

    await commentService.deleteComment(commentId, userId);

    return c.json(successResponse({ message: "댓글이 삭제되었습니다." }));
  });

  // POST /comments/:id/reactions - 댓글 리액션
  router.post("/comments/:id/reactions", authMiddleware, async (c) => {
    const commentId = c.req.param("id");
    const body = await c.req.json();
    const { type } = commentReactionSchema.parse(body);
    const userId = c.get("userId");

    const result = await commentService.toggleReaction(commentId, userId, type);

    return c.json(successResponse(result));
  });

  return router;
}
```

### 6.4 presentation/routes/categoryRoutes.ts

```typescript
import { Hono } from "hono";
import { CategoryService } from "@/application/category/CategoryService";
import { successResponse } from "@/presentation/dto/response/apiResponse";
import { authMiddleware, adminMiddleware, AuthContext } from "@/presentation/middleware/authMiddleware";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  sortOrder: z.number().int().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export function createCategoryRoutes(categoryService: CategoryService) {
  const router = new Hono<AuthContext>();

  // GET /categories - 카테고리 목록
  router.get("/", async (c) => {
    const categories = await categoryService.getAllCategories();

    return c.json(successResponse(categories));
  });

  // GET /categories/:id - 카테고리 상세
  router.get("/:id", async (c) => {
    const categoryId = c.req.param("id");

    const category = await categoryService.getCategory(categoryId);

    return c.json(successResponse(category));
  });

  // POST /categories - 카테고리 생성 (관리자)
  router.post("/", authMiddleware, adminMiddleware, async (c) => {
    const body = await c.req.json();
    const data = createCategorySchema.parse(body);

    const category = await categoryService.createCategory(data);

    return c.json(successResponse(category), 201);
  });

  // PUT /categories/:id - 카테고리 수정 (관리자)
  router.put("/:id", authMiddleware, adminMiddleware, async (c) => {
    const categoryId = c.req.param("id");
    const body = await c.req.json();
    const data = updateCategorySchema.parse(body);

    const category = await categoryService.updateCategory(categoryId, data);

    return c.json(successResponse(category));
  });

  // DELETE /categories/:id - 카테고리 삭제 (관리자)
  router.delete("/:id", authMiddleware, adminMiddleware, async (c) => {
    const categoryId = c.req.param("id");

    await categoryService.deleteCategory(categoryId);

    return c.json(successResponse({ message: "카테고리가 삭제되었습니다." }));
  });

  return router;
}
```

### 6.5 presentation/routes/userRoutes.ts

```typescript
import { Hono } from "hono";
import { UserService } from "@/application/user/UserService";
import { updateProfileSchema } from "@/presentation/dto/request/userRequest";
import { successResponse, paginatedResponse } from "@/presentation/dto/response/apiResponse";
import { authMiddleware, AuthContext } from "@/presentation/middleware/authMiddleware";
import { z } from "zod";

const myPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export function createUserRoutes(userService: UserService) {
  const router = new Hono<AuthContext>();

  // GET /users/me - 내 프로필
  router.get("/me", authMiddleware, async (c) => {
    const userId = c.get("userId");

    const profile = await userService.getProfile(userId);

    return c.json(successResponse(profile));
  });

  // PUT /users/me - 프로필 수정
  router.put("/me", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();
    const data = updateProfileSchema.parse(body);

    const profile = await userService.updateProfile(userId, data);

    return c.json(successResponse(profile));
  });

  // GET /users/me/posts - 내 게시글 목록
  router.get("/me/posts", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const query = myPostsQuerySchema.parse(c.req.query());

    const result = await userService.getMyPosts(userId, query.page, query.limit);

    return c.json(
      paginatedResponse(result.posts, query.page, query.limit, result.total)
    );
  });

  // GET /users/me/comments - 내 댓글 목록
  router.get("/me/comments", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const query = myPostsQuerySchema.parse(c.req.query());

    const result = await userService.getMyComments(userId, query.page, query.limit);

    return c.json(
      paginatedResponse(result.comments, query.page, query.limit, result.total)
    );
  });

  // DELETE /users/me - 회원 탈퇴
  router.delete("/me", authMiddleware, async (c) => {
    const userId = c.get("userId");

    await userService.deleteAccount(userId);

    return c.json(successResponse({ message: "회원 탈퇴가 완료되었습니다." }));
  });

  return router;
}
```

---

## 7. 앱 엔트리포인트

### 7.1 app/index.ts

```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";

// Middlewares
import { errorMiddleware } from "@/presentation/middleware/errorMiddleware";
import { logMiddleware } from "@/presentation/middleware/logMiddleware";

// Routes
import { createAuthRoutes } from "@/presentation/routes/authRoutes";
import { createPostRoutes } from "@/presentation/routes/postRoutes";
import { createCommentRoutes } from "@/presentation/routes/commentRoutes";
import { createCategoryRoutes } from "@/presentation/routes/categoryRoutes";
import { createUserRoutes } from "@/presentation/routes/userRoutes";

// Services
import { AuthService } from "@/application/auth/AuthService";
import { PostService } from "@/application/post/PostService";
import { CommentService } from "@/application/comment/CommentService";
import { CategoryService } from "@/application/category/CategoryService";
import { UserService } from "@/application/user/UserService";

// Repositories
import { UserRepositoryImpl } from "@/infrastructure/persistence/UserRepositoryImpl";
import { PostRepositoryImpl } from "@/infrastructure/persistence/PostRepositoryImpl";
import { CommentRepositoryImpl } from "@/infrastructure/persistence/CommentRepositoryImpl";
import { CategoryRepositoryImpl } from "@/infrastructure/persistence/CategoryRepositoryImpl";

// Providers
import { JwtProvider } from "@/infrastructure/auth/JwtProvider";
import { KakaoClient } from "@/infrastructure/external/KakaoClient";

// Initialize
const prisma = new PrismaClient();
const app = new Hono();

// Global Middlewares
app.use("*", logMiddleware);
app.use("*", errorMiddleware);
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Initialize Repositories
const userRepository = new UserRepositoryImpl(prisma);
const postRepository = new PostRepositoryImpl(prisma);
const commentRepository = new CommentRepositoryImpl(prisma);
const categoryRepository = new CategoryRepositoryImpl(prisma);

// Initialize Providers
const jwtProvider = new JwtProvider();
const kakaoClient = new KakaoClient();

// Initialize Services
const authService = new AuthService(userRepository, jwtProvider, kakaoClient);
const postService = new PostService(postRepository, categoryRepository);
const commentService = new CommentService(commentRepository, postRepository);
const categoryService = new CategoryService(categoryRepository);
const userService = new UserService(userRepository, postRepository, commentRepository);

// Mount Routes
app.route("/api/auth", createAuthRoutes(authService));
app.route("/api/posts", createPostRoutes(postService));
app.route("/api", createCommentRoutes(commentService)); // /api/posts/:postId/comments, /api/comments/:id
app.route("/api/categories", createCategoryRoutes(categoryService));
app.route("/api/users", createUserRoutes(userService));

// 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "요청한 리소스를 찾을 수 없습니다.",
      },
    },
    404
  );
});

// Start Server
const port = Number(process.env.SERVER_PORT) || 3000;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
```

---

## 8. API 엔드포인트 요약

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| **Auth** |
| POST | `/api/auth/kakao` | 카카오 로그인 | - |
| POST | `/api/auth/refresh` | 토큰 갱신 | - |
| POST | `/api/auth/logout` | 로그아웃 | Required |
| GET | `/api/auth/me` | 내 정보 | Required |
| **Posts** |
| GET | `/api/posts` | 게시글 목록 | Optional |
| GET | `/api/posts/:id` | 게시글 상세 | Optional |
| POST | `/api/posts` | 게시글 작성 | Required |
| PUT | `/api/posts/:id` | 게시글 수정 | Required |
| DELETE | `/api/posts/:id` | 게시글 삭제 | Required |
| POST | `/api/posts/:id/reactions` | 리액션 | Required |
| POST | `/api/posts/:id/report` | 신고 | Required |
| **Comments** |
| GET | `/api/posts/:postId/comments` | 댓글 목록 | Optional |
| POST | `/api/posts/:postId/comments` | 댓글 작성 | Required |
| PUT | `/api/comments/:id` | 댓글 수정 | Required |
| DELETE | `/api/comments/:id` | 댓글 삭제 | Required |
| POST | `/api/comments/:id/reactions` | 댓글 리액션 | Required |
| **Categories** |
| GET | `/api/categories` | 카테고리 목록 | - |
| GET | `/api/categories/:id` | 카테고리 상세 | - |
| POST | `/api/categories` | 카테고리 생성 | Admin |
| PUT | `/api/categories/:id` | 카테고리 수정 | Admin |
| DELETE | `/api/categories/:id` | 카테고리 삭제 | Admin |
| **Users** |
| GET | `/api/users/me` | 내 프로필 | Required |
| PUT | `/api/users/me` | 프로필 수정 | Required |
| GET | `/api/users/me/posts` | 내 게시글 | Required |
| GET | `/api/users/me/comments` | 내 댓글 | Required |
| DELETE | `/api/users/me` | 회원 탈퇴 | Required |

---

## 9. 검증 체크리스트

- [ ] 모든 미들웨어 파일 생성
- [ ] 모든 Request DTO 파일 생성
- [ ] 모든 Response DTO 파일 생성
- [ ] 모든 라우트 파일 생성
- [ ] `app/index.ts` 업데이트
- [ ] TypeScript 컴파일 에러 없음
- [ ] 서버 실행 성공
- [ ] `/health` 엔드포인트 응답 확인
- [ ] API 테스트 (선택)

---

## 10. 다음 Phase

Phase 04 완료 후 → **Phase 05: FE_SETUP.md** (FE 프로젝트 구조 및 초기 설정)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
