import { Link } from "react-router-dom";
import { useCategories, usePopularPosts } from "@/features/post";
import { Spinner } from "@/shared/ui";
import { formatDate } from "@/shared/lib";

export function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: popularPosts, isLoading: popularLoading } = usePopularPosts({ limit: 5 });

  if (categoriesLoading) {
    return <Spinner className="py-20" />;
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">인기 게시글</h2>
          <Link to="/popular" className="text-sm text-blue-600 hover:underline">
            더보기
          </Link>
        </div>

        {popularLoading ? (
          <Spinner className="py-10" />
        ) : (
          <div className="mt-4 divide-y rounded-lg border bg-white">
            {popularPosts?.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {post.isAnonymous
                        ? post.anonymousId || "익명"
                        : post.author?.nickname || "알 수 없음"}
                    </span>
                    <span>·</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>👍 {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900">게시판</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {categories?.map((group) => (
            <div key={group.id} className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold text-gray-800">{group.name}</h3>
              <div className="mt-3 space-y-2">
                {group.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/boards/${category.id}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{category.name}</span>
                    {category.isAnonymous && (
                      <span className="text-xs text-gray-400">익명</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
