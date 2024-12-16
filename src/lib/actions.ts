interface ActionResponse<T extends Record<string, any> | null> {
  readonly status: number;
  readonly message: string;
  readonly data?: T;
}

// use this function when server action
export const serverAction = <
  T extends Record<string, any> | null,
  U extends any[],
>(
  action: (...args: U) => Promise<T>,
) => {
  return async (...args: U): Promise<ActionResponse<T>> => {
    try {
      const data = await action(...args);
      return {status: 200, message: 'OK', data: data ?? undefined};
    } catch (error: any) {
      if (error.status && error.message) {
        return {
          status: error.status,
          message: error.message,
          data: undefined as unknown as T,
        };
      }

      return {
        status: 500,
        message: error.message,
        data: undefined as unknown as T,
      };
    }
  };
};
// use this function when response action in client
export const actionWrapper = async <T extends Record<string, any> | null>(
  promise: Promise<ActionResponse<T>>,
) => {
  const response = await promise;
  if (response.status === 200) {
    return response.data!;
  }
  throw new Error(response.message);
};
