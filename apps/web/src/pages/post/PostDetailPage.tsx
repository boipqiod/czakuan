import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { usePostDetail, useDeletePost, useToggleLike, useToggleDislike } from "@/features/post";
import { useCommentList, useCreateComment, useDeleteComment } from "@/features/comment";
import { useAuthStore } from "@/features/auth";
import { Button, Textarea, Spinner } from "@/shared/ui";
import { formatDate } from "@/shared/lib";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const { data: post, isLoading: postLoading } = usePostDetail(Number(postId));
  const { data: commentsResult, isLoading: commentsLoading } = useCommentList({
    postId: Number(postId),
  });

  const deletePostMutation = useDeletePost();
  const toggleLikeMutation = useToggleLike();
  const toggleDislikeMutation = useToggleDislike();
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  if (postLoading) {
    return <Spinner className="py-20" />;
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          돌아가기
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deletePostMutation.mutateAsync(post.id);
    navigate(-1);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    await createCommentMutation.mutateAsync({
      postId: post.id,
      content: commentContent,
      parentId: replyTo || undefined,
    });

    setCommentContent("");
    setReplyTo(null);
  };

  const authorDisplay = post.isAnonymous
    ? post.anonymousId || "익명"
    : post.author?.nickname || "알 수 없음";

  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }),
    [post.content]
  );

  return (
    <div className="space-y-6">
      <article className="rounded-lg border bg-white p-6">
        <header className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span>{authorDisplay}</span>
                <span>·</span>
                <span>{formatDate(post.createdAt)}</span>
                <span>·</span>
                <span>조회 {post.views}</span>
              </div>
            </div>
            {user && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  삭제
                </Button>
              </div>
            )}
          </div>
        </header>

        <div
          className="prose prose-sm mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        <footer className="mt-8 flex items-center justify-center gap-4 border-t pt-4">
          <Button
            variant={post.myReaction?.liked ? "primary" : "secondary"}
            size="sm"
            onClick={() => toggleLikeMutation.mutate(post.id)}
            isLoading={toggleLikeMutation.isPending}
          >
            👍 {post.likeCount}
          </Button>
          <Button
            variant={post.myReaction?.disliked ? "danger" : "secondary"}
            size="sm"
            onClick={() => toggleDislikeMutation.mutate(post.id)}
            isLoading={toggleDislikeMutation.isPending}
          >
            👎 {post.dislikeCount}
          </Button>
        </footer>
      </article>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="font-bold text-gray-900">댓글 {post.commentCount}</h2>

        {user && (
          <form onSubmit={handleSubmitComment} className="mt-4">
            {replyTo && (
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <span>답글 작성 중</span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-red-500 hover:underline"
                >
                  취소
                </button>
              </div>
            )}
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" isLoading={createCommentMutation.isPending}>
                등록
              </Button>
            </div>
          </form>
        )}

        {commentsLoading ? (
          <Spinner className="py-10" />
        ) : (
          <div className="mt-6 space-y-4">
            {commentsResult?.comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg border p-4 ${comment.parentId ? "ml-8" : ""}`}
              >
                {comment.isDeleted ? (
                  <p className="text-gray-400">{comment.content}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-900">
                          {comment.anonymousId || comment.author?.nickname || "익명"}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      {user && (
                        <div className="flex gap-2">
                          <button
                            className="text-xs text-gray-400 hover:text-gray-600"
                            onClick={() => setReplyTo(comment.id)}
                          >
                            답글
                          </button>
                          <button
                            className="text-xs text-red-400 hover:text-red-600"
                            onClick={() =>
                              deleteCommentMutation.mutate({
                                commentId: comment.id,
                                postId: post.id,
                              })
                            }
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                    <div className="mt-2 flex gap-2 text-xs text-gray-500">
                      <span>👍 {comment.likeCount}</span>
                      <span>👎 {comment.dislikeCount}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
