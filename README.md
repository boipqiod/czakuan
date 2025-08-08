# 에대숲 프로젝트 - 모노레포 마이그레이션

에대숲 프로젝트를 **React + Vite** 프론트엔드와 **NestJS** 백엔드로 구성된 **모노레포 구조**로 마이그레이션했습니다.

## 🏗️ 아키텍처

### 모노레포 구조
```
czakuan/
├── apps/
│   ├── frontend/          # React + Vite 프론트엔드
│   └── backend/           # NestJS 백엔드 (DDD 구조)
├── packages/
│   └── shared/            # 공유 타입 및 유틸리티
└── .old_nextjs_app/       # 기존 Next.js 앱 백업
```

### 기술 스택

#### 프론트엔드 (React + Vite)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for routing
- **Zustand** for state management
- **Axios** for API communication

#### 백엔드 (NestJS + DDD)
- **NestJS** with TypeScript
- **Domain-Driven Design (DDD)** architecture
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with Kakao integration
- **Swagger** API documentation
- **Passport** for authentication strategies

## 🎯 도메인 아키텍처 (DDD)

### 도메인 모듈
1. **User Domain** (`/modules/user/`)
   - 사용자 관리, 인증, 프로필 관리
   - JWT + Kakao 로그인 지원

2. **Content Domain** (`/modules/content/`)
   - 게시글, 댓글, 카테고리 관리
   - 게시판 기능

3. **Social Domain** (`/modules/social/`)
   - 좋아요, 싫어요, 신고 기능
   - 소셜 인터랙션

4. **Admin Domain** (`/modules/admin/`)
   - 관리자 기능
   - 카테고리 관리, 사용자 관리

## 🚀 실행 방법

### 개발 환경 실행
```bash
# 모든 의존성 설치
npm install

# 프론트엔드와 백엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:frontend  # http://localhost:5173
npm run dev:backend   # http://localhost:3000
```

### 프로덕션 빌드
```bash
# 전체 빌드
npm run build

# 개별 빌드
npm run build:frontend
npm run build:backend
```

## 📝 API 문서

백엔드 서버 실행 후 Swagger UI 접속:
- **개발**: http://localhost:3000/api
- **API 엔드포인트**:
  - `GET /users` - 사용자 목록
  - `POST /auth/kakao` - 카카오 로그인
  - `GET /posts` - 게시글 목록
  - `GET /categories` - 카테고리 목록

## 🛠️ 개발 도구

### 코드 품질
- **ESLint** + **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks (planned)

### 모니터링
- **Swagger** for API documentation
- **Development tools** with hot reload

## 📊 마이그레이션 현황

### ✅ 완료된 작업
- [x] 모노레포 구조 설정
- [x] NestJS 백엔드 DDD 아키텍처 구현
- [x] React + Vite 프론트엔드 설정
- [x] 기본 API 엔드포인트 구현
- [x] Swagger API 문서화
- [x] JWT 인증 구조 구현
- [x] 개발 환경 설정 완료

### 🚧 진행 중
- [ ] Prisma 클라이언트 연결 (현재 Mock 서비스 사용)
- [ ] 카카오 로그인 완전 구현
- [ ] 기존 UI 컴포넌트 마이그레이션
- [ ] 실제 데이터베이스 연결

### 📋 향후 작업
- [ ] 전체 기능 테스트
- [ ] 성능 최적화
- [ ] 배포 설정

## 🔧 환경 변수

### 백엔드 (.env)
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

### 프론트엔드
```env
VITE_API_URL="http://localhost:3000"
```

---

**에버랜드 캐스트들과 주변 상권 사람들을 위한 커뮤니티 플랫폼**

- [테스트 서버](https://test.czakuan.com)
- [운영 서버](https://www.czakuan.com)
