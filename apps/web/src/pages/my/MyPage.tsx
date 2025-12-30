import { useAuthStore } from "@/features/auth";
import { Button } from "@/shared/ui";

export function MyPage() {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-500">
        로그인이 필요합니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>

      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.nickname}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                👤
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.nickname}</p>
            <p className="text-sm text-gray-500">{user.email || "이메일 없음"}</p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <Button variant="secondary" onClick={logout} className="w-full">
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
