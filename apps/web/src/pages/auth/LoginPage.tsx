import { useKakaoLogin } from "@/features/auth";
import { Button } from "@/shared/ui";

export function LoginPage() {
  const { isLoading, error, redirectToKakao } = useKakaoLogin();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">에대숲</h1>
          <p className="mt-2 text-sm text-gray-500">에버랜드 캐스트 익명 커뮤니티</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          onClick={redirectToKakao}
          isLoading={isLoading}
          className="w-full !bg-yellow-400 !text-gray-900 hover:!bg-yellow-500"
          size="lg"
        >
          카카오로 로그인
        </Button>

        <p className="text-center text-xs text-gray-400">
          로그인 시 서비스 이용약관에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
