import { Link } from "react-router-dom";
import { useCategories } from "@/features/post";
import { Spinner } from "@/shared/ui";

export function BoardListPage() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <Spinner className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">게시판 목록</h1>

      <div className="space-y-6">
        {categories?.map((group) => (
          <div key={group.id} className="rounded-lg border bg-white">
            <div className="border-b bg-gray-50 px-4 py-3">
              <h2 className="font-semibold text-gray-800">{group.name}</h2>
            </div>
            <div className="divide-y">
              {group.categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/boards/${category.id}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="mt-0.5 text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                  {category.isAnonymous && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      익명
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
