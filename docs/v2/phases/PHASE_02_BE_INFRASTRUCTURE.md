# Phase 02: BE Infrastructure Layer

> 백엔드 인프라스트럭처 레이어 - Prisma, Repository 구현체, 외부 서비스 연동

## 목표

- Prisma 스키마 정의 및 마이그레이션
- Repository 인터페이스 구현체 작성
- JWT Provider 구현
- Kakao OAuth Client 구현
- S3 Client 구현

## 선행 조건

- Phase 00 완료 (프로젝트 셋업)
- Phase 01 완료 (Domain 레이어)
- PostgreSQL 데이터베이스 연결 가능

---

## 1. 폴더 구조

```
apps/server/src/infrastructure/
├── db/
│   └── prisma.ts
├── repositories/
│   ├── UserRepositoryImpl.ts
│   ├── PostRepositoryImpl.ts
│   ├── CommentRepositoryImpl.ts
│   ├── CategoryRepositoryImpl.ts
│   └── ReactionRepositoryImpl.ts
├── auth/
│   └── JwtProvider.ts
├── kakao/
│   └── KakaoClient.ts
└── s3/
    └── S3Client.ts

apps/server/prisma/
└── schema.prisma
```

---

## 2. 태스크 체크리스트

### 2.1 Prisma

- [ ] `prisma/schema.prisma` 스키마 정의
- [ ] `prisma generate` 실행
- [ ] `prisma db push` 또는 마이그레이션
- [ ] `infrastructure/db/prisma.ts` Prisma 클라이언트 설정

### 2.2 Repository 구현체

- [ ] `UserRepositoryImpl.ts`
- [ ] `PostRepositoryImpl.ts`
- [ ] `CommentRepositoryImpl.ts`
- [ ] `CategoryRepositoryImpl.ts`
- [ ] `ReactionRepositoryImpl.ts`

### 2.3 외부 서비스

- [ ] `JwtProvider.ts` - JWT 토큰 생성/검증
- [ ] `KakaoClient.ts` - 카카오 OAuth API 연동
- [ ] `S3Client.ts` - S3 파일 업로드/삭제

---

## 3. Prisma Schema

### 3.1 prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== User ====================
model User {
  id              Int       @id @default(autoincrement())
  kakaoId         BigInt    @unique
  nickname        String    @unique
  email           String?
  name            String?
  phoneNumber     String?
  profileImageUrl String?
  role            UserRole  @default(USER)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  posts              Post[]
  comments           Comment[]
  postLikes          LikeToPost[]
  postDislikes       DislikeToPost[]
  commentLikes       LikeToComment[]
  commentDislikes    DislikeToComment[]
  postReports        ReportToPost[]
  commentReports     ReportToComment[]
  anonymousIds       AnonymousUserInPost[]

  @@index([kakaoId])
  @@index([nickname])
  @@index([deletedAt])
}

enum UserRole {
  USER
  BOARD_ADMIN
  SUPER_ADMIN
}

// ==================== Category ====================
model CategoryGroup {
  id         Int        @id @default(autoincrement())
  name       String
  priority   Int        @default(0)
  isUse      Boolean    @default(true)
  categories Category[]

  @@index([priority])
  @@index([isUse])
}

model Category {
  id               Int           @id @default(autoincrement())
  name             String
  priority         Int           @default(0)
  isUse            Boolean       @default(true)
  isAnonymous      Boolean       @default(false)
  isPrivateComment Boolean       @default(false)
  groupId          Int
  group            CategoryGroup @relation(fields: [groupId], references: [id])
  subCategories    SubCategory[]
  posts            Post[]

  @@index([groupId])
  @@index([priority])
  @@index([isUse])
}

model SubCategory {
  id         Int      @id @default(autoincrement())
  name       String
  priority   Int      @default(0)
  isUse      Boolean  @default(true)
  categoryId Int
  category   Category @relation(fields: [categoryId], references: [id])
  posts      Post[]

  @@index([categoryId])
  @@index([priority])
}

// ==================== Post ====================
model Post {
  id            Int          @id @default(autoincrement())
  title         String
  content       String
  images        String[]     @default([])
  thumbnailUrl  String?
  views         Int          @default(0)
  likeCount     Int          @default(0)
  dislikeCount  Int          @default(0)
  isNotice      Boolean      @default(false)
  isAnonymous   Boolean      @default(false)
  categoryId    Int
  subCategoryId Int?
  userId        Int
  createdAt     DateTime     @default(now())
  updatedAt     DateTime?
  deletedAt     DateTime?

  category    Category     @relation(fields: [categoryId], references: [id])
  subCategory SubCategory? @relation(fields: [subCategoryId], references: [id])
  user        User         @relation(fields: [userId], references: [id])
  comments    Comment[]
  likes       LikeToPost[]
  dislikes    DislikeToPost[]
  reports     ReportToPost[]
  anonymousUsers AnonymousUserInPost[]

  @@index([categoryId, createdAt(sort: Desc)])
  @@index([subCategoryId])
  @@index([userId])
  @@index([isNotice, categoryId])
  @@index([deletedAt])
  @@index([createdAt(sort: Desc)])
}

// ==================== Comment ====================
model Comment {
  id           Int       @id @default(autoincrement())
  content      String
  postId       Int
  userId       Int
  parentId     Int?
  rootId       Int
  likeCount    Int       @default(0)
  dislikeCount Int       @default(0)
  isPrivate    Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  post     Post              @relation(fields: [postId], references: [id])
  user     User              @relation(fields: [userId], references: [id])
  parent   Comment?          @relation("CommentToParent", fields: [parentId], references: [id])
  children Comment[]         @relation("CommentToParent")
  likes    LikeToComment[]
  dislikes DislikeToComment[]
  reports  ReportToComment[]

  @@index([postId, rootId, id])
  @@index([postId, deletedAt])
  @@index([userId])
  @@index([parentId])
}

// ==================== Reactions ====================
model LikeToPost {
  userId Int
  postId Int
  user   User @relation(fields: [userId], references: [id])
  post   Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

model DislikeToPost {
  userId Int
  postId Int
  user   User @relation(fields: [userId], references: [id])
  post   Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

model LikeToComment {
  userId    Int
  commentId Int
  user      User    @relation(fields: [userId], references: [id])
  comment   Comment @relation(fields: [commentId], references: [id])

  @@id([userId, commentId])
}

model DislikeToComment {
  userId    Int
  commentId Int
  user      User    @relation(fields: [userId], references: [id])
  comment   Comment @relation(fields: [commentId], references: [id])

  @@id([userId, commentId])
}

// ==================== Reports ====================
model ReportToPost {
  id        Int      @id @default(autoincrement())
  userId    Int
  postId    Int
  reason    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])

  @@unique([userId, postId])
  @@index([createdAt(sort: Desc)])
}

model ReportToComment {
  id        Int      @id @default(autoincrement())
  userId    Int
  commentId Int
  reason    String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  comment Comment @relation(fields: [commentId], references: [id])

  @@unique([userId, commentId])
  @@index([createdAt(sort: Desc)])
}

// ==================== Anonymous ====================
model AnonymousUserInPost {
  userId      Int
  postId      Int
  anonymousId String

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
  @@index([postId])
}
```

---

## 4. Database Client

### 4.1 infrastructure/db/prisma.ts

```typescript
// infrastructure/db/prisma.ts

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## 5. Repository 구현체

### 5.1 UserRepositoryImpl.ts

```typescript
// infrastructure/repositories/UserRepositoryImpl.ts

import { prisma } from "@/infrastructure/db/prisma";
import type {
  UserRepository,
  CreateUserData,
  UpdateUserData,
} from "@/domain/repositories/UserRepository";
import type { User, UserProfile } from "@/domain/entities/User";

export class UserRepositoryImpl implements UserRepository {
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByKakaoId(kakaoId: bigint): Promise<User | null> {
    return prisma.user.findUnique({
      where: { kakaoId, deletedAt: null },
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { nickname, deletedAt: null },
    });
  }

  async findProfile(id: number): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });
    return user;
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        kakaoId: data.kakaoId,
        nickname: data.nickname,
        email: data.email,
        name: data.name,
        phoneNumber: data.phoneNumber,
        profileImageUrl: data.profileImageUrl,
      },
    });
  }

  async update(id: number, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async existsByNickname(nickname: string, excludeId?: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        nickname,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return user !== null;
  }
}
```

### 5.2 PostRepositoryImpl.ts

```typescript
// infrastructure/repositories/PostRepositoryImpl.ts

import { prisma } from "@/infrastructure/db/prisma";
import type {
  PostRepository,
  PostListParams,
} from "@/domain/repositories/PostRepository";
import type { Post, PostListItem, PostDetail, CreatePostInput } from "@/domain/entities/Post";

export class PostRepositoryImpl implements PostRepository {
  private readonly listSelect = {
    id: true,
    title: true,
    thumbnailUrl: true,
    views: true,
    likeCount: true,
    isNotice: true,
    isAnonymous: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true,
      },
    },
    _count: {
      select: { comments: true },
    },
  };

  async findById(id: number): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findDetail(id: number, userId?: number): Promise<PostDetail | null> {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
        category: true,
        subCategory: true,
        _count: {
          select: { comments: true },
        },
        ...(userId && {
          likes: { where: { userId }, take: 1 },
          dislikes: { where: { userId }, take: 1 },
        }),
        anonymousUsers: userId ? { where: { userId } } : false,
      },
    });

    if (!post) return null;

    // 익명 ID 조회
    let anonymousId: string | null = null;
    if (post.isAnonymous) {
      const anon = await prisma.anonymousUserInPost.findUnique({
        where: { userId_postId: { userId: post.userId, postId: id } },
      });
      anonymousId = anon?.anonymousId ?? null;
    }

    return {
      ...post,
      author: post.isAnonymous ? null : post.user,
      anonymousId,
      commentCount: post._count.comments,
      myReaction: userId
        ? {
            liked: (post as any).likes?.length > 0,
            disliked: (post as any).dislikes?.length > 0,
          }
        : null,
    } as PostDetail;
  }

  async findList(params: PostListParams): Promise<PostListItem[]> {
    const { categoryId, subCategoryId, page, limit } = params;

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        isNotice: false,
        ...(categoryId && { categoryId }),
        ...(subCategoryId && { subCategoryId }),
      },
      select: this.listSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map((post) => this.toListItem(post));
  }

  async findNoticeList(categoryId: number): Promise<PostListItem[]> {
    const posts = await prisma.post.findMany({
      where: {
        categoryId,
        isNotice: true,
        deletedAt: null,
      },
      select: this.listSelect,
      orderBy: { createdAt: "desc" },
    });

    return posts.map((post) => this.toListItem(post));
  }

  async findPopularList(page: number, limit: number): Promise<PostListItem[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: oneMonthAgo },
      },
      select: this.listSelect,
      orderBy: { likeCount: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map((post) => this.toListItem(post));
  }

  async findRecentByCategories(
    categoryIds: number[],
    limit: number
  ): Promise<Map<number, PostListItem[]>> {
    const result = new Map<number, PostListItem[]>();

    await Promise.all(
      categoryIds.map(async (categoryId) => {
        const posts = await prisma.post.findMany({
          where: {
            categoryId,
            deletedAt: null,
          },
          select: this.listSelect,
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        result.set(categoryId, posts.map((post) => this.toListItem(post)));
      })
    );

    return result;
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<PostListItem[]> {
    const posts = await prisma.post.findMany({
      where: { userId, deletedAt: null },
      select: this.listSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map((post) => this.toListItem(post));
  }

  async count(params: { categoryId?: number; subCategoryId?: number }): Promise<number> {
    return prisma.post.count({
      where: {
        deletedAt: null,
        isNotice: false,
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.subCategoryId && { subCategoryId: params.subCategoryId }),
      },
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return prisma.post.count({
      where: { userId, deletedAt: null },
    });
  }

  async create(userId: number, data: CreatePostInput): Promise<Post> {
    return prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        images: data.images,
        thumbnailUrl: data.images[0] ?? null,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        userId,
        isNotice: data.isNotice ?? false,
      },
    });
  }

  async update(id: number, data: Partial<CreatePostInput>): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data: {
        ...data,
        thumbnailUrl: data.images ? data.images[0] ?? null : undefined,
        updatedAt: new Date(),
      },
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

  private toListItem(post: any): PostListItem {
    return {
      id: post.id,
      title: post.title,
      thumbnailUrl: post.thumbnailUrl,
      views: post.views,
      likeCount: post.likeCount,
      commentCount: post._count.comments,
      isNotice: post.isNotice,
      isAnonymous: post.isAnonymous,
      createdAt: post.createdAt,
      author: post.isAnonymous
        ? null
        : {
            nickname: post.user.nickname,
            profileImageUrl: post.user.profileImageUrl,
          },
      anonymousId: null, // 리스트에서는 익명 ID 조회 안함
    };
  }
}
```

### 5.3 CommentRepositoryImpl.ts (핵심 부분)

```typescript
// infrastructure/repositories/CommentRepositoryImpl.ts

import { prisma } from "@/infrastructure/db/prisma";
import type {
  CommentRepository,
  CommentListParams,
} from "@/domain/repositories/CommentRepository";
import type { Comment, CommentListItem, CreateCommentInput } from "@/domain/entities/Comment";

export class CommentRepositoryImpl implements CommentRepository {
  async findById(id: number): Promise<Comment | null> {
    return prisma.comment.findUnique({
      where: { id },
    });
  }

  async findList(params: CommentListParams): Promise<CommentListItem[]> {
    const { postId, page, limit, userId } = params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
        ...(userId && {
          likes: { where: { userId }, take: 1 },
          dislikes: { where: { userId }, take: 1 },
        }),
      },
      orderBy: [{ rootId: "asc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.deletedAt ? "" : comment.content,
      parentId: comment.parentId,
      rootId: comment.rootId,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount,
      isPrivate: comment.isPrivate,
      isDeleted: comment.deletedAt !== null,
      createdAt: comment.createdAt,
      author: {
        id: comment.user.id,
        nickname: comment.user.nickname,
        profileImageUrl: comment.user.profileImageUrl,
        createdAt: comment.user.createdAt,
      },
      anonymousId: null, // 서비스 레이어에서 처리
      parentAnonymousId: null,
      myReaction: userId
        ? {
            liked: (comment as any).likes?.length > 0,
            disliked: (comment as any).dislikes?.length > 0,
          }
        : null,
      canView: true, // 서비스 레이어에서 처리
    }));
  }

  async count(postId: number): Promise<number> {
    return prisma.comment.count({
      where: { postId, deletedAt: null },
    });
  }

  async create(userId: number, data: CreateCommentInput): Promise<Comment> {
    return prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        userId,
        parentId: data.parentId,
        rootId: 0, // 임시값, 생성 후 업데이트
        isPrivate: data.isPrivate ?? false,
      },
    });
  }

  async softDelete(id: number): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateRootId(id: number, rootId: number): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { rootId },
    });
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<CommentListItem[]> {
    // 구현...
    return [];
  }

  async countByUserId(userId: number): Promise<number> {
    return prisma.comment.count({
      where: { userId, deletedAt: null },
    });
  }
}
```

---

## 6. 외부 서비스

### 6.1 JwtProvider.ts

```typescript
// infrastructure/auth/JwtProvider.ts

import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: number;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtProvider {
  private readonly secret: string;
  private readonly accessTokenExpiry = "15m";
  private readonly refreshTokenExpiry = "7d";

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    this.secret = secret;
  }

  createTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, this.secret, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, this.secret, {
      expiresIn: this.refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }
}
```

### 6.2 KakaoClient.ts

```typescript
// infrastructure/kakao/KakaoClient.ts

export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

export interface KakaoUserInfo {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export class KakaoClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.KAKAO_CLIENT_ID!;
    this.clientSecret = process.env.KAKAO_CLIENT_SECRET!;
    this.redirectUri = process.env.KAKAO_REDIRECT_URI!;
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
    });
    return `https://kauth.kakao.com/oauth/authorize?${params}`;
  }

  async getToken(code: string): Promise<KakaoTokenResponse> {
    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao token");
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get Kakao user info");
    }

    return response.json();
  }
}
```

### 6.3 S3Client.ts

```typescript
// infrastructure/s3/S3Client.ts

import {
  S3Client as AWSS3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Client {
  private readonly client: AWSS3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.region = process.env.S3_REGION!;

    this.client = new AWSS3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    return this.getFileUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async moveFile(sourceKey: string, destKey: string): Promise<string> {
    // Copy
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destKey,
      })
    );

    // Delete original
    await this.deleteFile(sourceKey);

    return this.getFileUrl(destKey);
  }

  getFileUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url: string): string | null {
    const match = url.match(/\.amazonaws\.com\/(.+)$/);
    return match ? match[1] : null;
  }
}
```

---

## 7. 검증 체크리스트

- [ ] `pnpm db:generate` 성공
- [ ] `pnpm db:push` 성공 (개발용) 또는 마이그레이션
- [ ] Prisma Studio에서 테이블 확인 (`pnpm db:studio`)
- [ ] 모든 Repository 구현체 작성
- [ ] JwtProvider 토큰 생성/검증 테스트
- [ ] TypeScript 컴파일 에러 없음

---

## 8. 다음 Phase

Phase 02 완료 후 → **Phase 03: BE_APPLICATION.md** (Services)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
