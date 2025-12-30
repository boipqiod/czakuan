# Frontend Architecture

> 마지막 업데이트: 2025-12-30

## 1. 개요

### 1.1 기술 스택

| 영역 | 기술 |
|------|------|
| **Framework** | React 18 + Vite |
| **Language** | TypeScript |
| **Routing** | React Router v6 |
| **Server State** | TanStack Query (React Query) |
| **Client State** | Zustand |
| **Styling** | Tailwind CSS |
| **HTTP Client** | Axios |

### 1.2 아키텍처 패턴

**FSD (Feature-Sliced Design) 변형** 기반 레이어드 아키텍처

- 레이어 간 명확한 의존성 방향
- 도메인(기능)별 코드 분리
- 병렬 작업에 최적화

---

## 2. 폴더 구조

```
apps/web/src/
│
├── app/                              # 🚀 App Layer (앱 초기화)
│   ├── App.tsx                       # 라우터 + providers 조합
│   ├── providers.tsx                 # QueryClientProvider 등
│   ├── router.tsx                    # React Router 설정
│   ├── main.tsx                      # 엔트리포인트
│   └── styles/
│       └── globals.css               # 전역 스타일 + Tailwind
│
├── pages/                            # 📄 Pages Layer (라우팅 진입점)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── KakaoCallbackPage.tsx
│   ├── PostListPage.tsx
│   ├── PostDetailPage.tsx
│   ├── PostWritePage.tsx
│   ├── PostEditPage.tsx
│   ├── MyPage.tsx
│   └── NotFoundPage.tsx
│
├── features/                         # ⚡ Features Layer (도메인별 기능)
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── KakaoLoginButton.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── model/
│   │   │   └── authStore.ts          # Zustand store
│   │   └── api/
│   │       ├── authApi.ts            # Axios 호출
│   │       └── authQueries.ts        # TanStack Query hooks
│   │
│   ├── post/
│   │   ├── ui/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostForm.tsx
│   │   │   └── PostReaction.tsx
│   │   ├── model/
│   │   │   └── postStore.ts          # 필요시
│   │   └── api/
│   │       ├── postApi.ts
│   │       └── postQueries.ts
│   │
│   ├── comment/
│   │   ├── ui/
│   │   │   ├── CommentCard.tsx
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentReaction.tsx
│   │   └── api/
│   │       ├── commentApi.ts
│   │       └── commentQueries.ts
│   │
│   ├── category/
│   │   ├── ui/
│   │   │   ├── CategoryNav.tsx
│   │   │   └── CategorySelector.tsx
│   │   ├── model/
│   │   │   └── categoryStore.ts
│   │   └── api/
│   │       ├── categoryApi.ts
│   │       └── categoryQueries.ts
│   │
│   └── user/
│       ├── ui/
│       │   ├── UserAvatar.tsx
│       │   ├── UserProfile.tsx
│       │   └── UserEditForm.tsx
│       └── api/
│           ├── userApi.ts
│           └── userQueries.ts
│
├── entities/                         # 📦 Entities Layer (타입 + 비즈니스 규칙)
│   ├── post/
│   │   ├── types.ts                  # Post, CreatePostRequest 등
│   │   └── rules.ts                  # validateTitle(), isEditable() 등
│   ├── comment/
│   │   ├── types.ts
│   │   └── rules.ts
│   ├── category/
│   │   └── types.ts
│   ├── user/
│   │   ├── types.ts
│   │   └── rules.ts
│   └── reaction/
│       └── types.ts
│
├── infrastructures/                  # 🔌 Infrastructures Layer (외부 의존성)
│   ├── api/
│   │   ├── client.ts                 # Axios 인스턴스 + 인터셉터
│   │   └── queryClient.ts            # TanStack Query Client
│   ├── storage/
│   │   └── tokenStorage.ts           # localStorage 래퍼
│   └── kakao/
│       └── kakaoSdk.ts               # 카카오 SDK 초기화
│
└── common/                           # 🧩 Common Layer (공용, 의존성 없음)
    ├── ui/
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Textarea.tsx
    │   ├── Modal.tsx
    │   ├── Loading.tsx
    │   ├── Spinner.tsx
    │   ├── Pagination.tsx
    │   └── ErrorBoundary.tsx
    ├── layouts/
    │   ├── DefaultLayout.tsx
    │   ├── Header.tsx
    │   └── Sidebar.tsx
    ├── hooks/
    │   └── useModal.ts
    ├── utils/
    │   ├── formatDate.ts
    │   ├── formatNumber.ts
    │   └── cn.ts                     # tailwind-merge 유틸
    └── constants/
        └── queryKeys.ts              # TanStack Query keys
```

---

## 3. 레이어 설명

### 3.1 app/

앱 초기화 담당. Provider 설정, 라우터 구성.

```typescript
// app/providers.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/infrastructures/api/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 3.2 pages/

라우팅 진입점. 레이아웃과 feature 컴포넌트 조합.

```typescript
// pages/PostListPage.tsx
import { DefaultLayout } from "@/common/layouts/DefaultLayout";
import { PostList } from "@/features/post/ui/PostList";
import { CategoryNav } from "@/features/category/ui/CategoryNav";

export function PostListPage() {
  return (
    <DefaultLayout>
      <CategoryNav />
      <PostList />
    </DefaultLayout>
  );
}
```

### 3.3 features/

도메인별 기능 구현. UI + Model + API 포함.

| 폴더 | 역할 |
|------|------|
| `ui/` | React 컴포넌트 |
| `model/` | Zustand store (클라이언트 상태) |
| `api/` | API 호출 함수 + TanStack Query hooks |

```typescript
// 직접 import (barrel export 사용 안함)
import { PostCard } from "@/features/post/ui/PostCard";
import { PostList } from "@/features/post/ui/PostList";
import { usePostList, useCreatePost } from "@/features/post/api/postQueries";
```

### 3.4 entities/

순수 타입 정의 + 비즈니스 규칙. **UI 없음**.

```typescript
// entities/post/types.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  categoryId: number;
  likeCount: number;
  dislikeCount: number;
  views: number;
  isNotice: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: number;
  subCategoryId?: number;
}

export interface PostListResponse {
  posts: Post[];
  pagination: Pagination;
}
```

```typescript
// entities/post/rules.ts
import type { Post } from "./types";

export const POST_TITLE_MAX_LENGTH = 100;
export const POST_CONTENT_MAX_LENGTH = 10000;

export function validateTitle(title: string): boolean {
  return title.length >= 1 && title.length <= POST_TITLE_MAX_LENGTH;
}

export function validateContent(content: string): boolean {
  return content.length >= 1 && content.length <= POST_CONTENT_MAX_LENGTH;
}

export function isEditable(post: Post, userId: number): boolean {
  return post.authorId === userId;
}

export function getPreview(content: string, maxLength = 100): string {
  return content.length > maxLength
    ? content.slice(0, maxLength) + "..."
    : content;
}
```

### 3.5 infrastructures/

외부 서비스/라이브러리 연동. Axios, Storage, SDK 등.

```typescript
// infrastructures/api/client.ts
import axios from "axios";
import { tokenStorage } from "../storage/tokenStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
    }
    return Promise.reject(error);
  }
);
```

### 3.6 common/

프로젝트 전역에서 사용하는 공용 코드. **다른 레이어에 의존하지 않음**.

- `ui/`: Button, Input 등 공용 UI 컴포넌트
- `layouts/`: 페이지 레이아웃
- `hooks/`: 공용 커스텀 훅
- `utils/`: 유틸리티 함수
- `constants/`: 상수 정의

---

## 4. 레이어 의존성 규칙

```
┌─────────────────────────────────────────────────────┐
│  app                                                │
│    ↓ (import 가능)                                  │
├─────────────────────────────────────────────────────┤
│  pages                                              │
│    ↓                                                │
├─────────────────────────────────────────────────────┤
│  features                                           │
│    ↓                                                │
├─────────────────────────────────────────────────────┤
│  entities                                           │
│    ↓                                                │
├─────────────────────────────────────────────────────┤
│  infrastructures  ←───────────────────────────────  │ (어느 레이어에서든 사용)
├─────────────────────────────────────────────────────┤
│  common           ←───────────────────────────────  │ (어느 레이어에서든 사용)
└─────────────────────────────────────────────────────┘
```

### 규칙

1. **위에서 아래로만 import** (pages → features → entities)
2. **같은 레이어 내 다른 slice import 금지** (features/post → features/comment ❌)
3. **infrastructures, common은 어디서든 import 가능**
4. **순환 의존성 금지**

---

## 5. 상태 관리

### 5.1 역할 분담

| 상태 유형 | 도구 | 위치 |
|-----------|------|------|
| **서버 상태** (API 데이터) | TanStack Query | `features/*/api/*Queries.ts` |
| **클라이언트 상태** (UI, 세션) | Zustand | `features/*/model/*Store.ts` |

### 5.2 TanStack Query 사용

```typescript
// features/post/api/postApi.ts
import { apiClient } from "@/infrastructures/api/client";
import type { Post, CreatePostRequest, PostListResponse } from "@/entities/post/types";

export const postApi = {
  getList: async (params: { categoryId: number; page?: number }): Promise<PostListResponse> => {
    const { data } = await apiClient.get("/posts", { params });
    return data.data;
  },

  getDetail: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get(`/posts/${id}`);
    return data.data;
  },

  create: async (body: CreatePostRequest): Promise<{ id: number }> => {
    const { data } = await apiClient.post("/posts", body);
    return data.data;
  },

  update: async (id: number, body: Partial<CreatePostRequest>): Promise<{ id: number }> => {
    const { data } = await apiClient.patch(`/posts/${id}`, body);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};
```

```typescript
// features/post/api/postQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "./postApi";
import { QUERY_KEYS } from "@/common/constants/queryKeys";

export const usePostList = (categoryId: number, page = 1) => {
  return useQuery({
    queryKey: QUERY_KEYS.POST.LIST(categoryId, page),
    queryFn: () => postApi.getList({ categoryId, page }),
  });
};

export const usePostDetail = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.POST.DETAIL(id),
    queryFn: () => postApi.getDetail(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<CreatePostRequest> }) =>
      postApi.update(id, body),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.DETAIL(id) });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
```

### 5.3 Query Keys 관리

```typescript
// common/constants/queryKeys.ts
export const QUERY_KEYS = {
  POST: {
    LIST: (categoryId: number, page: number) => ["posts", "list", categoryId, page] as const,
    DETAIL: (id: number) => ["posts", "detail", id] as const,
  },
  COMMENT: {
    LIST: (postId: number, page: number) => ["comments", "list", postId, page] as const,
  },
  CATEGORY: {
    ALL: ["categories"] as const,
  },
  USER: {
    ME: ["user", "me"] as const,
    MY_POSTS: (page: number) => ["user", "me", "posts", page] as const,
    MY_COMMENTS: (page: number) => ["user", "me", "comments", page] as const,
  },
} as const;
```

### 5.4 Zustand 사용

```typescript
// features/auth/model/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/entities/user";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);
```

```typescript
// features/category/model/categoryStore.ts
import { create } from "zustand";

interface CategoryState {
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  setCategory: (categoryId: number, subCategoryId?: number) => void;
  clearCategory: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  selectedCategoryId: null,
  selectedSubCategoryId: null,
  setCategory: (categoryId, subCategoryId) =>
    set({ selectedCategoryId: categoryId, selectedSubCategoryId: subCategoryId ?? null }),
  clearCategory: () =>
    set({ selectedCategoryId: null, selectedSubCategoryId: null }),
}));
```

---

## 6. Import 별칭 (Path Alias)

```typescript
// vite.config.ts
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
});
```

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
// ❌ 상대 경로 (비권장)
import { Button } from "../../../common/ui/Button";

// ✅ 별칭 사용 (권장)
import { Button } from "@/common/ui";
```

---

## 7. 병렬 작업 가이드

### 7.1 작업 단위

각 feature는 독립적으로 개발 가능:

| Feature | 담당 | 의존성 |
|---------|------|--------|
| `auth` | A | infrastructures 완료 후 |
| `post` | B | entities/post 완료 후 |
| `comment` | C | entities/comment 완료 후 |
| `category` | D | entities/category 완료 후 |
| `user` | A | entities/user 완료 후 |

### 7.2 선행 작업

병렬 작업 전 완료 필요:

1. `common/` - 공용 UI, 유틸
2. `infrastructures/` - API client, storage
3. `entities/` - 타입 정의

### 7.3 충돌 방지

- 각자 담당 feature 폴더에서만 작업
- common, entities 수정 시 PR 리뷰 필수
- 직접 import 사용 (barrel export 금지)

---

## 8. 파일 생성 체크리스트

### 새 Feature 추가 시

```
features/{feature-name}/
├── ui/
│   └── {ComponentName}.tsx
├── model/
│   └── {feature}Store.ts (필요시)
└── api/
    ├── {feature}Api.ts
    └── {feature}Queries.ts
```

### 새 Entity 추가 시

```
entities/{entity-name}/
├── types.ts
└── rules.ts (필요시)
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
| 1.1 | 2025-12-30 | barrel export 제거, 직접 import 사용 |
