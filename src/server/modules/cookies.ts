import {cookies} from 'next/headers';

export const setCookie = async (
  key: string,
  value: string,
  expire?: number,
) => {
  const cookiesStore = await cookies();
  cookiesStore.set(key, value, {
    httpOnly: true,
    maxAge: expire,
  });
};

export const getCookie = async (key: string) => {
  const cookiesStore = await cookies();
  return cookiesStore.get(key);
};

export const deleteCookie = async (key: string) => {
  const cookiesStore = await cookies();
  cookiesStore.delete(key);
};
