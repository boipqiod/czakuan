'use server';
import {cookies} from 'next/headers';

export const getCookieStorage = async () => {
  return cookies();
};
