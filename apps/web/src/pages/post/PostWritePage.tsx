import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories, useCreatePost } from "@/features/post";
import { Button, Input, Textarea, Spinner } from "@/shared/ui";

export function PostWritePage() {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createPostMutation = useCreatePost();

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId || !title.trim() || !content.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const post = await createPostMutation.mutateAsync({
      categoryId,
      title,
      content,
      images: [],
    });

    navigate(`/posts/${post.id}`);
  };

  if (categoriesLoading) {
    return <Spinner className="py-20" />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900">글쓰기</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">게시판 선택</label>
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(Number(e.target.value) || null)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">게시판을 선택하세요</option>
            {categories?.map((group) => (
              <optgroup key={group.id} label={group.name}>
                {group.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} {category.isAnonymous ? "(익명)" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <Input
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={100}
        />

        <Textarea
          label="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={10}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" isLoading={createPostMutation.isPending}>
            등록
          </Button>
        </div>
      </form>
    </div>
  );
}
