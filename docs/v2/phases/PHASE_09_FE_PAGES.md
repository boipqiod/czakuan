# Phase 09: FE Pages

> 페이지 컴포넌트 구현

## 목표

- 모든 페이지 컴포넌트 구현
- 레이아웃 컴포넌트 구현
- 페이지별 라우팅 완성

## 선행 조건

- Phase 07 (FE Features Auth) 완료
- Phase 08 (FE Features Main) 완료

---

## 1. 폴더 구조

```
apps/web/src/
├── pages/
│   ├── HomePage.tsx
│   ├── PostListPage.tsx
│   ├── PostDetailPage.tsx
│   ├── PostWritePage.tsx
│   ├── MyPage.tsx
│   ├── MyPostsPage.tsx
│   ├── MyCommentsPage.tsx
│   ├── ProfileEditPage.tsx
│   ├── LoginPage.tsx
│   ├── KakaoCallbackPage.tsx
│   └── NotFoundPage.tsx
│
└── common/
    └── ui/
        ├── Layout.tsx
        ├── Header.tsx
        └── Footer.tsx
```

---

## 2. 태스크 체크리스트

### 2.1 레이아웃

- [ ] `common/ui/Layout.tsx`
- [ ] `common/ui/Header.tsx`
- [ ] `common/ui/Footer.tsx`

### 2.2 페이지

- [ ] `pages/HomePage.tsx`
- [ ] `pages/PostListPage.tsx`
- [ ] `pages/PostDetailPage.tsx`
- [ ] `pages/PostWritePage.tsx`
- [ ] `pages/MyPage.tsx`
- [ ] `pages/MyPostsPage.tsx`
- [ ] `pages/MyCommentsPage.tsx`
- [ ] `pages/ProfileEditPage.tsx`
- [ ] `pages/LoginPage.tsx` (Phase 07에서 이미 작성)
- [ ] `pages/KakaoCallbackPage.tsx` (Phase 07에서 이미 작성)
- [ ] `pages/NotFoundPage.tsx`

### 2.3 라우터 업데이트

- [ ] `app/router.tsx` 업데이트

---

## 3. 레이아웃 컴포넌트

### 3.1 common/ui/Layout.tsx

```typescript
import { Outlet } from "react-router-dom";
import { Header } from "@/common/ui/Header";
import { Footer } from "@/common/ui/Footer";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          {children || <Outlet />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

### 3.2 common/ui/Header.tsx

```typescript
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserMenu } from "@/features/auth/ui/UserMenu";
import { Button } from "@/common/ui/Button";

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-600">
            에대숲
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            <Link to="/posts" className="text-sm text-gray-600 hover:text-gray-900">
              게시판
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link to="/posts/write">
                    <Button size="sm">글쓰기</Button>
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    로그인
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

### 3.3 common/ui/Footer.tsx

```typescript
export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-6">
      <div className="container text-center text-sm text-gray-500">
        <p>&copy; 2025 에대숲. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="/terms" className="hover:text-gray-700">
            이용약관
          </a>
          <a href="/privacy" className="hover:text-gray-700">
            개인정보처리방침
          </a>
        </div>
      </div>
    </footer>
  );
}
```

---

## 4. 페이지 컴포넌트

### 4.1 pages/HomePage.tsx

```typescript
import { Link } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { PostList } from "@/features/post/ui/PostList";
import { CategoryList } from "@/features/category/ui/CategoryList";
import { usePostList } from "@/features/post/hooks/usePostList";
import { Button } from "@/common/ui/Button";

export function HomePage() {
  const { data, isLoading } = usePostList({ limit: 5 });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <h1 className="mb-2 text-3xl font-bold">에대숲</h1>
          <p className="mb-4 text-blue-100">
            익명으로 자유롭게 이야기를 나눠보세요
          </p>
          <Link to="/posts">
            <Button variant="secondary">게시판 둘러보기</Button>
          </Link>
        </section>

        {/* Categories */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">카테고리</h2>
          <CategoryList />
        </section>

        {/* Recent Posts */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">최근 게시글</h2>
            <Link to="/posts" className="text-sm text-blue-600 hover:underline">
              더보기
            </Link>
          </div>

          <PostList
            posts={data?.items || []}
            isLoading={isLoading}
            emptyMessage="아직 게시글이 없습니다."
          />
        </section>
      </div>
    </Layout>
  );
}
```

### 4.2 pages/PostListPage.tsx

```typescript
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { PostList } from "@/features/post/ui/PostList";
import { CategoryList } from "@/features/category/ui/CategoryList";
import { useInfinitePostList } from "@/features/post/hooks/usePostList";
import { useInfiniteScroll } from "@/common/hooks/useInfiniteScroll";
import { Input } from "@/common/ui/Input";
import { useState, useEffect } from "react";
import { Loading } from "@/common/ui/Loading";

export function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePostList({ categoryId, search, limit: 20 });

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const posts = data?.pages.flatMap((page) => page.items) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="flex-1"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            검색
          </button>
        </form>

        {/* Categories */}
        <CategoryList />

        {/* Posts */}
        <PostList posts={posts} isLoading={isLoading && !data} />

        {/* Load More Trigger */}
        <div ref={loadMoreRef} className="py-4">
          {isFetchingNextPage && (
            <div className="flex justify-center">
              <Loading />
            </div>
          )}
        </div>

        {!hasNextPage && posts.length > 0 && (
          <p className="text-center text-sm text-gray-500">
            모든 게시글을 불러왔습니다.
          </p>
        )}
      </div>
    </Layout>
  );
}
```

### 4.3 pages/PostDetailPage.tsx

```typescript
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { PostDetail } from "@/features/post/ui/PostDetail";
import { CommentList } from "@/features/comment/ui/CommentList";
import { usePostDetail } from "@/features/post/hooks/usePostDetail";
import { Loading } from "@/common/ui/Loading";
import { Button } from "@/common/ui/Button";

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = usePostDetail(id!);

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            게시글을 찾을 수 없습니다
          </h2>
          <p className="mb-4 text-gray-600">
            삭제되었거나 존재하지 않는 게시글입니다.
          </p>
          <Button onClick={() => navigate("/posts")}>목록으로</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>뒤로</span>
        </button>

        {/* Post Detail */}
        <PostDetail post={post} />

        {/* Comments */}
        <CommentList postId={post.id} />
      </div>
    </Layout>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
```

### 4.4 pages/PostWritePage.tsx

```typescript
import { useParams } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { PostForm } from "@/features/post/ui/PostForm";
import { usePostDetail } from "@/features/post/hooks/usePostDetail";
import { useCreatePost, useUpdatePost } from "@/features/post/hooks/usePostMutation";
import { Loading } from "@/common/ui/Loading";

export function PostWritePage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: post, isLoading: isLoadingPost } = usePostDetail(id || "");
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost(id || "");

  if (isEdit && isLoadingPost) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  if (isEdit && !post) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (data: any) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">
          {isEdit ? "게시글 수정" : "새 글 작성"}
        </h1>

        <div className="rounded-lg border bg-white p-6">
          <PostForm
            initialData={post}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            isEdit={isEdit}
          />
        </div>
      </div>
    </Layout>
  );
}
```

### 4.5 pages/MyPage.tsx

```typescript
import { Link } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LogoutButton } from "@/features/auth/ui/LogoutButton";
import { Loading } from "@/common/ui/Loading";

export function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  if (!user) {
    return null; // ProtectedRoute가 처리
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md space-y-6">
        {/* Profile Card */}
        <div className="rounded-lg border bg-white p-6 text-center">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.nickname}
              className="mx-auto h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
              {user.nickname.charAt(0)}
            </div>
          )}

          <h2 className="mt-4 text-xl font-semibold">{user.nickname}</h2>
          <p className="text-sm text-gray-500">
            {user.role === "ADMIN" ? "관리자" : "회원"}
          </p>

          <Link
            to="/my/profile/edit"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            프로필 수정
          </Link>
        </div>

        {/* Menu */}
        <div className="rounded-lg border bg-white">
          <Link
            to="/my/posts"
            className="flex items-center justify-between border-b p-4 hover:bg-gray-50"
          >
            <span>내가 쓴 글</span>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            to="/my/comments"
            className="flex items-center justify-between border-b p-4 hover:bg-gray-50"
          >
            <span>내가 쓴 댓글</span>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </Link>

          <div className="p-4">
            <LogoutButton className="w-full justify-center text-red-600" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
```

### 4.6 pages/MyPostsPage.tsx

```typescript
import { Layout } from "@/common/ui/Layout";
import { PostList } from "@/features/post/ui/PostList";
import { useMyPosts } from "@/features/user/hooks/useMyPosts";
import { useInfiniteScroll } from "@/common/hooks/useInfiniteScroll";
import { Loading } from "@/common/ui/Loading";

export function MyPostsPage() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMyPosts();

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const posts = data?.pages.flatMap((page) => page.items) || [];

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">내가 쓴 글</h1>

        <PostList
          posts={posts}
          isLoading={isLoading && !data}
          emptyMessage="작성한 게시글이 없습니다."
        />

        <div ref={loadMoreRef} className="py-4">
          {isFetchingNextPage && (
            <div className="flex justify-center">
              <Loading />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
```

### 4.7 pages/MyCommentsPage.tsx

```typescript
import { Link } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { useMyComments } from "@/features/user/hooks/useMyComments";
import { formatDate } from "@/common/utils/formatDate";
import { Loading } from "@/common/ui/Loading";

export function MyCommentsPage() {
  const { data, isLoading } = useMyComments();

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">내가 쓴 댓글</h1>

        {isLoading ? (
          <Loading />
        ) : data?.items.length === 0 ? (
          <p className="text-center text-gray-500">작성한 댓글이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {data?.items.map((comment) => (
              <Link
                key={comment.id}
                to={`/posts/${comment.postId}`}
                className="block rounded-lg border bg-white p-4 hover:shadow-md"
              >
                <p className="line-clamp-2 text-gray-800">{comment.content}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDate(comment.createdAt)}</span>
                  {comment.isAnonymous && <span>익명</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
```

### 4.8 pages/ProfileEditPage.tsx

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { Button } from "@/common/ui/Button";
import { Input } from "@/common/ui/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateProfile } from "@/features/user/hooks/useProfile";
import { validateNickname } from "@/entities/user/rules";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateNickname(nickname);
    if (!validation.valid) {
      setError(validation.error || "");
      return;
    }

    setError("");
    updateProfile.mutate(
      { nickname },
      {
        onSuccess: () => {
          navigate("/my");
        },
      }
    );
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">프로필 수정</h1>

        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
          <div className="mb-6 text-center">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.nickname}
                className="mx-auto h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
                {nickname.charAt(0) || "?"}
              </div>
            )}
          </div>

          <Input
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={error}
            placeholder="닉네임을 입력하세요"
          />

          <div className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={updateProfile.isPending}
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
```

### 4.9 pages/NotFoundPage.tsx

```typescript
import { Link } from "react-router-dom";
import { Layout } from "@/common/ui/Layout";
import { Button } from "@/common/ui/Button";

export function NotFoundPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="mb-2 text-6xl font-bold text-gray-300">404</h1>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-6 text-gray-600">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link to="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </Layout>
  );
}
```

---

## 5. 사용자 기능 Hooks 추가

### 5.1 features/user/hooks/useProfile.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiResponse } from "@/infrastructures/api/client";
import { User } from "@/entities/user/types";
import { authKeys } from "@/features/auth/hooks/useAuth";

interface UpdateProfileData {
  nickname?: string;
  profileImage?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await apiClient.put<ApiResponse<User>>("/users/me", data);
      return response.data.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}
```

### 5.2 features/user/hooks/useMyPosts.ts

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient, PaginatedResponse } from "@/infrastructures/api/client";
import { PostListItem } from "@/entities/post/types";

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ["users", "me", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<PaginatedResponse<PostListItem>>(
        `/users/me/posts?page=${pageParam}&limit=20`
      );
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
```

### 5.3 features/user/hooks/useMyComments.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient, PaginatedResponse } from "@/infrastructures/api/client";

interface MyComment {
  id: string;
  postId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

export function useMyComments() {
  return useQuery({
    queryKey: ["users", "me", "comments"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<MyComment>>(
        "/users/me/comments?limit=50"
      );
      return response.data.data;
    },
  });
}
```

---

## 6. 라우터 업데이트

### 6.1 app/router.tsx (업데이트)

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { PostListPage } from "@/pages/PostListPage";
import { PostDetailPage } from "@/pages/PostDetailPage";
import { PostWritePage } from "@/pages/PostWritePage";
import { MyPage } from "@/pages/MyPage";
import { MyPostsPage } from "@/pages/MyPostsPage";
import { MyCommentsPage } from "@/pages/MyCommentsPage";
import { ProfileEditPage } from "@/pages/ProfileEditPage";
import { LoginPage } from "@/pages/LoginPage";
import { KakaoCallbackPage } from "@/pages/KakaoCallbackPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
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
          <Route path="/my/posts" element={<MyPostsPage />} />
          <Route path="/my/comments" element={<MyCommentsPage />} />
          <Route path="/my/profile/edit" element={<ProfileEditPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 7. 검증 체크리스트

### 레이아웃

- [ ] `Layout.tsx` 생성
- [ ] `Header.tsx` 생성
- [ ] `Footer.tsx` 생성

### 페이지

- [ ] `HomePage.tsx` 생성
- [ ] `PostListPage.tsx` 생성
- [ ] `PostDetailPage.tsx` 생성
- [ ] `PostWritePage.tsx` 생성
- [ ] `MyPage.tsx` 생성
- [ ] `MyPostsPage.tsx` 생성
- [ ] `MyCommentsPage.tsx` 생성
- [ ] `ProfileEditPage.tsx` 생성
- [ ] `NotFoundPage.tsx` 생성

### 사용자 Hooks

- [ ] `useProfile.ts` 생성
- [ ] `useMyPosts.ts` 생성
- [ ] `useMyComments.ts` 생성

### 통합

- [ ] 라우터 업데이트
- [ ] TypeScript 컴파일 에러 없음
- [ ] 모든 페이지 접근 테스트
- [ ] 반응형 디자인 확인

---

## 8. 다음 Phase

Phase 09 완료 후 → **Phase 10: INTEGRATION.md** (FE/BE 통합 및 배포)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
