# Phase 10: Integration & Deployment

> FE/BE 통합 테스트 및 배포

## 목표

- FE/BE 통합 테스트
- 개발/스테이징/프로덕션 환경 설정
- Docker 컨테이너화
- CI/CD 파이프라인 구성
- 배포

## 선행 조건

- Phase 00 ~ 09 모두 완료
- BE 서버 구동 확인
- FE 개발 서버 구동 확인

---

## 1. 환경 변수 설정

### 1.1 apps/server/.env

```env
# Server
SERVER_PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/czakuan?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
KAKAO_REDIRECT_URI="http://localhost:5173/auth/kakao/callback"

# S3 (Optional)
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### 1.2 apps/web/.env

```env
# API
VITE_API_URL="http://localhost:3000/api"

# Kakao OAuth
VITE_KAKAO_CLIENT_ID="your-kakao-javascript-key"
VITE_KAKAO_REDIRECT_URI="http://localhost:5173/auth/kakao/callback"
```

### 1.3 환경별 설정

```
apps/server/
├── .env                  # 로컬 개발용 (git ignore)
├── .env.example          # 템플릿
├── .env.staging          # 스테이징
└── .env.production       # 프로덕션

apps/web/
├── .env                  # 로컬 개발용 (git ignore)
├── .env.example          # 템플릿
├── .env.staging          # 스테이징
└── .env.production       # 프로덕션
```

---

## 2. Docker 설정

### 2.1 루트 docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: czakuan-db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: czakuan
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d czakuan"]
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    container_name: czakuan-server
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/czakuan?schema=public
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/server:/app/apps/server
      - /app/node_modules
      - /app/apps/server/node_modules

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: czakuan-web
    ports:
      - "5173:5173"
    depends_on:
      - server
    volumes:
      - ./apps/web:/app/apps/web
      - /app/node_modules
      - /app/apps/web/node_modules

volumes:
  postgres_data:
```

### 2.2 apps/server/Dockerfile

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .
RUN pnpm --filter @czakuan/server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/apps/server/prisma ./prisma

RUN pnpm prisma generate

EXPOSE 3000
CMD ["node", "dist/app/index.js"]
```

### 2.3 apps/web/Dockerfile

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
RUN pnpm --filter @czakuan/web build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.4 apps/web/nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://server:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 3. CI/CD 파이프라인

### 3.1 .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: czakuan_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run migrations
        run: pnpm --filter @czakuan/server prisma migrate deploy
        env:
          DATABASE_URL: postgresql://user:password@localhost:5432/czakuan_test?schema=public

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://user:password@localhost:5432/czakuan_test?schema=public

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
```

### 3.2 .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push server
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/server/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/server:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/web:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app/czakuan
            docker compose pull
            docker compose up -d
            docker image prune -f
```

---

## 4. 테스트 설정

### 4.1 vitest.config.ts (루트)

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 4.2 apps/server/vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 4.3 apps/web/vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 4.4 apps/web/src/test/setup.ts

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

---

## 5. package.json 스크립트

### 5.1 루트 package.json

```json
{
  "name": "czakuan",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter @czakuan/* dev",
    "dev:server": "pnpm --filter @czakuan/server dev",
    "dev:web": "pnpm --filter @czakuan/web dev",
    "build": "pnpm --filter @czakuan/* build",
    "lint": "pnpm --filter @czakuan/* lint",
    "type-check": "pnpm --filter @czakuan/* type-check",
    "test": "pnpm --filter @czakuan/* test",
    "test:coverage": "pnpm --filter @czakuan/* test:coverage",
    "db:migrate": "pnpm --filter @czakuan/server prisma migrate dev",
    "db:push": "pnpm --filter @czakuan/server prisma db push",
    "db:seed": "pnpm --filter @czakuan/server prisma db seed",
    "db:studio": "pnpm --filter @czakuan/server prisma studio",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

### 5.2 apps/server/package.json 스크립트

```json
{
  "scripts": {
    "dev": "tsx watch src/app/index.ts",
    "build": "tsc",
    "start": "node dist/app/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 5.3 apps/web/package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 6. 통합 테스트 체크리스트

### 6.1 인증 플로우

- [ ] 카카오 로그인 URL 리다이렉트
- [ ] 카카오 콜백 처리 및 토큰 저장
- [ ] 토큰 자동 갱신
- [ ] 로그아웃

### 6.2 게시글 플로우

- [ ] 게시글 목록 조회 (무한 스크롤)
- [ ] 카테고리 필터링
- [ ] 검색
- [ ] 게시글 상세 조회
- [ ] 게시글 작성 (로그인 필수)
- [ ] 게시글 수정/삭제
- [ ] 좋아요/싫어요 리액션
- [ ] 신고

### 6.3 댓글 플로우

- [ ] 댓글 목록 조회
- [ ] 댓글 작성
- [ ] 대댓글 작성
- [ ] 댓글 수정/삭제
- [ ] 익명 댓글
- [ ] 비밀 댓글

### 6.4 마이페이지

- [ ] 프로필 조회
- [ ] 프로필 수정
- [ ] 내가 쓴 글 조회
- [ ] 내가 쓴 댓글 조회

### 6.5 에러 처리

- [ ] 404 페이지
- [ ] API 에러 처리
- [ ] 네트워크 에러 처리

---

## 7. 배포 체크리스트

### 7.1 사전 준비

- [ ] 도메인 설정
- [ ] SSL 인증서 발급
- [ ] 서버 인스턴스 준비
- [ ] PostgreSQL 데이터베이스 준비
- [ ] 환경 변수 설정

### 7.2 배포 단계

- [ ] Docker 이미지 빌드
- [ ] 데이터베이스 마이그레이션
- [ ] 서버 배포
- [ ] 웹 배포
- [ ] 헬스체크 확인

### 7.3 배포 후 확인

- [ ] 서버 응답 확인 (`/health`)
- [ ] 웹 페이지 로딩 확인
- [ ] 카카오 로그인 테스트
- [ ] 기본 기능 테스트

---

## 8. 모니터링

### 8.1 로그 설정

```typescript
// apps/server/src/common/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});
```

### 8.2 에러 트래킹 (Sentry 예시)

```typescript
// apps/server/src/app/index.ts
import * as Sentry from "@sentry/node";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}
```

---

## 9. 최종 검증

### 9.1 성능

- [ ] 페이지 로딩 시간 < 3초
- [ ] API 응답 시간 < 500ms
- [ ] Lighthouse 점수 80+

### 9.2 보안

- [ ] HTTPS 적용
- [ ] CORS 설정 확인
- [ ] 환경 변수 보안
- [ ] SQL Injection 방지 (Prisma)
- [ ] XSS 방지

### 9.3 접근성

- [ ] 키보드 네비게이션
- [ ] 스크린 리더 호환
- [ ] 색상 대비

---

## 10. 문서화

### 10.1 API 문서

- Swagger/OpenAPI 또는 Postman Collection 준비

### 10.2 개발 가이드

- 로컬 개발 환경 설정 가이드
- 코딩 컨벤션 문서
- Git 워크플로우 가이드

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
