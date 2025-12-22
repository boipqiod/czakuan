# 에대숲 (Czakuan) 기술 리뷰 문서

> **문서 버전**: 1.0
> **작성일**: 2025-12-22
> **목적**: 프로젝트 코드베이스의 기술적 품질, 아키텍처, 보안, 성능 분석 및 개선 권장사항 제시

---

## 목차

1. [종합 평가](#1-종합-평가)
2. [아키텍처 분석](#2-아키텍처-분석)
3. [보안 이슈](#3-보안-이슈)
4. [성능 이슈](#4-성능-이슈)
5. [코드 품질](#5-코드-품질)
6. [데이터베이스 설계](#6-데이터베이스-설계)
7. [누락된 기능](#7-누락된-기능)
8. [개선 권장사항](#8-개선-권장사항)
9. [결론](#9-결론)

---

## 1. 종합 평가

### 1.1 점수 요약

| 평가 항목 | 점수 | 등급 |
|----------|------|------|
| **아키텍처** | 82/100 | B+ |
| **보안** | 55/100 | D+ |
| **성능** | 68/100 | C+ |
| **코드 품질** | 72/100 | B- |
| **데이터베이스 설계** | 78/100 | B |
| **기능 완성도** | 65/100 | C |
| **종합** | **70/100** | **C+** |

### 1.2 한줄 평가

> **"MVP로서는 작동하지만, 프로덕션 환경에 배포하기 전 보안 및 성능 보완이 필수"**

### 1.3 평가 기준

- 💚 **양호**: 현재 상태로 운영 가능
- 🟡 **주의**: 개선 권장, 당장 문제는 없음
- 🔴 **심각**: 즉시 수정 필요

---

## 2. 아키텍처 분석

### 2.1 전체 구조 💚

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Components │  │    Hooks    │  │    Store    │          │
│  │  (UI 렌더링) │  │  (로직 분리) │  │  (Zustand)  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└────────────────────────────┬────────────────────────────────┘
                             │ Server Actions (RPC)
┌────────────────────────────▼────────────────────────────────┐
│                      Server Actions                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  auth.actions.ts | post.actions.ts | user.actions.ts │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Service Layer                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PostService | CommentService | UserService | etc.    │    │
│  │ (비즈니스 로직 캡슐화)                                │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                     Repository Layer                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PostRepository | CommentRepository | etc.            │    │
│  │ (데이터 접근 추상화)                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Prisma ORM                              │
│                    (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────┘
```

**평가**:
- ✅ 명확한 계층 분리 (Actions → Service → Repository)
- ✅ 관심사 분리가 잘 되어 있음
- ✅ 테스트 용이한 구조 (DI 패턴 적용)

### 2.2 기술 스택 선택 💚

| 기술 | 버전 | 평가 |
|------|------|------|
| Next.js | 15.0.2 | ✅ 최신 App Router 사용, 적절한 선택 |
| React | 19.0.0-rc | ⚠️ RC 버전 - 프로덕션에서는 안정 버전 권장 |
| Prisma | 6.4.1 | ✅ PostgreSQL과 좋은 조합 |
| Zustand | 5.0.1 | ✅ 가벼운 상태관리, 적절한 선택 |
| TypeScript | 5.x | ✅ 타입 안정성 확보 |

### 2.3 폴더 구조 💚

```
src/
├── app/           # 페이지 (App Router)
├── server/        # 백엔드 로직
│   ├── actions/   # Server Actions (진입점)
│   ├── service/   # 비즈니스 로직
│   ├── repositories/  # 데이터 접근
│   └── modules/   # 유틸리티 (auth, s3, prisma)
├── client/        # 프론트엔드 로직
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── ui/
├── types/         # 타입 정의
└── lib/           # 공통 유틸리티
```

**평가**: 깔끔하고 일관된 구조

---

## 3. 보안 이슈

### 3.1 🔴 [심각] 토큰 역순 인코딩 - 보안 효과 없음

**위치**: `src/server/service/token.service.ts:17, 31-32`

**현재 코드**:
```typescript
// 토큰 검증 시
verifyToken(token: string) {
  const _token = token.split('').toReversed().join('');  // 역순으로 변환
  return jwt.verify(_token, this.jwtSectet);
}

// 토큰 생성 시
createTokenByUser(user: User) {
  const _accessToken = this.createToken(payload, '1m');
  const accessToken = _accessToken.split('').toReversed().join('');  // 역순으로 저장
  // ...
}
```

**문제점**:
1. 이것은 **보안(Security)**이 아니라 **난독화(Obfuscation)**
2. 소스 코드를 보면 즉시 해독 가능
3. JWT 자체가 이미 서명되어 있으므로 역순 인코딩은 불필요
4. 오히려 디버깅과 유지보수만 어렵게 만듦

**위험도**: 🔴 높음 (보안에 대한 잘못된 이해)

**권장 수정**:
```typescript
// 단순하게 표준 JWT 사용
verifyToken(token: string) {
  return jwt.verify(token, this.jwtSecret);
}

createTokenByUser(user: User) {
  return {
    accessToken: this.createToken(payload, '15m'),  // 15분으로 늘림
    refreshToken: this.createToken(payload, '7d'),
  };
}
```

---

### 3.2 🔴 [심각] Access Token 1분은 비정상적으로 짧음

**위치**: `src/server/service/token.service.ts:28`

**현재 코드**:
```typescript
const _accessToken = this.createToken(payload, '1m');  // 1분
const _refreshToken = this.createToken(payload, '7d'); // 7일
```

**문제점**:
1. **매 1분마다 토큰 갱신** → 서버 부하 증가
2. 네트워크 지연 시 사용자 경험 저하
3. 불필요한 API 호출 증가

**업계 표준**:
| 서비스 | Access Token | Refresh Token |
|--------|--------------|---------------|
| Google | 1시간 | 7일~무기한 |
| Facebook | 1-2시간 | 60일 |
| 일반 권장 | 15분~1시간 | 7일~30일 |

**권장 수정**:
```typescript
const accessToken = this.createToken(payload, '15m');   // 15분
const refreshToken = this.createToken(payload, '7d');   // 7일
```

---

### 3.3 🟡 [주의] 민감 정보 로깅

**위치**: `src/server/modules/auth.ts:47, 59`

**현재 코드**:
```typescript
export const verifyAdmin = async (text?: string) => {
  const user = await verifyUser();
  console.log('verifyAdmin', user);  // ⚠️ 사용자 정보 로깅
  // ...
};

export const verifySuperAdmin = async () => {
  console.log('verifySuperAdmin', user);  // ⚠️ 사용자 정보 로깅
  // ...
};
```

**문제점**:
- 프로덕션 로그에 사용자 정보 노출
- 로그 수집 시스템에 민감 정보 저장

**권장 수정**:
```typescript
// 개발 환경에서만 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('verifyAdmin', user?.id);  // ID만 로깅
}
```

---

### 3.4 🟡 [주의] Rate Limiting 없음

**현재 상태**: 모든 API에 Rate Limiting 미적용

**취약점**:
1. 게시글/댓글 도배 공격 가능
2. 좋아요/싫어요 연타 공격 가능
3. 로그인 시도 무제한 (카카오 OAuth로 일부 완화)
4. 신고 기능 악용 가능

**권장 해결책**:
```typescript
// 예시: next-rate-limit 또는 upstash/ratelimit 사용
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 60초당 10회
});

export const createPost = async (...) => {
  const { success } = await ratelimit.limit(user.id);
  if (!success) throw TooManyRequestsError();
  // ...
};
```

---

### 3.5 🟡 [주의] 입력 값 검증 미흡

**위치**: 다수의 Server Actions

**현재 상태**:
- 게시글 제목/내용 길이 제한 없음
- 닉네임 형식 검증 없음
- 신고 사유 최대 길이 제한 없음

**잠재적 문제**:
- 매우 긴 텍스트로 DB/렌더링 부하
- XSS 공격 (React Quill이 일부 방어하지만)
- SQL Injection (Prisma가 방어하지만 추가 검증 권장)

**권장 해결책**:
```typescript
// zod 사용 예시
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(50000),
  categoryId: z.number().positive(),
});

export const createPost = async (input: unknown) => {
  const validated = createPostSchema.parse(input);
  // ...
};
```

---

## 4. 성능 이슈

### 4.1 🟡 [주의] N+1 쿼리 가능성

**위치**: `src/server/service/comment.service.ts:136-169`

**현재 코드**:
```typescript
// 댓글 생성 시 익명 처리
if (post.isAnonymous) {
  let anonymRecord = await prisma.anonymousUserInPost.findUnique({...});

  if (!anonymRecord) {
    anonymRecord = await prisma.anonymousUserInPost.create({...});
  }

  if (parentId && comment.parent) {
    // 부모 댓글 익명 ID 조회 - 추가 쿼리
    const parentAnonymRecord = await prisma.anonymousUserInPost.findUnique({...});
  }
}
```

**문제점**:
- 댓글 생성마다 2-3회 추가 쿼리
- 트래픽 증가 시 DB 부하

**권장 개선**:
```typescript
// 트랜잭션으로 묶고, 필요한 데이터 한 번에 조회
const [anonymRecord, parentAnonymRecord] = await prisma.$transaction([
  prisma.anonymousUserInPost.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId, anonymId: getUniqueString() },
    update: {},
  }),
  parentId ? prisma.anonymousUserInPost.findUnique({
    where: { userId_postId: { userId: parentUserId, postId } }
  }) : null,
]);
```

---

### 4.2 🟡 [주의] 조회수 처리 - 클라이언트 의존

**위치**: 클라이언트 사이드 (sessionStorage 기반)

**현재 방식**:
```
1. 클라이언트에서 sessionStorage 확인
2. 이미 본 게시글이면 조회수 API 호출 안함
3. 처음 보는 게시글이면 조회수 증가 API 호출
```

**문제점**:
1. sessionStorage 조작으로 무한 조회수 증가 가능
2. 봇/크롤러 조회 시 비정상 증가
3. 정확한 통계 불가능

**권장 개선** (중요도에 따라 선택):

**옵션 A - 간단 (서버 세션 기반)**:
```typescript
// Redis에 IP + postId 조합 저장 (TTL 24시간)
const viewKey = `view:${postId}:${ip}`;
const viewed = await redis.get(viewKey);
if (!viewed) {
  await redis.set(viewKey, '1', 'EX', 86400);
  await increaseViewCount(postId);
}
```

**옵션 B - 정확 (로그 기반 집계)**:
```typescript
// 조회 로그 테이블에 기록, 배치로 집계
await prisma.postViewLog.create({
  data: { postId, visitorId, viewedAt: new Date() }
});
// 별도 배치 작업에서 unique visitor 집계
```

---

### 4.3 🟡 [주의] 인기 게시글 쿼리 비효율

**위치**: `src/server/repositories/post.repository.ts:113-136`

**현재 코드**:
```typescript
getPopularList(page: number, limit: number) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return prisma.post.findMany({
    orderBy: {
      likes: { _count: 'desc' },  // 매 요청마다 집계
    },
    where: {
      createdAt: { gte: oneMonthAgo },
    },
    // ...
  });
}
```

**문제점**:
- 매 요청마다 좋아요 수 COUNT 집계
- 게시글/좋아요 수 증가 시 성능 저하

**권장 개선**:
```typescript
// 옵션 1: Post 테이블에 likeCount 필드 추가 (비정규화)
// 좋아요 생성/삭제 시 증감

// 옵션 2: 캐싱
const cached = await redis.get('popular-posts');
if (cached) return JSON.parse(cached);

const posts = await prisma.post.findMany({...});
await redis.set('popular-posts', JSON.stringify(posts), 'EX', 300); // 5분 캐시
```

---

### 4.4 🟡 [주의] 이미지 처리

**위치**: `src/server/service/post.service.ts:206-217`

**현재 코드**:
```typescript
const movedImageUrls = await Promise.all(
  images.map(async (imageUrl, index) => {
    const url = await this.s3Helper.moveObject(
      imageUrl,
      `post/${newPost.id}`,
      getUniqueString(),
    );
    updatedContent = updatedContent.replace(imageUrl, url);
    return url;
  }),
);
```

**잘된 점**:
- Promise.all로 병렬 처리
- 임시 → 최종 경로 이동 패턴

**문제점**:
- 이미지 리사이징 없음 (원본 그대로 저장)
- WebP 변환 없음
- CDN 연동 없음

**권장 개선**:
```typescript
// Sharp 라이브러리로 리사이징 + WebP 변환
import sharp from 'sharp';

const processImage = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const processed = await sharp(Buffer.from(buffer))
    .resize(1200, 1200, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  return uploadToS3(processed);
};
```

---

## 5. 코드 품질

### 5.1 💚 잘된 점

#### 계층 분리 및 DI 패턴
```typescript
// 의존성 주입으로 테스트 용이
export class PostService {
  constructor(
    private readonly postRepository: PostRepository = new PostRepository(),
    private readonly categoryRepository = new CategoryRepository(),
    private readonly prismaHelper = prisma,
    private readonly s3Helper = s3,
  ) {}
}
```

#### Repository 패턴
```typescript
// 쿼리 로직 분리
export class PostRepository {
  private readonly postSelectFields = { /* ... */ };

  getList(page, limit, categoryId?, subCategoryId?) { /* ... */ }
  getDetail(postId) { /* ... */ }
  create(...) { /* ... */ }
}
```

#### 타입 안정성
```typescript
// 명확한 타입 정의
async getPostList(...): Promise<ListType<PostListType>> {
  // ...
}
```

---

### 5.2 🟡 개선 필요 사항

#### 5.2.1 console.log 남아있음

**위치**: 다수 파일

```typescript
// src/server/modules/auth.ts:47
console.log('verifyAdmin', user);

// src/server/service/post.service.ts:252-257
console.log('edit', {
  originImages,
  notDeletedImages,
  deletedImages,
  addedImages,
});

// src/server/modules/s3.ts:73, 125-129
console.log('### 파일 이동', {originSource, targetKeyPrefix, key});
console.log('### getFileUrl', {...});
```

**권장**: 로거 라이브러리 사용 (winston, pino)

---

#### 5.2.2 에러 처리 불일치

**현재 상태**:
```typescript
// 어떤 곳은 throw
if (!post) throw NotFoundError();

// 어떤 곳은 return null
if (!token || !refreshToken) return null;
```

**권장**: 일관된 에러 처리 전략 수립

---

#### 5.2.3 매직 넘버

**위치**: 다수

```typescript
// 하드코딩된 값들
const _accessToken = this.createToken(payload, '1m');  // 왜 1분?
categoryId: categoryId ?? 1,  // 왜 1?
```

**권장**:
```typescript
// 상수로 분리
const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRES: '15m',
  REFRESH_TOKEN_EXPIRES: '7d',
};

const CATEGORY_CONFIG = {
  DEFAULT_CATEGORY_ID: 1,
};
```

---

#### 5.2.4 await 누락

**위치**: `src/server/service/comment.service.ts:191-193, 204-206`

```typescript
// await 없이 호출
if (like) {
  this.commentRepository.deleteLike(commentId, userId);  // await 없음!
} else {
  this.commentRepository.createLike(commentId, userId);  // await 없음!
}
```

**문제점**: 비동기 작업 완료 보장 안됨

---

## 6. 데이터베이스 설계

### 6.1 💚 잘된 점

#### 소프트 삭제 적용
```prisma
model Post {
  deletedAt DateTime?  // 소프트 삭제
}

model Comment {
  deletedAt DateTime?  // 소프트 삭제
}
```

#### 복합 기본키로 중복 방지
```prisma
model LikeToPost {
  userId Int
  postId Int
  @@id([userId, postId])  // 중복 좋아요 방지
}
```

#### 자기 참조 관계 (대댓글)
```prisma
model Comment {
  parentId  Int?
  rootId    Int
  parent    Comment?  @relation("CommentToParent", ...)
  children  Comment[] @relation("CommentToParent")
}
```

---

### 6.2 🟡 개선 필요 사항

#### 6.2.1 rootId 설계 문제

**현재 코드** (`src/server/repositories/comment.repository.ts:79-100`):
```typescript
create(..., rootId?: number) {
  return prisma.comment.create({
    data: {
      // ...
      rootId: rootId ?? 0,  // 임시로 0 설정
    },
  });
}

updateRootId(id: number, rootId: number) {
  // 생성 후 별도 업데이트
  return prisma.comment.update({
    where: { id },
    data: { rootId },
  });
}
```

**문제점**:
- INSERT 후 UPDATE 필요 (2회 쿼리)
- 중간에 실패하면 rootId가 0인 댓글 존재 가능
- 트랜잭션 미적용

**권장 개선**:
```typescript
// 트랜잭션으로 처리
async create(..., parentId?, rootId?) {
  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: { ..., rootId: rootId ?? 0 }
    });

    if (!rootId) {
      await tx.comment.update({
        where: { id: comment.id },
        data: { rootId: comment.id }
      });
    }

    return comment;
  });
}
```

---

#### 6.2.2 인덱스 부재

**현재 상태**: 기본 인덱스 외 추가 인덱스 없음

**권장 추가 인덱스**:
```prisma
model Post {
  @@index([categoryId, createdAt])     // 카테고리별 최신순 조회
  @@index([deletedAt])                 // 삭제된 게시글 필터링
  @@index([isNotice, categoryId])      // 공지사항 조회
}

model Comment {
  @@index([postId, rootId, id])        // 댓글 정렬 조회
  @@index([postId, deletedAt])         // 삭제 안된 댓글 조회
}
```

---

#### 6.2.3 삭제된 댓글 조회 시 deletedAt 필터 누락

**위치**: `src/server/repositories/comment.repository.ts:45-56`

```typescript
getList(postId: number, limit: number, page: number) {
  return prisma.comment.findMany({
    where: {
      postId,
      // ⚠️ deletedAt: null 조건 없음!
    },
    // ...
  });
}
```

**문제점**: 삭제된 댓글도 조회됨

---

## 7. 누락된 기능

### 7.1 🔴 검색 기능 없음

**현재 상태**: 게시글/댓글 검색 기능 전무

**영향**:
- 사용자가 원하는 글 찾기 어려움
- 게시글 증가 시 사용성 급격히 저하
- 커뮤니티 서비스의 필수 기능 누락

**구현 권장**:
```typescript
// Prisma 기본 검색
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: keyword } },
      { content: { contains: keyword } },
    ]
  }
});

// 또는 PostgreSQL Full-Text Search
// 또는 Elasticsearch/Algolia 연동
```

---

### 7.2 🔴 카테고리 관리 UI 없음

**현재 상태**:
- 카테고리 CRUD를 위한 어드민 UI 없음
- DB에 직접 INSERT 필요

**구현 권장**:
- `/admin/categories` 페이지 추가
- 카테고리 생성/수정/삭제/순서변경 기능

---

### 7.3 🟡 임시 이미지 정리 없음

**현재 상태**:
- 글 작성 중 이탈하면 S3에 임시 파일 잔존
- 시간이 지나면 쓰레기 파일 누적

**구현 권장**:
```typescript
// 크론잡 또는 Lambda 함수
const cleanupTempImages = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const objects = await s3.listObjects({
    Bucket: bucketName,
    Prefix: 'tmp/'
  });

  const oldObjects = objects.filter(obj => obj.LastModified < oneDayAgo);
  await s3.deleteObjects(oldObjects);
};
```

---

### 7.4 🟡 사용자 제재 기능 없음

**현재 상태**:
- 신고 목록 조회만 가능
- 사용자 밴/정지 기능 없음

**필요 기능**:
- 사용자 정지 (일시/영구)
- 정지된 사용자 글쓰기 차단
- 정지 이력 관리

---

### 7.5 🟡 알림 기능 없음

**현재 상태**:
- 댓글 알림 없음
- 대댓글 알림 없음
- 좋아요 알림 없음

**영향**: 사용자 참여도 저하

---

### 7.6 기타 누락 기능

| 기능 | 중요도 | 비고 |
|------|--------|------|
| 게시글 북마크/스크랩 | 중 | 사용자 편의 |
| 해시태그 | 하 | 검색 기능과 연계 |
| 멘션 (@username) | 하 | 소통 활성화 |
| 게시글 공유 | 하 | SNS 연동 |
| 이미지 미리보기/갤러리 | 중 | UX 개선 |
| 게시글 임시저장 | 중 | 사용자 편의 |

---

## 8. 개선 권장사항

### 8.1 즉시 수정 필요 (1-2일)

| 우선순위 | 항목 | 작업 시간 | 위험도 |
|---------|------|----------|--------|
| 1 | Access Token 시간 15분으로 변경 | 5분 | 🔴 |
| 2 | 토큰 역순 인코딩 제거 | 30분 | 🔴 |
| 3 | console.log 제거 또는 로거 적용 | 1시간 | 🟡 |
| 4 | 댓글 조회 시 deletedAt 필터 추가 | 10분 | 🟡 |
| 5 | await 누락 수정 | 10분 | 🟡 |

### 8.2 단기 개선 (1-2주)

| 우선순위 | 항목 | 작업 시간 |
|---------|------|----------|
| 1 | 검색 기능 추가 | 1-2일 |
| 2 | Rate Limiting 추가 | 반나절 |
| 3 | 입력 값 검증 (zod) 추가 | 1일 |
| 4 | 임시 이미지 정리 크론잡 | 2시간 |
| 5 | 인덱스 추가 | 1시간 |

### 8.3 중기 개선 (1-2개월)

| 항목 | 작업 시간 |
|------|----------|
| 카테고리 관리 어드민 | 1-2일 |
| 사용자 제재 기능 | 2-3일 |
| 알림 시스템 | 1주 |
| 이미지 최적화 (리사이징, WebP) | 1-2일 |
| 캐싱 레이어 (Redis) | 2-3일 |

### 8.4 장기 개선 (3개월+)

| 항목 | 설명 |
|------|------|
| 모니터링/APM 도입 | Sentry, Datadog 등 |
| CI/CD 파이프라인 | 자동 테스트/배포 |
| 테스트 코드 작성 | 단위/통합 테스트 |
| 문서화 | API 문서, 개발 가이드 |

---

## 9. 결론

### 9.1 현재 프로젝트 상태

```
┌─────────────────────────────────────────────────────────────┐
│                     프로젝트 성숙도                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PoC    MVP    Beta    Production    Enterprise             │
│   ●──────●──────●─────────○───────────○                     │
│              ▲                                              │
│              │                                              │
│          현재 위치                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 배포 권장 사항

| 사용자 규모 | 현재 상태 배포 가능 여부 | 권장 조치 |
|------------|------------------------|----------|
| ~50명 | ⚠️ 주의하며 가능 | 기본 보안 수정 후 |
| 50~200명 | ❌ 권장하지 않음 | 보안 + 검색 기능 추가 후 |
| 200명+ | ❌ 불가 | 전체 개선 후 |

### 9.3 최종 평가

**강점**:
- 깔끔한 아키텍처와 코드 구조
- Next.js 15 + Prisma 현대적 스택
- 익명/비공개 댓글 등 특화 기능 구현

**약점**:
- 보안 기본기 부족 (토큰 처리, Rate Limiting)
- 커뮤니티 필수 기능 누락 (검색)
- 프로덕션 레벨 안정성 미확보

**총평**:

> 개발자의 기본기는 좋으나, 보안과 실서비스 운영 경험이 부족해 보입니다.
>
> 학습 프로젝트나 소규모 내부 서비스로는 충분하지만, 공개 서비스로 운영하려면 이 문서에서 제시한 **즉시 수정 필요** 항목들을 먼저 해결해야 합니다.
>
> 아키텍처 설계 능력은 있으므로, 보안 베스트 프랙티스와 실서비스 운영 패턴을 학습하면 크게 성장할 것으로 보입니다.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-22 | 최초 작성 |

---

*본 문서는 코드베이스 정적 분석을 통해 작성되었습니다. 실제 운영 환경에서의 동적 분석 결과는 다를 수 있습니다.*
