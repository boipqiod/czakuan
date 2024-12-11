class ActionResponse<T extends Record<string, any> | null> {
  constructor(
    readonly status: number,
    readonly message: string,
    readonly data?: T,
  ) {}
}

// use this function when server action
export const serverAction = <T extends Record<string, any> | null>(
  action: (...args: any[]) => Promise<T>,
) => {
  return async (...args: any[]): Promise<ActionResponse<T>> => {
    try {
      const data = await action(...args);
      return new ActionResponse(200, 'OK', data ?? undefined);
    } catch (error: any) {
      if (error instanceof ActionResponse) {
        return error;
      }
      return new ActionResponse(500, error.message, undefined as unknown as T);
    }
  };
};
// use this function when response action in client
export const actionWrapper = async <T extends Record<string, any> | null>(
  action: () => Promise<ActionResponse<T>>,
) => {
  const response = await action();
  if (response.status === 200) {
    return response.data;
  }
  throw new Error(response.message);
};

export class CustomError {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}
}
