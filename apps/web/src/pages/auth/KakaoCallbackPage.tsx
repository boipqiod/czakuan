import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useKakaoLogin } from "@/features/auth";
import { Button, Input, Spinner } from "@/shared/ui";

export function KakaoCallbackPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { isLoading, error, handleCallback, needsNickname } = useKakaoLogin();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (code && !needsNickname) {
      handleCallback(code);
    }
  }, [code, needsNickname, handleCallback]);

  const handleSubmitNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && nickname) {
      handleCallback(code, nickname);
    }
  };

  if (needsNickname) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">환영합니다!</h1>
            <p className="mt-2 text-sm text-gray-500">사용할 닉네임을 입력해주세요</p>
          </div>

          <form onSubmit={handleSubmitNickname} className="space-y-4">
            <Input
              label="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~20자 입력"
              minLength={2}
              maxLength={20}
              error={error || undefined}
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              시작하기
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.href = "/login"} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
