# Phase 07: FE Features - Auth

> 인증 관련 기능 구현

## 목표

- 카카오 OAuth 로그인 구현
- 토큰 관리 (저장, 갱신, 삭제)
- 인증 상태 관리
- Protected Route 구현
- 로그인/로그아웃 UI 컴포넌트

## 선행 조건

- Phase 05 (FE Setup) 완료
- Phase 06 (FE Entities) 완료

---

## 1. 폴더 구조

```
apps/web/src/features/auth/
├── ui/
│   ├── KakaoLoginButton.tsx
│   ├── LogoutButton.tsx
│   ├── ProtectedRoute.tsx
│   ├── UserMenu.tsx
│   └── LoginPrompt.tsx
│
├── hooks/
│   ├── useAuth.ts
│   └── useKakaoLogin.ts
│
└── api/
    └── authApi.ts
```

---

## 2. 태스크 체크리스트

### 2.1 API

- [ ] `api/authApi.ts` - 인증 API 함수

### 2.2 Hooks

- [ ] `hooks/useAuth.ts` - 인증 상태 관리 훅
- [ ] `hooks/useKakaoLogin.ts` - 카카오 로그인 훅

### 2.3 UI

- [ ] `ui/KakaoLoginButton.tsx` - 카카오 로그인 버튼
- [ ] `ui/LogoutButton.tsx` - 로그아웃 버튼
- [ ] `ui/ProtectedRoute.tsx` - 인증 필요 라우트
- [ ] `ui/UserMenu.tsx` - 사용자 메뉴 (헤더용)
- [ ] `ui/LoginPrompt.tsx` - 로그인 유도 컴포넌트

---

## 3. API 구현

### 3.1 features/auth/api/authApi.ts

```typescript
import { apiClient, ApiResponse } from "@/infrastructures/api/client";
import { User, LoginResponse, AuthTokens } from "@/entities/user/types";

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export const authApi = {
  // 카카오 로그인 URL 생성
  getKakaoLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      response_type: "code",
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  },

  // 카카오 인가 코드로 로그인
  async kakaoLogin(code: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/kakao",
      { code }
    );

    return response.data.data;
  },

  // 토큰 갱신
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      "/auth/refresh",
      { refreshToken }
    );

    return response.data.data;
  },

  // 로그아웃
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  // 내 정보 조회
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },
};
```

---

## 4. Hooks 구현

### 4.1 features/auth/hooks/useAuth.ts

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/api/authApi";
import { tokenStorage } from "@/infrastructures/storage/tokenStorage";
import { User } from "@/entities/user/types";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// 현재 사용자 정보 조회
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    enabled: !!tokenStorage.getAccessToken(),
    staleTime: 1000 * 60 * 5, // 5분
    retry: false,
  });
}

// 인증 상태
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}

// 로그아웃
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      tokenStorage.clear();
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.clear();
      navigate("/");
    },
    onError: () => {
      // 에러가 나도 로컬 토큰은 삭제
      tokenStorage.clear();
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.clear();
      navigate("/");
    },
  });
}

// 사용자 정보 업데이트 (로그인 후)
export function useSetUser() {
  const queryClient = useQueryClient();

  return (user: User | null) => {
    queryClient.setQueryData(authKeys.me(), user);
  };
}
```

### 4.2 features/auth/hooks/useKakaoLogin.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { tokenStorage } from "@/infrastructures/storage/tokenStorage";
import { authKeys } from "@/features/auth/hooks/useAuth";

// 카카오 로그인 URL로 리다이렉트
export function useKakaoLoginRedirect() {
  return () => {
    const loginUrl = authApi.getKakaoLoginUrl();
    window.location.href = loginUrl;
  };
}

// 카카오 콜백 처리
export function useKakaoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const mutation = useMutation({
    mutationFn: authApi.kakaoLogin,
    onSuccess: (data) => {
      // 토큰 저장
      tokenStorage.setAccessToken(data.tokens.accessToken);
      tokenStorage.setRefreshToken(data.tokens.refreshToken);

      // 사용자 정보 캐시
      queryClient.setQueryData(authKeys.me(), data.user);

      // 신규 사용자면 프로필 설정 페이지로
      if (data.isNewUser) {
        navigate("/my/profile/edit", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    },
    onError: () => {
      navigate("/login?error=login_failed", { replace: true });
    },
  });

  useEffect(() => {
    if (error) {
      navigate("/login?error=kakao_denied", { replace: true });
      return;
    }

    if (code && !mutation.isPending && !mutation.isSuccess) {
      mutation.mutate(code);
    }
  }, [code, error, mutation, navigate]);

  return {
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
```

---

## 5. UI 컴포넌트 구현

### 5.1 features/auth/ui/KakaoLoginButton.tsx

```typescript
import { useKakaoLoginRedirect } from "@/features/auth/hooks/useKakaoLogin";
import { cn } from "@/common/utils/cn";

interface KakaoLoginButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function KakaoLoginButton({ className, size = "md" }: KakaoLoginButtonProps) {
  const redirectToKakao = useKakaoLoginRedirect();

  return (
    <button
      onClick={redirectToKakao}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "bg-[#FEE500] text-[#000000] hover:bg-[#FDD835]",
        sizeStyles[size],
        className
      )}
    >
      <KakaoIcon />
      <span>카카오로 시작하기</span>
    </button>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 3C5.58172 3 2 5.80558 2 9.25C2 11.3722 3.36975 13.2389 5.46063 14.3244L4.42837 17.6756C4.36097 17.9013 4.62097 18.0825 4.81525 17.9438L8.80237 15.2681C9.19375 15.3227 9.59375 15.35 10 15.35C14.4183 15.35 18 12.5444 18 9.1C18 5.65558 14.4183 3 10 3Z"
        fill="#000000"
      />
    </svg>
  );
}
```

### 5.2 features/auth/ui/LogoutButton.tsx

```typescript
import { useLogout } from "@/features/auth/hooks/useAuth";
import { Button } from "@/common/ui/Button";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const logout = useLogout();

  return (
    <Button
      variant="ghost"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className={className}
    >
      {logout.isPending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
```

### 5.3 features/auth/ui/ProtectedRoute.tsx

```typescript
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Loading } from "@/common/ui/Loading";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    // 로그인 후 원래 페이지로 돌아오기 위해 현재 경로 저장
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
```

### 5.4 features/auth/ui/UserMenu.tsx

```typescript
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useLogout } from "@/features/auth/hooks/useAuth";
import { cn } from "@/common/utils/cn";

export function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.nickname}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
            {user.nickname.charAt(0)}
          </div>
        )}
        <span className="hidden text-sm font-medium md:block">{user.nickname}</span>
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-white py-1 shadow-lg">
          <div className="border-b px-4 py-2">
            <p className="text-sm font-medium">{user.nickname}</p>
            <p className="text-xs text-gray-500">{user.role === "ADMIN" ? "관리자" : "회원"}</p>
          </div>

          <Link
            to="/my"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            마이페이지
          </Link>

          <Link
            to="/my/posts"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            내가 쓴 글
          </Link>

          <Link
            to="/my/comments"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            내가 쓴 댓글
          </Link>

          <div className="border-t">
            <button
              onClick={() => {
                setIsOpen(false);
                logout.mutate();
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
```

### 5.5 features/auth/ui/LoginPrompt.tsx

```typescript
import { Link } from "react-router-dom";
import { Button } from "@/common/ui/Button";

interface LoginPromptProps {
  message?: string;
  actionText?: string;
}

export function LoginPrompt({
  message = "로그인이 필요한 기능입니다.",
  actionText = "로그인하기",
}: LoginPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-gray-600">{message}</p>
      <Link to="/login">
        <Button>{actionText}</Button>
      </Link>
    </div>
  );
}
```

---

## 6. 페이지 컴포넌트

### 6.1 pages/LoginPage.tsx

```typescript
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { KakaoLoginButton } from "@/features/auth/ui/KakaoLoginButton";
import { Loading } from "@/common/ui/Loading";

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = (location.state as { from?: string })?.from || "/";
  const error = searchParams.get("error");

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">에대숲</h1>
            <p className="mt-2 text-gray-600">에브리타임 대나무숲</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error === "kakao_denied"
                ? "카카오 로그인이 취소되었습니다."
                : "로그인에 실패했습니다. 다시 시도해주세요."}
            </div>
          )}

          <KakaoLoginButton size="lg" />

          <p className="mt-6 text-center text-xs text-gray-500">
            로그인하면{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              이용약관
            </a>
            과{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              개인정보처리방침
            </a>
            에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 6.2 pages/KakaoCallbackPage.tsx

```typescript
import { useKakaoCallback } from "@/features/auth/hooks/useKakaoLogin";
import { Loading } from "@/common/ui/Loading";

export function KakaoCallbackPage() {
  const { isLoading, error } = useKakaoCallback();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">로그인 실패</h1>
          <p className="mt-2 text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600">로그인 중...</p>
      </div>
    </div>
  );
}
```

---

## 7. 환경 변수

### 7.1 .env.example 추가

```env
# Kakao OAuth
VITE_KAKAO_CLIENT_ID="your-kakao-client-id"
VITE_KAKAO_REDIRECT_URI="http://localhost:5173/auth/kakao/callback"
```

### 7.2 apps/web/src/vite-env.d.ts

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_KAKAO_CLIENT_ID: string;
  readonly VITE_KAKAO_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 8. 검증 체크리스트

- [ ] `api/authApi.ts` 생성
- [ ] `hooks/useAuth.ts` 생성
- [ ] `hooks/useKakaoLogin.ts` 생성
- [ ] `ui/KakaoLoginButton.tsx` 생성
- [ ] `ui/LogoutButton.tsx` 생성
- [ ] `ui/ProtectedRoute.tsx` 생성
- [ ] `ui/UserMenu.tsx` 생성
- [ ] `ui/LoginPrompt.tsx` 생성
- [ ] `pages/LoginPage.tsx` 생성
- [ ] `pages/KakaoCallbackPage.tsx` 생성
- [ ] 환경 변수 설정
- [ ] TypeScript 컴파일 에러 없음
- [ ] 카카오 로그인 테스트

---

## 9. 다음 Phase

Phase 07 완료 후 → **Phase 08: FE_FEATURES_MAIN.md** (게시글, 댓글, 카테고리 기능)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
