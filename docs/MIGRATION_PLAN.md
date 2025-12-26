# FE/BE 분리 마이그레이션 계획서

> **문서 버전**: 1.0
> **작성일**: 2025-12-22
> **목적**: 현재 Next.js 모노리식 구조를 Frontend/Backend로 분리하는 마이그레이션 전략 수립

---

## 목차

1. [현재 구조 분석](#1-현재-구조-분석)
2. [목표 구조](#2-목표-구조)
3. [기술 스택 선정](#3-기술-스택-선정)
4. [마이그레이션 전략](#4-마이그레이션-전략)
5. [단계별 실행 계획](#5-단계별-실행-계획)
6. [API 설계](#6-api-설계)
7. [인증 시스템 마이그레이션](#7-인증-시스템-마이그레이션)
8. [데이터베이스 및 인프라](#8-데이터베이스-및-인프라)
9. [리스크 및 대응 방안](#9-리스크-및-대응-방안)
10. [일정 및 마일스톤](#10-일정-및-마일스톤)

---

## 1. 현재 구조 분석

### 1.1 현재 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 (모노리식)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    src/app/                          │   │
│  │              (Pages + Server Components)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                    Server Actions                           │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   src/server/                        │   │
│  │    actions/ → service/ → repositories/ → Prisma     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   src/client/                        │   │
│  │         components/ + hooks/ + store/ + ui/          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

### 1.2 현재 파일 구조

```
src/
├── app/                          # Next.js 페이지 (17개 페이지)
│   ├── (index)/                  # 메인 페이지
│   ├── account/                  # 로그인/회원가입
│   ├── admin/                    # 어드민
│   ├── post/                     # 게시글 CRUD
│   └── user/                     # 사용자 프로필
│
├── server/                       # 백엔드 로직 (BE로 이동 대상)
│   ├── actions/          (6개)   # Server Actions → API로 변환
│   ├── service/          (5개)   # 비즈니스 로직 (재사용)
│   ├── repositories/     (4개)   # 데이터 접근 (재사용)
│   └── modules/          (5개)   # 유틸리티 (재사용)
│
├── client/                       # 프론트엔드 로직 (FE에 유지)
│   ├── components/      (15개)   # React 컴포넌트
│   ├── hooks/            (5개)   # Custom Hooks
│   ├── store/            (4개)   # Zustand Store
│   ├── ui/              (17개)   # UI 위젯/레이아웃
│   └── action/           (1개)   # API 호출 래퍼 → 수정 필요
│
├── types/                        # 공통 타입 (양쪽에서 공유)
└── lib/                          # 유틸리티 (양쪽에서 공유)
```

### 1.3 현재 의존성 분석

| 카테고리 | 패키지 | FE | BE |
|---------|--------|:--:|:--:|
| 프레임워크 | next | ✓ | ✗ |
| UI | react, react-dom | ✓ | ✗ |
| 상태관리 | zustand | ✓ | ✗ |
| 에디터 | react-quill-new | ✓ | ✗ |
| 아이콘 | react-icons | ✓ | ✗ |
| ORM | @prisma/client, prisma | ✗ | ✓ |
| 인증 | jsonwebtoken | ✗ | ✓ |
| 스토리지 | @aws-sdk/client-s3 | ✗ | ✓ |
| HTTP | axios | ✓ | ✗ |
| 날짜 | dayjs | ✓ | ✓ |
| 분석 | firebase | ✓ | ✗ |

### 1.4 Server Actions 현황

| 파일 | 함수 수 | 설명 |
|------|--------|------|
| `auth.actions.ts` | 6개 | 인증 관련 |
| `post.actions.ts` | 12개 | 게시글 CRUD |
| `post.comment.actions.ts` | 7개 | 댓글 CRUD |
| `user.actions.ts` | 3개 | 사용자 정보 |
| `board.actions.ts` | 1개 | 카테고리 조회 |
| **총합** | **29개** | → API 엔드포인트로 변환 |

---

## 2. 목표 구조

### 2.1 분리 후 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              클라이언트                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Frontend (Next.js / Vite)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  Pages/     │  │ Components  │  │   Store     │               │  │
│  │  │  Routes     │  │   + Hooks   │  │  (Zustand)  │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  │                           │                                        │  │
│  │                    API Client (axios/fetch)                        │  │
│  └───────────────────────────┼───────────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │ HTTP/REST API
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              서버                                         │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Backend (NestJS / Express)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │  │
│  │  │ Controllers │→ │  Services   │→ │Repositories │                 │  │
│  │  │  (Routes)   │  │  (기존코드) │  │  (기존코드) │                 │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │  │
│  │         │                                  │                        │  │
│  │    Middleware                         Prisma ORM                    │  │
│  │  (Auth, Logging)                          │                        │  │
│  └───────────────────────────────────────────┼────────────────────────┘  │
└──────────────────────────────────────────────┼───────────────────────────┘
                                               ▼
                                     ┌─────────────────┐
                                     │   PostgreSQL    │
                                     └─────────────────┘
```

### 2.2 분리 후 폴더 구조

```
czakuan/
├── frontend/                      # 프론트엔드 프로젝트
│   ├── src/
│   │   ├── app/                   # 페이지 (기존 유지)
│   │   ├── components/            # 컴포넌트 (client/components 이동)
│   │   ├── hooks/                 # Hooks (client/hooks 이동)
│   │   ├── store/                 # Store (client/store 이동)
│   │   ├── ui/                    # UI (client/ui 이동)
│   │   ├── api/                   # API 클라이언트 (신규)
│   │   ├── types/                 # 타입 정의
│   │   └── lib/                   # 유틸리티
│   ├── package.json
│   └── next.config.ts
│
├── backend/                       # 백엔드 프로젝트
│   ├── src/
│   │   ├── controllers/           # API 컨트롤러 (신규)
│   │   ├── services/              # 서비스 (server/service 이동)
│   │   ├── repositories/          # 레포지토리 (server/repositories 이동)
│   │   ├── modules/               # 모듈 (server/modules 이동)
│   │   ├── middleware/            # 미들웨어 (신규)
│   │   ├── types/                 # 타입 정의
│   │   └── lib/                   # 유틸리티
│   ├── prisma/                    # Prisma 스키마 (이동)
│   ├── package.json
│   └── tsconfig.json
│
└── shared/                        # 공유 패키지 (선택)
    ├── types/                     # 공통 타입
    └── constants/                 # 공통 상수
```

---

## 3. 기술 스택 선정

### 3.1 Backend 프레임워크 비교

| 항목 | NestJS | Express | Fastify |
|------|--------|---------|---------|
| 타입 안정성 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 구조화 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 성능 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 학습 곡선 | 높음 | 낮음 | 중간 |
| 생태계 | 풍부 | 매우 풍부 | 보통 |
| DI 지원 | 내장 | 별도 설정 | 별도 설정 |

### 3.2 권장 스택

#### 옵션 A: NestJS (권장) ⭐

```
Backend: NestJS + Prisma + PostgreSQL
Frontend: Next.js (현재 유지)
```

**선정 이유**:
- 현재 코드가 이미 Service/Repository 패턴 사용 → 마이그레이션 용이
- TypeScript 네이티브 지원
- 데코레이터 기반으로 코드 간결
- Swagger 자동 생성

#### 옵션 B: Express + TypeScript

```
Backend: Express + TypeScript + Prisma
Frontend: Next.js (현재 유지)
```

**선정 이유**:
- 가장 단순하고 빠른 마이그레이션
- 학습 곡선 낮음
- 유연한 구조

#### 옵션 C: Fastify

```
Backend: Fastify + TypeScript + Prisma
Frontend: Vite + React
```

**선정 이유**:
- 최고 성능
- 스키마 기반 검증 내장

### 3.3 최종 권장 스택

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                                │
├─────────────────────────────────────────────────────────────┤
│  Framework    : Next.js 15 (기존 유지)                       │
│  상태관리      : Zustand (기존 유지)                         │
│  HTTP Client  : Axios (기존 유지)                            │
│  스타일        : CSS Modules (기존 유지)                     │
│  빌드 도구     : Turbopack (기존 유지)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Backend                                 │
├─────────────────────────────────────────────────────────────┤
│  Framework    : NestJS 10                                    │
│  ORM          : Prisma (기존 유지)                           │
│  인증          : Passport.js + JWT                           │
│  검증          : class-validator                             │
│  문서화        : Swagger (자동 생성)                         │
│  로깅          : Winston                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure                            │
├─────────────────────────────────────────────────────────────┤
│  Database     : PostgreSQL (기존 유지)                       │
│  Storage      : AWS S3 (기존 유지)                           │
│  Cache        : Redis (신규 추가 권장)                       │
│  Container    : Docker + Docker Compose                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 마이그레이션 전략

### 4.1 전략 비교

| 전략 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **빅뱅** | 한 번에 전체 전환 | 깔끔한 전환 | 높은 리스크 |
| **스트랭글러** | 점진적 전환 | 낮은 리스크 | 복잡도 증가 |
| **병렬 운영** | 양쪽 동시 운영 | 안전한 전환 | 비용 증가 |

### 4.2 권장 전략: 스트랭글러 패턴 (Strangler Fig Pattern)

```
Phase 1: BE 프로젝트 생성 + 핵심 API 구현
         ┌─────────────────────────────────────┐
         │           기존 Next.js              │
         │  ┌─────────────────────────────┐   │
         │  │      Server Actions         │   │
         │  │   (대부분 기능 유지)         │   │
         │  └─────────────────────────────┘   │
         └─────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                  ▼
  ┌─────────────────┐              ┌─────────────────┐
  │  기존 Actions   │              │   신규 API      │
  │  (90% 트래픽)   │              │  (10% 트래픽)   │
  └─────────────────┘              └─────────────────┘

Phase 2: API 점진적 이전
         ┌─────────────────────────────────────┐
         │           기존 Next.js              │
         │  ┌─────────────────────────────┐   │
         │  │      Server Actions         │   │
         │  │   (일부 기능만 유지)         │   │
         │  └─────────────────────────────┘   │
         └─────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                  ▼
  ┌─────────────────┐              ┌─────────────────┐
  │  기존 Actions   │              │   신규 API      │
  │  (30% 트래픽)   │              │  (70% 트래픽)   │
  └─────────────────┘              └─────────────────┘

Phase 3: 완전 분리
  ┌─────────────────┐              ┌─────────────────┐
  │    Frontend     │◄────────────►│    Backend      │
  │   (Next.js)     │    REST API  │   (NestJS)      │
  └─────────────────┘              └─────────────────┘
```

---

## 5. 단계별 실행 계획

### Phase 0: 준비 단계 (1주)

#### 0.1 프로젝트 구조 변경

```bash
# 현재
czakuan/
├── src/
├── prisma/
└── package.json

# 변경 후
czakuan/
├── frontend/          # 기존 코드 이동
│   ├── src/
│   └── package.json
├── backend/           # 신규 생성
│   ├── src/
│   ├── prisma/       # 이동
│   └── package.json
└── docker-compose.yml # 신규
```

#### 0.2 공통 타입 분리

```typescript
// shared/types/user.ts
export interface User {
  id: number;
  nickName: string;
  email?: string;
  role: 'USER' | 'BOARD_ADMIN' | 'SUPER_ADMIN';
  profileImageUrl?: string;
}

// shared/types/post.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  // ...
}

// shared/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

#### 0.3 체크리스트

- [ ] Git 브랜치 전략 수립 (`feature/fe-be-split`)
- [ ] 모노레포 도구 선택 (npm workspaces / turborepo)
- [ ] CI/CD 파이프라인 수정 계획
- [ ] 환경 변수 분리 계획
- [ ] 로컬 개발 환경 구성 (Docker Compose)

---

### Phase 1: Backend 프로젝트 생성 (2주)

#### 1.1 NestJS 프로젝트 초기화

```bash
# backend 폴더 생성
nest new backend --package-manager npm

# 필수 패키지 설치
cd backend
npm install @prisma/client prisma
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
npm install bcrypt jsonwebtoken
npm install winston nest-winston
```

#### 1.2 Prisma 설정 이동

```bash
# prisma 폴더 이동
mv ../prisma ./prisma

# prisma 설정
npx prisma generate
```

#### 1.3 기본 모듈 구조 생성

```
backend/src/
├── app.module.ts
├── main.ts
│
├── auth/                    # 인증 모듈
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       └── roles.decorator.ts
│
├── posts/                   # 게시글 모듈
│   ├── posts.module.ts
│   ├── posts.controller.ts
│   ├── posts.service.ts     # 기존 PostService 이동
│   └── posts.repository.ts  # 기존 PostRepository 이동
│
├── comments/                # 댓글 모듈
│   ├── comments.module.ts
│   ├── comments.controller.ts
│   ├── comments.service.ts
│   └── comments.repository.ts
│
├── users/                   # 사용자 모듈
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.repository.ts
│
├── categories/              # 카테고리 모듈
│   ├── categories.module.ts
│   ├── categories.controller.ts
│   └── categories.service.ts
│
├── common/                  # 공통 모듈
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── s3/
│   │   ├── s3.module.ts
│   │   └── s3.service.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── interceptors/
│       └── logging.interceptor.ts
│
└── config/                  # 설정
    └── configuration.ts
```

#### 1.4 기존 코드 마이그레이션 (Service/Repository)

**기존 코드** (`src/server/service/post.service.ts`):
```typescript
export class PostService {
  constructor(
    private readonly postRepository: PostRepository = new PostRepository(),
  ) {}

  async getPostList(page, limit, categoryId?, subCategoryId?) {
    // ...
  }
}
```

**NestJS 코드** (`backend/src/posts/posts.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,  // DI로 변경
  ) {}

  async getPostList(page: number, limit: number, categoryId?: number, subCategoryId?: number) {
    // 기존 로직 거의 그대로 사용
  }
}
```

#### 1.5 Phase 1 완료 기준

- [ ] NestJS 프로젝트 생성 완료
- [ ] Prisma 연동 완료
- [ ] 기본 모듈 구조 생성
- [ ] Service/Repository 마이그레이션 완료
- [ ] 로컬에서 서버 실행 확인

---

### Phase 2: API 엔드포인트 구현 (3주)

#### 2.1 인증 API

| 메서드 | 엔드포인트 | 기존 Action | 설명 |
|--------|-----------|-------------|------|
| POST | `/auth/kakao` | `kakaoLogin` | 카카오 로그인 |
| POST | `/auth/register` | `register` | 회원가입 |
| POST | `/auth/login` | `login` | 로그인 |
| POST | `/auth/logout` | `logout` | 로그아웃 |
| GET | `/auth/me` | `userInfo` | 현재 사용자 정보 |
| POST | `/auth/refresh` | (verifyUser 내) | 토큰 갱신 |

#### 2.2 게시글 API

| 메서드 | 엔드포인트 | 기존 Action | 설명 |
|--------|-----------|-------------|------|
| GET | `/posts` | `getPostList` | 게시글 목록 |
| GET | `/posts/popular` | `getPopularPostList` | 인기 게시글 |
| GET | `/posts/recent` | `getRecentPostList` | 최근 게시글 |
| GET | `/posts/notices` | `getNoticeList` | 공지사항 목록 |
| GET | `/posts/:id` | `getPostDetail` | 게시글 상세 |
| POST | `/posts` | `createPost` | 게시글 생성 |
| PATCH | `/posts/:id` | `updatePost` | 게시글 수정 |
| DELETE | `/posts/:id` | `deletePost` | 게시글 삭제 |
| POST | `/posts/:id/like` | `likePost` | 좋아요 토글 |
| POST | `/posts/:id/dislike` | `dislikePost` | 싫어요 토글 |
| POST | `/posts/:id/report` | `reportPost` | 신고 |
| POST | `/posts/:id/view` | `increaseViewCountPost` | 조회수 증가 |
| POST | `/posts/upload-image` | `uploadTempPostImage` | 이미지 업로드 |

#### 2.3 댓글 API

| 메서드 | 엔드포인트 | 기존 Action | 설명 |
|--------|-----------|-------------|------|
| GET | `/posts/:postId/comments` | `getCommentList` | 댓글 목록 |
| POST | `/posts/:postId/comments` | `createComment` | 댓글 생성 |
| DELETE | `/comments/:id` | `deleteComment` | 댓글 삭제 |
| POST | `/comments/:id/like` | `likeComment` | 좋아요 토글 |
| POST | `/comments/:id/dislike` | `dislikeComment` | 싫어요 토글 |
| POST | `/comments/:id/report` | `reportComment` | 신고 |

#### 2.4 사용자 API

| 메서드 | 엔드포인트 | 기존 Action | 설명 |
|--------|-----------|-------------|------|
| GET | `/users/me` | `getMyInfo` | 내 정보 |
| GET | `/users/:id` | `getUserInfo` | 사용자 정보 |
| PATCH | `/users/me` | `changeUserInfo` | 정보 수정 |
| POST | `/users/upload-profile` | (changeUserInfo 내) | 프로필 이미지 업로드 |

#### 2.5 카테고리 API

| 메서드 | 엔드포인트 | 기존 Action | 설명 |
|--------|-----------|-------------|------|
| GET | `/categories` | `getCategorise` | 카테고리 목록 |

#### 2.6 관리자 API

| 메서드 | 엔드포인트 | 기존 Action | 설명 |
|--------|-----------|-------------|------|
| GET | `/admin/reports/posts` | `getReportedPostList` | 신고된 게시글 |
| GET | `/admin/reports/comments` | `getReportedCommentList` | 신고된 댓글 |

#### 2.7 API 응답 형식 통일

```typescript
// 성공 응답
{
  "success": true,
  "data": {
    // 실제 데이터
  },
  "meta": {
    "page": 1,
    "lastPage": 10,
    "total": 100
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "로그인이 필요합니다."
  }
}
```

#### 2.8 Phase 2 완료 기준

- [ ] 모든 API 엔드포인트 구현 (29개)
- [ ] Swagger 문서 자동 생성
- [ ] 인증 미들웨어 적용
- [ ] 에러 핸들링 통일
- [ ] Postman/Insomnia 테스트 완료

---

### Phase 3: Frontend API 클라이언트 구현 (2주)

#### 3.1 API 클라이언트 생성

```typescript
// frontend/src/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,  // 쿠키 전송
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 응답 인터셉터 (토큰 갱신)
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.client.request(error.config!);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ... 메서드들
}

export const apiClient = new ApiClient();
```

#### 3.2 API 모듈 분리

```typescript
// frontend/src/api/posts.ts
import { apiClient } from './client';
import { Post, PostList, CreatePostDto } from '@/types';

export const postsApi = {
  getList: (params: { page?: number; categoryId?: number }) =>
    apiClient.get<PostList>('/posts', { params }),

  getDetail: (id: number) =>
    apiClient.get<Post>(`/posts/${id}`),

  create: (data: CreatePostDto) =>
    apiClient.post<{ id: number }>('/posts', data),

  update: (id: number, data: Partial<CreatePostDto>) =>
    apiClient.patch(`/posts/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/posts/${id}`),

  like: (id: number) =>
    apiClient.post(`/posts/${id}/like`),
};

// frontend/src/api/auth.ts
export const authApi = {
  kakaoLogin: (code: string) =>
    apiClient.post('/auth/kakao', { code }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get('/auth/me'),
};

// frontend/src/api/index.ts
export { postsApi } from './posts';
export { authApi } from './auth';
export { commentsApi } from './comments';
export { usersApi } from './users';
```

#### 3.3 기존 Hook 수정

**기존 코드**:
```typescript
// usePost.ts
import { getPostList } from '@/server/actions/post.actions';

export const usePost = () => {
  const fetchPosts = async (page: number, categoryId?: number) => {
    const result = await getPostList(page, 10, categoryId);
    return result.data;
  };
};
```

**수정 후**:
```typescript
// usePost.ts
import { postsApi } from '@/api';

export const usePost = () => {
  const fetchPosts = async (page: number, categoryId?: number) => {
    const response = await postsApi.getList({ page, categoryId });
    return response.data;
  };
};
```

#### 3.4 actionWrapper 대체

**기존**:
```typescript
actionWrapper(getPostList, {
  success: (res) => setPosts(res.data),
  error: (err) => alert(err.statusText),
});
```

**수정 후**:
```typescript
try {
  const response = await postsApi.getList({ page });
  setPosts(response.data);
} catch (error) {
  handleApiError(error);
}

// 또는 React Query 사용
const { data, error, isLoading } = useQuery({
  queryKey: ['posts', page],
  queryFn: () => postsApi.getList({ page }),
});
```

#### 3.5 Phase 3 완료 기준

- [ ] API 클라이언트 구현
- [ ] 모든 API 모듈 작성
- [ ] 기존 actionWrapper 호출 → API 호출로 변경
- [ ] 에러 핸들링 통일
- [ ] 로딩/에러 상태 처리

---

### Phase 4: 점진적 전환 및 테스트 (2주)

#### 4.1 Feature Flag를 통한 점진적 전환

```typescript
// frontend/src/config/features.ts
export const FEATURES = {
  USE_NEW_API: {
    auth: true,       // Phase 4-1
    posts: false,     // Phase 4-2
    comments: false,  // Phase 4-3
    users: false,     // Phase 4-4
  },
};

// 사용 예시
if (FEATURES.USE_NEW_API.posts) {
  return postsApi.getList({ page });
} else {
  return getPostList(page, 10);
}
```

#### 4.2 전환 순서

1. **인증 API 전환** (리스크 낮음)
2. **카테고리 API 전환** (읽기 전용)
3. **게시글 조회 API 전환** (읽기)
4. **게시글 생성/수정/삭제 전환** (쓰기)
5. **댓글 API 전환**
6. **사용자 API 전환**
7. **관리자 API 전환**

#### 4.3 롤백 계획

```typescript
// 문제 발생 시 즉시 롤백
export const FEATURES = {
  USE_NEW_API: {
    auth: false,  // ← false로 변경하면 기존 Server Actions 사용
    posts: false,
    comments: false,
    users: false,
  },
};
```

#### 4.4 Phase 4 완료 기준

- [ ] Feature Flag 시스템 구현
- [ ] 단계별 API 전환 완료
- [ ] E2E 테스트 통과
- [ ] 성능 비교 (기존 vs 신규)
- [ ] 롤백 테스트 완료

---

### Phase 5: 완전 분리 및 정리 (1주)

#### 5.1 Server Actions 코드 제거

```bash
# frontend에서 server 폴더 삭제
rm -rf frontend/src/server/

# 관련 import 정리
# 'use server' 지시문 제거
```

#### 5.2 환경 분리

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=czakuan
      - POSTGRES_USER=...
      - POSTGRES_PASSWORD=...

volumes:
  postgres_data:
```

#### 5.3 배포 파이프라인 분리

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    paths:
      - 'frontend/**'
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & Deploy Frontend
        # ...

# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    paths:
      - 'backend/**'
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & Deploy Backend
        # ...
```

#### 5.4 Phase 5 완료 기준

- [ ] Server Actions 코드 완전 제거
- [ ] 독립 배포 파이프라인 구축
- [ ] Docker Compose 로컬 환경 구성
- [ ] 프로덕션 배포 완료
- [ ] 모니터링 설정

---

## 6. API 설계

### 6.1 인증 흐름

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │Frontend │         │ Backend │         │  Kakao  │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │  1. 카카오 로그인  │                   │                   │
     │──────────────────>│                   │                   │
     │                   │                   │                   │
     │                   │  2. Kakao OAuth   │                   │
     │                   │──────────────────────────────────────>│
     │                   │                   │                   │
     │                   │  3. Auth Code     │                   │
     │                   │<──────────────────────────────────────│
     │                   │                   │                   │
     │                   │  4. POST /auth/kakao                  │
     │                   │     { code }      │                   │
     │                   │──────────────────>│                   │
     │                   │                   │                   │
     │                   │                   │  5. Token 요청    │
     │                   │                   │──────────────────>│
     │                   │                   │                   │
     │                   │                   │  6. User Info     │
     │                   │                   │<──────────────────│
     │                   │                   │                   │
     │                   │  7. JWT Tokens    │                   │
     │                   │     (Cookie)      │                   │
     │                   │<──────────────────│                   │
     │                   │                   │                   │
     │  8. 로그인 완료   │                   │                   │
     │<──────────────────│                   │                   │
     │                   │                   │                   │
```

### 6.2 API 인증

```typescript
// 모든 인증 필요 API 요청
GET /posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// 응답 (토큰 갱신 시)
HTTP/1.1 200 OK
Set-Cookie: access_token=new_token; HttpOnly; Secure
```

### 6.3 에러 코드 정의

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |
| `DUPLICATE` | 409 | 중복 데이터 |
| `RATE_LIMITED` | 429 | 요청 제한 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

---

## 7. 인증 시스템 마이그레이션

### 7.1 현재 방식의 문제점

```typescript
// 현재: 토큰 역순 인코딩 (보안 효과 없음)
const accessToken = _accessToken.split('').toReversed().join('');
```

### 7.2 개선된 인증 방식

```typescript
// backend/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async validateToken(token: string) {
    return this.jwtService.verify(token);
  }
}
```

### 7.3 토큰 저장 방식

| 방식 | 장점 | 단점 |
|------|------|------|
| **HttpOnly Cookie** (권장) | XSS 방어 | CSRF 취약 |
| LocalStorage | 편리함 | XSS 취약 |
| Memory | 가장 안전 | 새로고침 시 소실 |

```typescript
// Backend: 쿠키 설정
res.cookie('access_token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15분
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
});
```

---

## 8. 데이터베이스 및 인프라

### 8.1 DB 변경 사항

- **변경 없음**: 동일한 PostgreSQL, 동일한 스키마 사용
- Prisma 클라이언트만 Backend로 이동

### 8.2 인프라 구성 (권장)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Production                                 │
│                                                                     │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐        │
│  │   Vercel    │      │   Railway   │      │  Supabase   │        │
│  │  (Frontend) │ ──── │  (Backend)  │ ──── │ (PostgreSQL)│        │
│  └─────────────┘      └─────────────┘      └─────────────┘        │
│                              │                                      │
│                       ┌──────┴──────┐                               │
│                       │   AWS S3    │                               │
│                       │  (Images)   │                               │
│                       └─────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 대안 인프라

| 서비스 | Frontend | Backend | Database |
|--------|----------|---------|----------|
| **옵션 1** | Vercel | Railway | Supabase |
| **옵션 2** | Vercel | Render | Neon |
| **옵션 3** | Cloudflare | Fly.io | PlanetScale |
| **옵션 4** | AWS (S3+CF) | AWS (ECS) | AWS (RDS) |

---

## 9. 리스크 및 대응 방안

### 9.1 리스크 매트릭스

| 리스크 | 발생 가능성 | 영향도 | 대응 방안 |
|--------|------------|--------|----------|
| API 호환성 문제 | 높음 | 높음 | 철저한 API 문서화, 테스트 |
| 인증 마이그레이션 실패 | 중간 | 높음 | Feature Flag로 롤백 가능 |
| 성능 저하 | 중간 | 중간 | 캐싱 레이어 추가 |
| CORS 이슈 | 높음 | 낮음 | 사전 CORS 설정 |
| 배포 파이프라인 문제 | 중간 | 중간 | 단계적 배포, 블루-그린 |

### 9.2 롤백 전략

1. **즉시 롤백**: Feature Flag 비활성화
2. **부분 롤백**: 특정 API만 기존 방식 사용
3. **완전 롤백**: 이전 버전 재배포

### 9.3 모니터링 포인트

- API 응답 시간
- 에러율
- 인증 실패율
- DB 커넥션 수
- 메모리 사용량

---

## 10. 일정 및 마일스톤

### 10.1 전체 일정 (약 11주)

```
Week 1      Week 2      Week 3      Week 4      Week 5
────────────────────────────────────────────────────────
│ Phase 0  │     Phase 1      │         Phase 2        │
│  준비    │   BE 프로젝트    │      API 엔드포인트     │
│  (1주)   │     (2주)        │         (3주)          │
────────────────────────────────────────────────────────

Week 6      Week 7      Week 8      Week 9      Week 10     Week 11
──────────────────────────────────────────────────────────────────────
│       Phase 3       │        Phase 4       │    Phase 5    │
│   FE API 클라이언트  │    점진적 전환/테스트  │   완전 분리    │
│        (2주)        │        (2주)          │    (1주)      │
──────────────────────────────────────────────────────────────────────
```

### 10.2 마일스톤

| 마일스톤 | 목표 일정 | 완료 기준 |
|---------|----------|----------|
| M1: BE 프로젝트 생성 | 2주차 | NestJS 기본 구조 완성 |
| M2: 핵심 API 완성 | 5주차 | 29개 API 엔드포인트 동작 |
| M3: FE 연동 완료 | 7주차 | 기존 기능 모두 동작 |
| M4: 전환 완료 | 9주차 | 모든 트래픽 신규 API 경유 |
| M5: 분리 완료 | 11주차 | 독립 배포 가능 |

### 10.3 리소스 계획

| Phase | 필요 인력 | 주요 작업 |
|-------|----------|----------|
| 0 | 1명 | 프로젝트 구조 변경 |
| 1 | 1명 | BE 프로젝트 설정 |
| 2 | 1-2명 | API 구현 |
| 3 | 1명 | FE API 클라이언트 |
| 4 | 1-2명 | 통합 테스트 |
| 5 | 1명 | 배포 및 정리 |

---

## 부록

### A. 체크리스트

#### Phase 0 체크리스트
- [ ] Git 브랜치 생성 (`feature/fe-be-split`)
- [ ] 모노레포 구조 결정
- [ ] 공통 타입 분리
- [ ] Docker Compose 초안 작성
- [ ] 팀 리뷰 및 승인

#### Phase 1 체크리스트
- [ ] NestJS 프로젝트 생성
- [ ] Prisma 설정 이동
- [ ] 기본 모듈 구조 생성
- [ ] Service/Repository 마이그레이션
- [ ] Health Check API 동작 확인

#### Phase 2 체크리스트
- [ ] 인증 API 구현 (6개)
- [ ] 게시글 API 구현 (12개)
- [ ] 댓글 API 구현 (7개)
- [ ] 사용자 API 구현 (3개)
- [ ] 카테고리 API 구현 (1개)
- [ ] Swagger 문서 생성
- [ ] Postman 테스트 완료

#### Phase 3 체크리스트
- [ ] API 클라이언트 구현
- [ ] 에러 핸들링 유틸리티
- [ ] 기존 Hook 수정
- [ ] 기존 컴포넌트 수정
- [ ] 로딩/에러 상태 처리

#### Phase 4 체크리스트
- [ ] Feature Flag 시스템 구현
- [ ] 인증 API 전환
- [ ] 게시글 API 전환
- [ ] 댓글 API 전환
- [ ] 전체 기능 테스트
- [ ] 성능 테스트

#### Phase 5 체크리스트
- [ ] Server Actions 코드 제거
- [ ] 불필요한 의존성 제거
- [ ] Docker 빌드 확인
- [ ] CI/CD 파이프라인 수정
- [ ] 프로덕션 배포
- [ ] 모니터링 설정

---

### B. 참고 명령어

```bash
# NestJS 프로젝트 생성
nest new backend

# 모듈 생성
nest g module posts
nest g controller posts
nest g service posts

# Prisma 설정
npx prisma init
npx prisma generate
npx prisma migrate dev

# Docker 실행
docker-compose up -d

# 테스트
npm run test
npm run test:e2e
```

---

### C. 관련 문서

- [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) - 서비스 기획문서
- [ERD.md](./ERD.md) - 데이터베이스 설계
- [TECHNICAL_REVIEW.md](./TECHNICAL_REVIEW.md) - 기술 리뷰

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-22 | 최초 작성 |

---

*본 문서는 현재 코드베이스 분석을 기반으로 작성되었습니다. 실제 마이그레이션 시 상황에 따라 조정이 필요할 수 있습니다.*
