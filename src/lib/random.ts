import {randomBytes} from 'crypto';

export const getUniqueString = (length: number = 16): string => {
  const randomBuffer = randomBytes(Math.ceil(length / 2));
  return randomBuffer.toString('hex').slice(0, length);
};
