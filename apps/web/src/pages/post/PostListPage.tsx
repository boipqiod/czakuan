import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { usePostList, usePopularPosts, useCategories } from "@/features/post";
import { Button, Spinner } from "@/shared/ui";
import { formatDate } from "@/shared/lib";
import type { PostListItem } from "@/entities/post";

export function PostListPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const isPopular = location.pathname === "/popular";
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories();
  const { data: postListResult, isLoading: postListLoading } = usePostList({
    categoryId: categoryId ? Number(categoryId) : undefined,
    page,
  });
  const { data: popularPosts, isLoading: popularLoading } = usePopularPosts({ page });

  const isLoading = isPopular ? popularLoading : postListLoading;
  const posts: PostListItem[] = isPopular
    ? popularPosts || []
    : [...(postListResult?.notices || []), ...(postListResult?.posts || [])];
  const totalPages = isPopular ? 1 : (postListResult?.totalPages || 1);

  const category = categoryId
    ? categories?.flatMap((g) => g.categories).find((c) => c.id === Number(categoryId))
    : null;

  if (isLoading) {
    return <Spinner className="py-20" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          {isPopular ? "인기글" : category?.name || "전체 게시글"}
        </h1>
        <Link to="/write">
          <Button size="sm">글쓰기</Button>
        </Link>
      </div>

      <div className="divide-y rounded-lg border bg-white">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-gray-500">게시글이 없습니다.</div>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="block px-4 py-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {post.isNotice && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        공지
                      </span>
                    )}
                    <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {post.isAnonymous
                        ? post.anonymousId || "익명"
                        : post.author?.nickname || "알 수 없음"}
                    </span>
                    <span>·</span>
                    <span>{formatDate(post.createdAt)}</span>
                    <span>·</span>
                    <span>조회 {post.views}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>👍 {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {!isPopular && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
