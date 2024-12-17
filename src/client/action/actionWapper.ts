import {cashingAction} from '@/server/actions/action';

// 서버 액션 응답 타입
type ResponseData = Record<string, any> | null;

type ActionResponse<T extends ResponseData> = {
  status: number;
  message: string;
  data?: T;
};

type ActionWrapper<T extends ResponseData> = {
  action: () => Promise<T>; // 서버 액션 함수
  success?: (response: ActionResponse<T>) => void; // 성공 콜백
  error?: (error: ActionResponse<null>) => void; // 에러 콜백
  options?: {
    revalidate?: number; // 캐싱 유효 시간 (ms)
  };
};

// 액션 래퍼
export const actionWrapper = async <T extends ResponseData, U>({
  action,
  success,
  error,
  options,
}: ActionWrapper<T>) => {
  // 캐싱이 필요한 경우 캐싱된 액션 사용
  const wrappedAction = options?.revalidate
    ? await cashingAction(action, {staleTime: options.revalidate})
    : action;

  try {
    // 서버 액션 실행
    const data = await wrappedAction();

    const successResponse = {status: 200, message: 'OK', data};
    success?.(successResponse); // 성공 콜백 실행

    return successResponse.data;
  } catch (err: any) {
    const errorResponse = {
      status: err?.status || 500,
      message: err?.message || 'Internal Server Error',
    };

    error?.(errorResponse); // 에러 콜백 실행
    throw new Error(errorResponse.message);
  }
};
