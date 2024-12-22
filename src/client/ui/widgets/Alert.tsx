'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

type AlertProps = {
  message: string;
};
export const Alert = ({message}: AlertProps) => {
  useEffect(() => {
    alert(message);
  }, []);
  return null;
};

type AlertAndRedirectProps = {
  message: string;
  to: string;
};
export const AlertAndRedirect = ({message, to}: AlertAndRedirectProps) => {
  const router = useRouter();
  useEffect(() => {
    alert(message);
    router.replace(to);
  }, []);
  return null;
};
