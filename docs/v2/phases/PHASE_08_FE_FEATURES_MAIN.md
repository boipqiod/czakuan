# Phase 08: FE Features - Main

> 게시글, 댓글, 카테고리 기능 구현

## 목표

- 게시글 CRUD 및 리액션, 신고 기능
- 댓글 CRUD 및 리액션 기능
- 카테고리 조회 및 선택 기능

## 선행 조건

- Phase 06 (FE Entities) 완료
- Phase 07 (FE Features Auth) 완료

---

## 1. 폴더 구조

```
apps/web/src/features/
├── post/
│   ├── ui/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostForm.tsx
│   │   ├── PostReactions.tsx
│   │   ├── PostAuthor.tsx
│   │   └── ReportModal.tsx
│   ├── hooks/
│   │   ├── usePostList.ts
│   │   ├── usePostDetail.ts
│   │   ├── usePostMutation.ts
│   │   └── usePostReaction.ts
│   └── api/
│       └── postApi.ts
│
├── comment/
│   ├── ui/
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentReplyForm.tsx
│   ├── hooks/
│   │   ├── useComments.ts
│   │   └── useCommentMutation.ts
│   └── api/
│       └── commentApi.ts
│
└── category/
    ├── ui/
    │   ├── CategoryList.tsx
    │   ├── CategorySelector.tsx
    │   └── CategoryBadge.tsx
    ├── hooks/
    │   └── useCategories.ts
    └── api/
        └── categoryApi.ts
```

---

## 2. 태스크 체크리스트

### 2.1 Post Feature

- [ ] `api/postApi.ts`
- [ ] `hooks/usePostList.ts`
- [ ] `hooks/usePostDetail.ts`
- [ ] `hooks/usePostMutation.ts`
- [ ] `hooks/usePostReaction.ts`
- [ ] `ui/PostCard.tsx`
- [ ] `ui/PostList.tsx`
- [ ] `ui/PostDetail.tsx`
- [ ] `ui/PostForm.tsx`
- [ ] `ui/PostReactions.tsx`
- [ ] `ui/PostAuthor.tsx`
- [ ] `ui/ReportModal.tsx`

### 2.2 Comment Feature

- [ ] `api/commentApi.ts`
- [ ] `hooks/useComments.ts`
- [ ] `hooks/useCommentMutation.ts`
- [ ] `ui/CommentList.tsx`
- [ ] `ui/CommentItem.tsx`
- [ ] `ui/CommentForm.tsx`
- [ ] `ui/CommentReplyForm.tsx`

### 2.3 Category Feature

- [ ] `api/categoryApi.ts`
- [ ] `hooks/useCategories.ts`
- [ ] `ui/CategoryList.tsx`
- [ ] `ui/CategorySelector.tsx`
- [ ] `ui/CategoryBadge.tsx`

---

## 3. Post API

### 3.1 features/post/api/postApi.ts

```typescript
import { apiClient, ApiResponse, PaginatedResponse } from "@/infrastructures/api/client";
import {
  Post,
  PostDetail,
  PostListItem,
  CreatePostData,
  UpdatePostData,
  PostListQuery,
} from "@/entities/post/types";
import { ReactionResult, ReactionType } from "@/entities/reaction/types";

export const postApi = {
  // 게시글 목록 조회
  async getPosts(query: PostListQuery): Promise<PaginatedResponse<PostListItem>["data"]> {
    const params = new URLSearchParams();

    if (query.categoryId) params.append("categoryId", query.categoryId);
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.search) params.append("search", query.search);

    const response = await apiClient.get<PaginatedResponse<PostListItem>>(
      `/posts?${params.toString()}`
    );

    return response.data.data;
  },

  // 게시글 상세 조회
  async getPost(postId: string): Promise<PostDetail> {
    const response = await apiClient.get<ApiResponse<PostDetail>>(`/posts/${postId}`);
    return response.data.data;
  },

  // 게시글 작성
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await apiClient.post<ApiResponse<Post>>("/posts", data);
    return response.data.data;
  },

  // 게시글 수정
  async updatePost(postId: string, data: UpdatePostData): Promise<Post> {
    const response = await apiClient.put<ApiResponse<Post>>(`/posts/${postId}`, data);
    return response.data.data;
  },

  // 게시글 삭제
  async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}`);
  },

  // 리액션 토글
  async toggleReaction(postId: string, type: ReactionType): Promise<ReactionResult> {
    const response = await apiClient.post<ApiResponse<ReactionResult>>(
      `/posts/${postId}/reactions`,
      { type }
    );
    return response.data.data;
  },

  // 게시글 신고
  async reportPost(postId: string, reason: string): Promise<void> {
    await apiClient.post(`/posts/${postId}/report`, { reason });
  },
};
```

---

## 4. Post Hooks

### 4.1 features/post/hooks/usePostList.ts

```typescript
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { postApi } from "@/features/post/api/postApi";
import { PostListQuery } from "@/entities/post/types";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (query: PostListQuery) => [...postKeys.lists(), query] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// 페이지네이션 기반 목록
export function usePostList(query: PostListQuery) {
  return useQuery({
    queryKey: postKeys.list(query),
    queryFn: () => postApi.getPosts(query),
    staleTime: 1000 * 60, // 1분
  });
}

// 무한 스크롤 기반 목록
export function useInfinitePostList(query: Omit<PostListQuery, "page">) {
  return useInfiniteQuery({
    queryKey: postKeys.list({ ...query, page: undefined }),
    queryFn: ({ pageParam = 1 }) =>
      postApi.getPosts({ ...query, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
  });
}
```

### 4.2 features/post/hooks/usePostDetail.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/features/post/api/postApi";
import { postKeys } from "@/features/post/hooks/usePostList";

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postApi.getPost(postId),
    staleTime: 1000 * 60,
    enabled: !!postId,
  });
}
```

### 4.3 features/post/hooks/usePostMutation.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { postApi } from "@/features/post/api/postApi";
import { postKeys } from "@/features/post/hooks/usePostList";
import { CreatePostData, UpdatePostData } from "@/entities/post/types";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreatePostData) => postApi.createPost(data),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      navigate(`/posts/${post.id}`);
    },
  });
}

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: UpdatePostData) => postApi.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      navigate(`/posts/${postId}`);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (postId: string) => postApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      navigate("/posts");
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      postApi.reportPost(postId, reason),
  });
}
```

### 4.4 features/post/hooks/usePostReaction.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "@/features/post/api/postApi";
import { postKeys } from "@/features/post/hooks/usePostList";
import { ReactionType, ReactionResult } from "@/entities/reaction/types";
import { PostDetail } from "@/entities/post/types";

export function usePostReaction(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type: ReactionType) => postApi.toggleReaction(postId, type),
    onMutate: async (type) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      const previousPost = queryClient.getQueryData<PostDetail>(postKeys.detail(postId));

      if (previousPost) {
        const newReaction = previousPost.myReaction === type ? null : type;
        const updatedPost: PostDetail = {
          ...previousPost,
          myReaction: newReaction,
          reactions: {
            likeCount:
              previousPost.reactions.likeCount +
              (type === "LIKE" ? (newReaction ? 1 : -1) : previousPost.myReaction === "LIKE" ? -1 : 0),
            dislikeCount:
              previousPost.reactions.dislikeCount +
              (type === "DISLIKE"
                ? newReaction
                  ? 1
                  : -1
                : previousPost.myReaction === "DISLIKE"
                  ? -1
                  : 0),
          },
        };

        queryClient.setQueryData(postKeys.detail(postId), updatedPost);
      }

      return { previousPost };
    },
    onError: (_err, _type, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
```

---

## 5. Post UI

### 5.1 features/post/ui/PostCard.tsx

```typescript
import { Link } from "react-router-dom";
import { PostListItem } from "@/entities/post/types";
import { formatDate } from "@/common/utils/formatDate";
import { getContentPreview } from "@/entities/post/rules";
import { PostAuthor } from "@/features/post/ui/PostAuthor";
import { CategoryBadge } from "@/features/category/ui/CategoryBadge";

interface PostCardProps {
  post: PostListItem;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      to={`/posts/${post.id}`}
      className="block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <CategoryBadge name={post.category.name} />
        <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
      </div>

      <h3 className="mb-2 font-semibold text-gray-900 line-clamp-1">{post.title}</h3>

      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
        {getContentPreview(post.content, 100)}
      </p>

      <div className="flex items-center justify-between">
        <PostAuthor author={post.author} size="sm" />

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <HeartIcon className="h-4 w-4" />
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <ChatIcon className="h-4 w-4" />
            {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}
```

### 5.2 features/post/ui/PostList.tsx

```typescript
import { PostListItem } from "@/entities/post/types";
import { PostCard } from "@/features/post/ui/PostCard";
import { Loading } from "@/common/ui/Loading";

interface PostListProps {
  posts: PostListItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function PostList({
  posts,
  isLoading,
  emptyMessage = "게시글이 없습니다.",
}: PostListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 5.3 features/post/ui/PostDetail.tsx

```typescript
import { PostDetail as PostDetailType } from "@/entities/post/types";
import { formatDateTime } from "@/common/utils/formatDate";
import { PostAuthor } from "@/features/post/ui/PostAuthor";
import { PostReactions } from "@/features/post/ui/PostReactions";
import { CategoryBadge } from "@/features/category/ui/CategoryBadge";
import { Button } from "@/common/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDeletePost } from "@/features/post/hooks/usePostMutation";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ReportModal } from "@/features/post/ui/ReportModal";

interface PostDetailProps {
  post: PostDetailType;
}

export function PostDetail({ post }: PostDetailProps) {
  const { user } = useAuth();
  const deletePost = useDeletePost();
  const [showReportModal, setShowReportModal] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deletePost.mutate(post.id);
    }
  };

  return (
    <article className="rounded-lg border bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-2 flex items-center gap-2">
          <CategoryBadge name={post.category.name} />
        </div>

        <h1 className="mb-4 text-xl font-bold">{post.title}</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PostAuthor author={post.author} />
            <span className="text-sm text-gray-500">{formatDateTime(post.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>조회 {post.viewCount}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Reactions */}
      <div className="border-t p-4">
        <PostReactions postId={post.id} reactions={post.reactions} myReaction={post.myReaction} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t p-4">
        <Button variant="ghost" size="sm" onClick={() => setShowReportModal(true)}>
          신고
        </Button>

        {(post.isAuthor || isAdmin) && (
          <div className="flex gap-2">
            {post.isAuthor && (
              <Link to={`/posts/${post.id}/edit`}>
                <Button variant="secondary" size="sm">
                  수정
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deletePost.isPending}
            >
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post.id}
      />
    </article>
  );
}
```

### 5.4 features/post/ui/PostForm.tsx

```typescript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/common/ui/Button";
import { Input } from "@/common/ui/Input";
import { CategorySelector } from "@/features/category/ui/CategorySelector";
import { CreatePostData, UpdatePostData, PostDetail } from "@/entities/post/types";
import { validatePost } from "@/entities/post/rules";

interface PostFormProps {
  initialData?: PostDetail;
  onSubmit: (data: CreatePostData | UpdatePostData) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function PostForm({ initialData, onSubmit, isLoading, isEdit }: PostFormProps) {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(initialData?.category.id || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isAnonymous, setIsAnonymous] = useState(initialData?.isAnonymous || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePost({ title, content });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (!isEdit && !categoryId) {
      setErrors({ categoryId: "카테고리를 선택해주세요." });
      return;
    }

    setErrors({});

    if (isEdit) {
      onSubmit({ title, content });
    } else {
      onSubmit({ categoryId, title, content, isAnonymous });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">카테고리</label>
          <CategorySelector value={categoryId} onChange={setCategoryId} />
          {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>}
        </div>
      )}

      <Input
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        error={errors.title}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={10}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
        <p className="mt-1 text-xs text-gray-500">{content.length} / 5000자</p>
      </div>

      {!isEdit && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">익명으로 작성</span>
        </label>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? "수정" : "작성"}
        </Button>
      </div>
    </form>
  );
}
```

### 5.5 features/post/ui/PostReactions.tsx

```typescript
import { ReactionCounts, ReactionType } from "@/entities/reaction/types";
import { usePostReaction } from "@/features/post/hooks/usePostReaction";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/common/utils/cn";

interface PostReactionsProps {
  postId: string;
  reactions: ReactionCounts;
  myReaction: ReactionType | null;
}

export function PostReactions({ postId, reactions, myReaction }: PostReactionsProps) {
  const { isAuthenticated } = useAuth();
  const mutation = usePostReaction(postId);

  const handleReaction = (type: ReactionType) => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }
    mutation.mutate(type);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => handleReaction("LIKE")}
        disabled={mutation.isPending}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 transition-colors",
          myReaction === "LIKE"
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        <ThumbUpIcon filled={myReaction === "LIKE"} />
        <span className="font-medium">{reactions.likeCount}</span>
      </button>

      <button
        onClick={() => handleReaction("DISLIKE")}
        disabled={mutation.isPending}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 transition-colors",
          myReaction === "DISLIKE"
            ? "bg-blue-100 text-blue-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        <ThumbDownIcon filled={myReaction === "DISLIKE"} />
        <span className="font-medium">{reactions.dislikeCount}</span>
      </button>
    </div>
  );
}

function ThumbUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
      />
    </svg>
  );
}

function ThumbDownIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
      />
    </svg>
  );
}
```

### 5.6 features/post/ui/PostAuthor.tsx

```typescript
import { Author } from "@/entities/user/types";
import { getAuthorDisplayName, getAuthorProfileImage } from "@/entities/utils/typeGuards";
import { cn } from "@/common/utils/cn";

interface PostAuthorProps {
  author: Author;
  size?: "sm" | "md";
  showBadge?: boolean;
}

export function PostAuthor({ author, size = "md", showBadge }: PostAuthorProps) {
  const displayName = getAuthorDisplayName(author);
  const profileImage = getAuthorProfileImage(author);
  const isAnonymous = author.type === "anonymous";

  const sizeStyles = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
  };

  return (
    <div className="flex items-center gap-2">
      {profileImage ? (
        <img
          src={profileImage}
          alt={displayName}
          className={cn("rounded-full object-cover", sizeStyles[size])}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-medium text-white",
            sizeStyles[size],
            isAnonymous ? "bg-gray-400" : "bg-blue-500"
          )}
        >
          {displayName.charAt(0)}
        </div>
      )}

      <span className={cn("font-medium", size === "sm" ? "text-sm" : "text-base")}>
        {displayName}
      </span>

      {showBadge && author.type === "anonymous" && author.isPostAuthor && (
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">글쓴이</span>
      )}
    </div>
  );
}
```

### 5.7 features/post/ui/ReportModal.tsx

```typescript
import { useState } from "react";
import { Modal } from "@/common/ui/Modal";
import { Button } from "@/common/ui/Button";
import { useReportPost } from "@/features/post/hooks/usePostMutation";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const reportMutation = useReportPost();

  const handleSubmit = () => {
    if (reason.trim().length < 5) {
      alert("신고 사유를 5자 이상 입력해주세요.");
      return;
    }

    reportMutation.mutate(
      { postId, reason },
      {
        onSuccess: () => {
          alert("신고가 접수되었습니다.");
          setReason("");
          onClose();
        },
        onError: (error: any) => {
          if (error.response?.data?.error?.code === "ALREADY_REPORTED") {
            alert("이미 신고한 게시글입니다.");
          } else {
            alert("신고 접수에 실패했습니다.");
          }
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="게시글 신고">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          허위 신고 시 서비스 이용이 제한될 수 있습니다.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="신고 사유를 입력해주세요 (5자 이상)"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} isLoading={reportMutation.isPending}>
            신고하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## 6. Comment API

### 6.1 features/comment/api/commentApi.ts

```typescript
import { apiClient, ApiResponse } from "@/infrastructures/api/client";
import {
  CommentWithMeta,
  CreateCommentData,
  UpdateCommentData,
} from "@/entities/comment/types";
import { CommentReactionResult } from "@/entities/reaction/types";

export const commentApi = {
  // 게시글의 댓글 목록 조회
  async getComments(postId: string): Promise<CommentWithMeta[]> {
    const response = await apiClient.get<ApiResponse<CommentWithMeta[]>>(
      `/posts/${postId}/comments`
    );
    return response.data.data;
  },

  // 댓글 작성
  async createComment(postId: string, data: CreateCommentData): Promise<CommentWithMeta> {
    const response = await apiClient.post<ApiResponse<CommentWithMeta>>(
      `/posts/${postId}/comments`,
      data
    );
    return response.data.data;
  },

  // 댓글 수정
  async updateComment(commentId: string, data: UpdateCommentData): Promise<CommentWithMeta> {
    const response = await apiClient.put<ApiResponse<CommentWithMeta>>(
      `/comments/${commentId}`,
      data
    );
    return response.data.data;
  },

  // 댓글 삭제
  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // 댓글 리액션
  async toggleReaction(commentId: string): Promise<CommentReactionResult> {
    const response = await apiClient.post<ApiResponse<CommentReactionResult>>(
      `/comments/${commentId}/reactions`,
      { type: "LIKE" }
    );
    return response.data.data;
  },
};
```

---

## 7. Comment Hooks

### 7.1 features/comment/hooks/useComments.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { commentApi } from "@/features/comment/api/commentApi";

export const commentKeys = {
  all: ["comments"] as const,
  byPost: (postId: string) => [...commentKeys.all, "post", postId] as const,
};

export function useComments(postId: string) {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => commentApi.getComments(postId),
    enabled: !!postId,
  });
}
```

### 7.2 features/comment/hooks/useCommentMutation.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "@/features/comment/api/commentApi";
import { commentKeys } from "@/features/comment/hooks/useComments";
import { CreateCommentData, UpdateCommentData } from "@/entities/comment/types";

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData) => commentApi.createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentData }) =>
      commentApi.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}

export function useCommentReaction(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApi.toggleReaction(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) });
    },
  });
}
```

---

## 8. Comment UI

### 8.1 features/comment/ui/CommentList.tsx

```typescript
import { CommentWithMeta } from "@/entities/comment/types";
import { CommentItem } from "@/features/comment/ui/CommentItem";
import { CommentForm } from "@/features/comment/ui/CommentForm";
import { useComments } from "@/features/comment/hooks/useComments";
import { Loading } from "@/common/ui/Loading";

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId);

  if (isLoading) {
    return <Loading />;
  }

  // 부모 댓글만 필터링 (대댓글은 CommentItem에서 렌더링)
  const parentComments = comments?.filter((c) => !c.parentId) || [];

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h3 className="font-semibold">댓글 {comments?.length || 0}</h3>
      </div>

      <div className="p-4">
        <CommentForm postId={postId} />
      </div>

      <div className="divide-y">
        {parentComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}

        {parentComments.length === 0 && (
          <div className="py-8 text-center text-gray-500">첫 댓글을 작성해보세요!</div>
        )}
      </div>
    </div>
  );
}
```

### 8.2 features/comment/ui/CommentItem.tsx

```typescript
import { useState } from "react";
import { CommentWithMeta } from "@/entities/comment/types";
import { formatDate } from "@/common/utils/formatDate";
import { PostAuthor } from "@/features/post/ui/PostAuthor";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDeleteComment, useCommentReaction } from "@/features/comment/hooks/useCommentMutation";
import { CommentForm } from "@/features/comment/ui/CommentForm";
import { getPrivateCommentPlaceholder } from "@/entities/comment/rules";
import { cn } from "@/common/utils/cn";

interface CommentItemProps {
  comment: CommentWithMeta;
  postId: string;
  isReply?: boolean;
}

export function CommentItem({ comment, postId, isReply }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const deleteMutation = useDeleteComment(postId);
  const reactionMutation = useCommentReaction(postId);

  const isAdmin = user?.role === "ADMIN";
  const canView = comment.canView;

  const handleDelete = () => {
    if (confirm("댓글을 삭제하시겠습니까?")) {
      deleteMutation.mutate(comment.id);
    }
  };

  const handleLike = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    reactionMutation.mutate(comment.id);
  };

  return (
    <div className={cn("p-4", isReply && "ml-8 bg-gray-50")}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <PostAuthor author={comment.author} size="sm" showBadge />
          {comment.isPrivate && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">비밀</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
      </div>

      <div className="mt-2">
        {canView ? (
          <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        ) : (
          <p className="text-gray-400 italic">{getPrivateCommentPlaceholder()}</p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1 text-sm",
            comment.myReaction === "LIKE" ? "text-red-500" : "text-gray-500 hover:text-red-500"
          )}
        >
          <HeartIcon filled={comment.myReaction === "LIKE"} />
          {comment.likeCount}
        </button>

        {!isReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            답글
          </button>
        )}

        {comment.isAuthor && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            수정
          </button>
        )}

        {(comment.isAuthor || isAdmin) && (
          <button
            onClick={handleDelete}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            삭제
          </button>
        )}
      </div>

      {/* 답글 폼 */}
      {showReplyForm && (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            autoFocus
          />
        </div>
      )}

      {/* 대댓글 목록 */}
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} isReply />
      ))}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
```

### 8.3 features/comment/ui/CommentForm.tsx

```typescript
import { useState } from "react";
import { Button } from "@/common/ui/Button";
import { useCreateComment, useUpdateComment } from "@/features/comment/hooks/useCommentMutation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { validateCommentContent } from "@/entities/comment/rules";
import { LoginPrompt } from "@/features/auth/ui/LoginPrompt";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  initialContent?: string;
  commentId?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  initialContent = "",
  commentId,
  onSuccess,
  autoFocus,
}: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");

  const createMutation = useCreateComment(postId);
  const updateMutation = useUpdateComment(postId);

  const isEdit = !!commentId;

  if (!isAuthenticated) {
    return <LoginPrompt message="댓글을 작성하려면 로그인이 필요합니다." />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCommentContent(content);
    if (!validation.valid) {
      setError(validation.error || "");
      return;
    }

    setError("");

    if (isEdit) {
      updateMutation.mutate(
        { commentId, data: { content } },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(
        { content, isAnonymous, isPrivate, parentId },
        {
          onSuccess: () => {
            setContent("");
            setIsAnonymous(false);
            setIsPrivate(false);
            onSuccess?.();
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "답글을 입력하세요" : "댓글을 입력하세요"}
        rows={3}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        {!isEdit && (
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">익명</span>
            </label>

            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">비밀댓글</span>
            </label>
          </div>
        )}

        <Button type="submit" size="sm" isLoading={isLoading}>
          {isEdit ? "수정" : "등록"}
        </Button>
      </div>
    </form>
  );
}
```

---

## 9. Category API & Hooks

### 9.1 features/category/api/categoryApi.ts

```typescript
import { apiClient, ApiResponse } from "@/infrastructures/api/client";
import { Category, CategoryListItem } from "@/entities/category/types";

export const categoryApi = {
  async getCategories(): Promise<CategoryListItem[]> {
    const response = await apiClient.get<ApiResponse<CategoryListItem[]>>("/categories");
    return response.data.data;
  },

  async getCategory(categoryId: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${categoryId}`);
    return response.data.data;
  },
};
```

### 9.2 features/category/hooks/useCategories.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/features/category/api/categoryApi";

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
  detail: (id: string) => [...categoryKeys.all, id] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 10, // 10분
  });
}

export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryApi.getCategory(categoryId),
    enabled: !!categoryId,
  });
}
```

---

## 10. Category UI

### 10.1 features/category/ui/CategoryList.tsx

```typescript
import { Link, useSearchParams } from "react-router-dom";
import { useCategories } from "@/features/category/hooks/useCategories";
import { cn } from "@/common/utils/cn";

export function CategoryList() {
  const { data: categories } = useCategories();
  const [searchParams] = useSearchParams();
  const currentCategoryId = searchParams.get("categoryId");

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to="/posts"
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          !currentCategoryId
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        전체
      </Link>

      {categories?.map((category) => (
        <Link
          key={category.id}
          to={`/posts?categoryId=${category.id}`}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            currentCategoryId === category.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {category.name}
          <span className="ml-1 text-xs opacity-70">({category.postCount})</span>
        </Link>
      ))}
    </div>
  );
}
```

### 10.2 features/category/ui/CategorySelector.tsx

```typescript
import { useCategories } from "@/features/category/hooks/useCategories";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const { data: categories, isLoading } = useCategories();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">카테고리 선택</option>
      {categories?.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
```

### 10.3 features/category/ui/CategoryBadge.tsx

```typescript
import { cn } from "@/common/utils/cn";

interface CategoryBadgeProps {
  name: string;
  className?: string;
}

export function CategoryBadge({ name, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700",
        className
      )}
    >
      {name}
    </span>
  );
}
```

---

## 11. 검증 체크리스트

### Post

- [ ] `api/postApi.ts` 생성
- [ ] `hooks/usePostList.ts` 생성
- [ ] `hooks/usePostDetail.ts` 생성
- [ ] `hooks/usePostMutation.ts` 생성
- [ ] `hooks/usePostReaction.ts` 생성
- [ ] `ui/PostCard.tsx` 생성
- [ ] `ui/PostList.tsx` 생성
- [ ] `ui/PostDetail.tsx` 생성
- [ ] `ui/PostForm.tsx` 생성
- [ ] `ui/PostReactions.tsx` 생성
- [ ] `ui/PostAuthor.tsx` 생성
- [ ] `ui/ReportModal.tsx` 생성

### Comment

- [ ] `api/commentApi.ts` 생성
- [ ] `hooks/useComments.ts` 생성
- [ ] `hooks/useCommentMutation.ts` 생성
- [ ] `ui/CommentList.tsx` 생성
- [ ] `ui/CommentItem.tsx` 생성
- [ ] `ui/CommentForm.tsx` 생성

### Category

- [ ] `api/categoryApi.ts` 생성
- [ ] `hooks/useCategories.ts` 생성
- [ ] `ui/CategoryList.tsx` 생성
- [ ] `ui/CategorySelector.tsx` 생성
- [ ] `ui/CategoryBadge.tsx` 생성

### 통합

- [ ] TypeScript 컴파일 에러 없음
- [ ] 게시글 CRUD 테스트
- [ ] 댓글 CRUD 테스트
- [ ] 리액션 테스트

---

## 12. 다음 Phase

Phase 08 완료 후 → **Phase 09: FE_PAGES.md** (페이지 컴포넌트 구현)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2025-12-30 | 최초 작성 |
