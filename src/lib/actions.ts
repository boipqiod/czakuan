class ActionResponse<T> {
  constructor(
    readonly status: number,
    readonly message: string,
    readonly data?: T,
  ) {}
}

// use this function when server action
export const serverAction = <T>(action: (...args: any[]) => Promise<T>) => {
  return async (...args: any[]): Promise<ActionResponse<T>> => {
    try {
      const data = await action(...args);
      return new ActionResponse(200, 'OK', data);
    } catch (error: any) {
      if (error instanceof ActionResponse) {
        return error;
      }
      return new ActionResponse(500, error.message);
    }
  };
};
// use this function when response action in client
export const actionWrapper = async <T>(
  action: () => Promise<ActionResponse<T>>,
) => {
  const response = await action();
  if (response.status === 200) {
    return response.data;
  }
  throw new Error(response.message);
};
