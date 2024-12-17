'use server';
import {unstable_cache} from 'next/cache';

// 캐싱을 적용하는 함수
export const cashingAction = async <T>(
  action: () => Promise<T>,
  options?: {staleTime?: number},
) => {
  return unstable_cache(
    action,
    [action.name], // 캐시 태그에 액션 이름을 추가
    {revalidate: options?.staleTime ?? 1000 * 60 * 60}, // 기본 1시간 캐싱
  );
};
