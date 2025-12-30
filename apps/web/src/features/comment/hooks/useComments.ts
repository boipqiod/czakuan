import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi, type CommentListResult, type CreateCommentInput } from "@/entities/comment";
import { postKeys } from "@/features/post/hooks/usePosts";

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (postId: number) => [...commentKeys.lists(), postId] as const,
};

export function useCommentList(params: { postId: number; page?: number; limit?: number }) {
  return useQuery<CommentListResult>({
    queryKey: [...commentKeys.list(params.postId), params.page, params.limit],
    queryFn: () => commentApi.getList(params),
    enabled: !!params.postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentInput) => commentApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) =>
      commentApi.delete(commentId).then(() => postId),
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) =>
      commentApi.toggleLike(commentId).then((result) => ({ ...result, postId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(data.postId) });
    },
  });
}

export function useToggleCommentDislike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, postId }: { commentId: number; postId: number }) =>
      commentApi.toggleDislike(commentId).then((result) => ({ ...result, postId })),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(data.postId) });
    },
  });
}

export function useReportComment() {
  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: number; reason: string }) =>
      commentApi.report(commentId, reason),
  });
}
