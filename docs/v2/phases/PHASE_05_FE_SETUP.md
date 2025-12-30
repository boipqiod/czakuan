# Phase 05: FE Setup

> FE 프로젝트 구조 및 초기 설정

## 목표

- FSD 기반 폴더 구조 구성
- React Router, TanStack Query, Zustand 설정
- Tailwind CSS 설정
- Axios 인스턴스 및 API 클라이언트 설정
- 공통 컴포넌트 기반 구축

## 선행 조건

- Phase 00 (Project Setup) 완료
- `apps/web` 프로젝트 생성 완료

---

## 1. 폴더 구조

```
apps/web/src/
├── app/                          # 앱 설정 및 프로바이더
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   └── styles/
│       └── globals.css
│
├── pages/                        # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── PostListPage.tsx
│   ├── PostDetailPage.tsx
│   ├── PostWritePage.tsx
│   ├── MyPage.tsx
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
│
├── features/                     # 기능별 모듈 (UI + hooks + api)
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── KakaoLoginButton.tsx
│   │   │   └── LogoutButton.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── api/
│   │       └── authApi.ts
│   │
│   ├── post/
│   │   ├── ui/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   └── PostForm.tsx
│   │   ├── hooks/
│   │   │   ├── usePostList.ts
│   │   │   ├── usePostDetail.ts
│   │   │   └── usePostMutation.ts
│   │   └── api/
│   │       └── postApi.ts
│   │
│   ├── comment/
│   │   ├── ui/
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   └── CommentForm.tsx
│   │   ├── hooks/
│   │   │   ├── useComments.ts
│   │   │   └── useCommentMutation.ts
│   │   └── api/
│   │       └── commentApi.ts
│   │
│   └── category/
│       ├── ui/
│       │   ├── CategoryList.tsx
│       │   └── CategorySelector.tsx
│       ├── hooks/
│       │   └── useCategories.ts
│       └── api/
│           └── categoryApi.ts
│
├── entities/                     # 타입 정의 및 비즈니스 규칙
│   ├── user/
│   │   ├── types.ts
│   │   └── rules.ts
│   ├── post/
│   │   ├── types.ts
│   │   └── rules.ts
│   ├── comment/
│   │   ├── types.ts
│   │   └── rules.ts
│   └── category/
│       └── types.ts
│
├── infrastructures/              # 외부 서비스 연동
│   ├── api/
│   │   └── client.ts
│   └── storage/
│       └── tokenStorage.ts
│
├── common/                       # 공통 유틸리티
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useInfiniteScroll.ts
│   └── utils/
│       ├── formatDate.ts
│       └── cn.ts
│
└── main.tsx                      # 엔트리포인트
```

---

## 2. 태스크 체크리스트

### 2.1 앱 설정

- [ ] `app/App.tsx` - 루트 컴포넌트
- [ ] `app/router.tsx` - React Router 설정
- [ ] `app/providers/QueryProvider.tsx` - TanStack Query 설정
- [ ] `app/providers/AuthProvider.tsx` - 인증 컨텍스트
- [ ] `app/styles/globals.css` - Tailwind 글로벌 스타일

### 2.2 인프라스트럭처

- [ ] `infrastructures/api/client.ts` - Axios 인스턴스
- [ ] `infrastructures/storage/tokenStorage.ts` - 토큰 저장소

### 2.3 공통 컴포넌트

- [ ] `common/ui/Button.tsx`
- [ ] `common/ui/Input.tsx`
- [ ] `common/ui/Modal.tsx`
- [ ] `common/ui/Loading.tsx`
- [ ] `common/ui/ErrorBoundary.tsx`

### 2.4 공통 유틸리티

- [ ] `common/utils/formatDate.ts`
- [ ] `common/utils/cn.ts`

### 2.5 공통 훅

- [ ] `common/hooks/useLocalStorage.ts`
- [ ] `common/hooks/useInfiniteScroll.ts`

---

## 3. 앱 설정 구현

### 3.1 main.tsx

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.2 app/App.tsx

```typescript
import { QueryProvider } from "@/app/providers/QueryProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { AppRouter } from "@/app/router";

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  );
}
```

### 3.3 app/router.tsx

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { PostListPage } from "@/pages/PostListPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { PostWritePage } from "@/pages/PostWritePage";
import { MyPage } from "@/pages/MyPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { KakaoCallbackPage } from "@/pages/KakaoCallbackPage";
import { ProtectedRoute } from "@/features/auth/ui/ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/posts" element={<PostListPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/posts/write" element={<PostWritePage />} />
          <Route path="/posts/:id/edit" element={<PostWritePage />} />
          <Route path="/my" element={<MyPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3.4 app/providers/QueryProvider.tsx

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분
            gcTime: 1000 * 60 * 30, // 30분
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3.5 app/providers/AuthProvider.tsx

```typescript
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User } from "@/entities/user/types";
import { tokenStorage } from "@/infrastructures/storage/tokenStorage";
import { apiClient } from "@/infrastructures/api/client";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();

      if (token) {
        try {
          const response = await apiClient.get<{ success: boolean; data: User }>("/auth/me");
          if (response.data.success) {
            setUser(response.data.data);
          }
        } catch {
          tokenStorage.clear();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
```

### 3.6 app/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }

  * {
    @apply border-gray-200;
  }
}

/* Custom component styles */
@layer components {
  .container {
    @apply mx-auto max-w-4xl px-4;
  }

  .card {
    @apply rounded-lg border bg-white p-4 shadow-sm;
  }

  .btn {
    @apply inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }

  .btn-secondary {
    @apply btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500;
  }

  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }

  .input {
    @apply w-full rounded-lg border border-gray-300 px-3 py-2;
    @apply focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500;
    @apply disabled:cursor-not-allowed disabled:bg-gray-100;
  }
}

/* Custom utility styles */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## 4. 인프라스트럭처 구현

### 4.1 infrastructures/api/client.ts

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/infrastructures/storage/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고 재시도하지 않았다면 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return apiClient(originalRequest);
        } catch {
          // 갱신 실패 시 로그아웃
          tokenStorage.clear();
          window.location.href = "/login";
        }
      } else {
        // 리프레시 토큰 없으면 로그아웃
        tokenStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
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
```

### 4.2 infrastructures/storage/tokenStorage.ts

```typescript
const ACCESS_TOKEN_KEY = "czakuan_access_token";
const REFRESH_TOKEN_KEY = "czakuan_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
```

---

## 5. 공통 컴포넌트 구현

### 5.1 common/ui/Button.tsx

```typescript
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/common/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### 5.2 common/ui/Input.tsx

```typescript
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/common/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border px-3 py-2",
            "focus:outline-none focus:ring-1",
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
```

### 5.3 common/ui/Modal.tsx

```typescript
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/common/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl",
          className
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
```

### 5.4 common/ui/Loading.tsx

```typescript
import { cn } from "@/common/utils/cn";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loading({ size = "md", className, fullScreen }: LoadingProps) {
  const spinner = (
    <svg
      className={cn("animate-spin text-blue-600", sizeStyles[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80">
        {spinner}
      </div>
    );
  }

  return spinner;
}
```

### 5.5 common/ui/ErrorBoundary.tsx

```typescript
import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/common/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            문제가 발생했습니다
          </h2>
          <p className="mb-4 text-gray-600">
            {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          <Button onClick={this.handleReset}>다시 시도</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 6. 공통 유틸리티 구현

### 6.1 common/utils/cn.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

> **Note**: `clsx`와 `tailwind-merge` 패키지 설치 필요
> ```bash
> pnpm --filter @czakuan/web add clsx tailwind-merge
> ```

### 6.2 common/utils/formatDate.ts

```typescript
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // 1분 미만
  if (diff < 60 * 1000) {
    return "방금 전";
  }

  // 1시간 미만
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}분 전`;
  }

  // 24시간 미만
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}시간 전`;
  }

  // 7일 미만
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}일 전`;
  }

  // 그 외
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
```

---

## 7. 공통 훅 구현

### 7.1 common/hooks/useLocalStorage.ts

```typescript
import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue] as const;
}
```

### 7.2 common/hooks/useInfiniteScroll.ts

```typescript
import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const target = targetRef.current;

    if (!target) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
    });

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return targetRef;
}
```

---

## 8. 추가 패키지 설치

```bash
# apps/web에서 실행
pnpm --filter @czakuan/web add clsx tailwind-merge
pnpm --filter @czakuan/web add @tanstack/react-query-devtools -D
```

---

## 9. Tailwind 설정 업데이트

### 9.1 apps/web/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
```

---

## 10. 검증 체크리스트

- [ ] 폴더 구조 생성 완료
- [ ] `main.tsx` 작성
- [ ] `app/App.tsx` 작성
- [ ] `app/router.tsx` 작성
- [ ] `QueryProvider` 작성
- [ ] `AuthProvider` 작성
- [ ] `globals.css` 작성
- [ ] `apiClient` 작성
- [ ] `tokenStorage` 작성
- [ ] 공통 컴포넌트 작성 (Button, Input, Modal, Loading, ErrorBoundary)
- [ ] 공통 유틸리티 작성 (cn, formatDate)
- [ ] 공통 훅 작성 (useLocalStorage, useInfiniteScroll)
- [ ] TypeScript 컴파일 에러 없음
- [ ] `pnpm dev:web` 실행 성공

---

## 11. 다음 Phase

Phase 05 완료 후 → **Phase 06: FE_ENTITIES.md** (타입 정의 및 비즈니스 규칙)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
