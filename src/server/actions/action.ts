'use server';
import {ActionResponse, ResponseData} from '@/client/action/actionWapper';
import {unstable_cache} from 'next/cache';
import {NextResponse} from 'next/server';

// 캐싱을 적용하는 함수
export const cashingAction = async <T extends ResponseData>(
  action: () => Promise<ActionResponse<T>>,
  options?: {staleTime?: number},
) => {
  return unstable_cache(
    () => action(),
    [], // 캐시 태그에 액션 이름을 추가
    {revalidate: options?.staleTime ?? 1000 * 60 * 60}, // 기본 1시간 캐싱
  );
};

export async function serverAction<T extends ResponseData>(
  fn: () => Promise<T>,
): Promise<ActionResponse<T>> {
  try {
    const data = await fn(); // 액션 실행
    return {status: 200, statusText: 'OK', data}; // 성공 처리
  } catch (error) {
    console.error('서버 액션 오류:', error);

    // 에러 메시지 직렬화 및 반환
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류 발생';

    if (error instanceof NextResponse) {
      return {status: error.status, statusText: error.statusText};
    }

    return {
      status: 500,
      statusText: message,
    };
  }
}
