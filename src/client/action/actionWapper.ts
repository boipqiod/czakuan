import {cashingAction} from '@/server/actions/action';

// 서버 액션 응답 타입
export type ResponseData = Record<string, any> | null | undefined;

export type ActionResponse<T extends ResponseData> = {
  status: number;
  statusText: string;
  data?: T;
};

type ActionSuccessResponse<T extends ResponseData> = {
  status: number;
  statusText: string;
  data: T;
};

type ActionWrapper<T extends ResponseData> = {
  action?: () => Promise<ActionResponse<T>>; // 서버 액션 함수
  success?: (response: ActionSuccessResponse<T>) => void; // 성공 콜백
  error?: (error: ActionResponse<T>) => void; // 에러 콜백
  options?: {
    revalidate?: number; // 캐싱 유효 시간 (ms)
  };
};

// 액션 래퍼
export const actionWrapper = async <T extends ResponseData, U>(
  action: () => Promise<ActionResponse<T>>,
  {success, error, options}: ActionWrapper<T> = {},
) => {
  // 캐싱이 필요한 경우 캐싱된 액션 사용
  const wrappedAction = options?.revalidate
    ? await cashingAction(action, {staleTime: options.revalidate})
    : action;

  try {
    // 서버 액션 실행
    const data = await wrappedAction();

    if (data.status === 200) {
      success?.({
        status: data.status,
        statusText: data.statusText,
        data: data.data as T,
      });
    } else {
      error?.(data);
    }

    return data.data;
  } catch (err: any) {
    const errorResponse = {
      status: err?.status || 500,
      statusText: err?.statusText || err?.message || 'Internal Server Error',
    };

    error?.(errorResponse); // 에러 콜백 실행
  }
};
