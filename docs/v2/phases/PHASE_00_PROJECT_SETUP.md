# Phase 00: Project Setup

> 프로젝트 초기 셋업 - 모노레포 구성 및 개발 환경 설정

## 목표

- pnpm workspace 기반 모노레포 구성
- TypeScript, ESLint, Prettier 설정
- apps/web (FE), apps/server (BE) 프로젝트 생성
- 공통 설정 및 스크립트 구성

## 선행 조건

- Node.js 20+ 설치
- pnpm 9+ 설치
- PostgreSQL 데이터베이스 준비

---

## 1. 프로젝트 구조

```
czakuan/
├── apps/
│   ├── web/                    # FE (React + Vite)
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── server/                 # BE (Hono)
│       ├── src/
│       ├── prisma/
│       │   └── schema.prisma
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                   # 공유 패키지 (선택)
│   └── eslint-config/
│       └── index.js
│
├── docs/                       # 문서
│   └── v2/
│
├── pnpm-workspace.yaml
├── package.json                # 루트 package.json
├── tsconfig.base.json          # 공통 TypeScript 설정
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── .env.example
```

---

## 2. 태스크 체크리스트

### 2.1 루트 프로젝트 설정

- [ ] `pnpm-workspace.yaml` 생성
- [ ] 루트 `package.json` 생성
- [ ] `tsconfig.base.json` 생성
- [ ] `.eslintrc.js` 생성
- [ ] `.prettierrc` 생성
- [ ] `.gitignore` 업데이트
- [ ] `.env.example` 생성

### 2.2 BE 프로젝트 (apps/server)

- [ ] `apps/server/package.json` 생성
- [ ] `apps/server/tsconfig.json` 생성
- [ ] `apps/server/src/app/index.ts` 엔트리포인트 생성
- [ ] `apps/server/prisma/schema.prisma` 생성
- [ ] 의존성 설치

### 2.3 FE 프로젝트 (apps/web)

- [ ] `pnpm create vite apps/web --template react-ts`
- [ ] `apps/web/tsconfig.json` 수정
- [ ] Tailwind CSS 설정
- [ ] 의존성 설치

---

## 3. 상세 구현

### 3.1 pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3.2 루트 package.json

```json
{
  "name": "czakuan",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "dev:web": "pnpm --filter @czakuan/web dev",
    "dev:server": "pnpm --filter @czakuan/server dev",
    "build": "pnpm -r build",
    "build:web": "pnpm --filter @czakuan/web build",
    "build:server": "pnpm --filter @czakuan/server build",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "db:generate": "pnpm --filter @czakuan/server db:generate",
    "db:migrate": "pnpm --filter @czakuan/server db:migrate",
    "db:push": "pnpm --filter @czakuan/server db:push",
    "db:studio": "pnpm --filter @czakuan/server db:studio"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "typescript": "^5.3.0"
  }
}
```

### 3.3 tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 3.4 .eslintrc.js

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  ignorePatterns: ["node_modules", "dist", "build"],
};
```

### 3.5 .prettierrc

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 3.6 .gitignore

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build
dist/
build/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Prisma
apps/server/prisma/migrations/

# Test
coverage/

# Misc
*.tsbuildinfo
```

### 3.7 .env.example

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/czakuan?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
KAKAO_REDIRECT_URI="http://localhost:5173/auth/kakao/callback"

# S3
S3_BUCKET="your-s3-bucket"
S3_REGION="ap-northeast-2"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Server
SERVER_PORT=3000
SERVER_URL="http://localhost:3000"

# Client
VITE_API_URL="http://localhost:3000/api"
```

---

## 4. apps/server 설정

### 4.1 apps/server/package.json

```json
{
  "name": "@czakuan/server",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/app/index.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/app/index.js",
    "lint": "eslint src --ext .ts",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@hono/node-server": "^1.8.0",
    "@prisma/client": "^5.9.0",
    "hono": "^4.0.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5",
    "prisma": "^5.9.0",
    "tsc-alias": "^1.8.8",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

### 4.2 apps/server/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.3 apps/server/src/app/index.ts

```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// Middlewares
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// API routes (추후 추가)
app.get("/api", (c) => c.json({ message: "Czakuan API v2" }));

const port = Number(process.env.SERVER_PORT) || 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
```

---

## 5. apps/web 설정

### 5.1 Vite 프로젝트 생성

```bash
cd apps
pnpm create vite web --template react-ts
cd web
pnpm install
```

### 5.2 apps/web/package.json 수정

```json
{
  "name": "@czakuan/web",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint src --ext .ts,.tsx",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### 5.3 apps/web/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5.4 apps/web/vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### 5.5 apps/web/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 5.6 apps/web/postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 5.7 apps/web/src/app/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  @apply bg-gray-50 text-gray-900;
}
```

---

## 6. 설치 및 실행

### 6.1 의존성 설치

```bash
# 루트에서 전체 설치
pnpm install
```

### 6.2 환경 변수 설정

```bash
# .env.example 복사
cp .env.example .env

# 실제 값으로 수정
```

### 6.3 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
pnpm db:generate

# 스키마 푸시 (개발용)
pnpm db:push
```

### 6.4 개발 서버 실행

```bash
# 전체 실행
pnpm dev

# 개별 실행
pnpm dev:server  # BE만
pnpm dev:web     # FE만
```

---

## 7. 검증 체크리스트

- [ ] `pnpm install` 성공
- [ ] `pnpm dev:server` 실행 → http://localhost:3000/health 응답 확인
- [ ] `pnpm dev:web` 실행 → http://localhost:5173 페이지 표시
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 에러 없음
- [ ] Prisma Studio 실행 (`pnpm db:studio`)

---

## 8. 다음 Phase

Phase 00 완료 후 → **Phase 01: BE_DOMAIN.md** (entities, rules, repository interfaces)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
