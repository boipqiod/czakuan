import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi, type PostListResult, type PostDetail, type CreatePostInput, type UpdatePostInput } from "@/entities/post";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (categoryId?: number) => [...postKeys.lists(), { categoryId }] as const,
  popular: () => [...postKeys.all, "popular"] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
  categories: () => ["categories"] as const,
};

export function usePostList(params: { categoryId?: number; page?: number; limit?: number }) {
  return useQuery<PostListResult>({
    queryKey: [...postKeys.list(params.categoryId), params.page, params.limit],
    queryFn: () => postApi.getList(params),
  });
}

export function usePopularPosts(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...postKeys.popular(), params.page, params.limit],
    queryFn: () => postApi.getPopular(params),
  });
}

export function usePostDetail(postId: number) {
  return useQuery<PostDetail>({
    queryKey: postKeys.detail(postId),
    queryFn: () => postApi.getDetail(postId),
    enabled: !!postId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: postKeys.categories(),
    queryFn: () => postApi.getCategories(),
    staleTime: Infinity,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      console.error("게시글 작성 실패:", error);
    },
  });
}

export function useUpdatePost(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePostInput) => postApi.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      console.error("게시글 수정 실패:", error);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      console.error("게시글 삭제 실패:", error);
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postApi.toggleLike(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
    onError: (error) => {
      console.error("좋아요 토글 실패:", error);
    },
  });
}

export function useToggleDislike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postApi.toggleDislike(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
    onError: (error) => {
      console.error("싫어요 토글 실패:", error);
    },
  });
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: number; reason: string }) =>
      postApi.report(postId, reason),
    onError: (error) => {
      console.error("게시글 신고 실패:", error);
    },
  });
}
