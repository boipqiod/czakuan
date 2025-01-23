import {getSearchParam} from '@/lib/url';
import {useRouter, useSearchParams} from 'next/navigation';

export const useAddQeryPrams = () => {
  const router = useRouter();
  return (query: Record<string, string>) => {
    const originQuery = getSearchParam(window.location.search);
    Object.entries(query).forEach(([key]) => {
      originQuery[key] = query[key];
    });
    const path = window.location.pathname;
    const search = new URLSearchParams(originQuery).toString();
    router.push(path + '?' + search.toString());
  };
};

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const router = useRouter();

  const addQuery = (query: Record<string, string>) => {
    const originQuery = getSearchParam(window.location.search);
    Object.entries(query).forEach(([key]) => {
      originQuery[key] = query[key];
    });
    const path = window.location.pathname;
    const search = new URLSearchParams(originQuery).toString();
    router.push(path + '?' + search.toString());
  };

  const removeQuery = (key: string) => {
    const originQuery = getSearchParam(window.location.search);
    delete originQuery[key];
    const path = window.location.pathname;
    const search = new URLSearchParams(originQuery).toString();
    router.push(path + '?' + search.toString());
  };

  const getQueryParams = <T>() => {
    return getSearchParam(window.location.search) as Partial<T>;
  };

  const toPathWithQuery = (path: string) => {
    const originQuery = getSearchParam(window.location.search);
    const search = new URLSearchParams(originQuery).toString();
    router.push(path + '?' + search.toString());
  };

  const navigate = (path: string) => {
    router.push(path);
  };

  return {addQuery, removeQuery, toPathWithQuery, getQueryParams, navigate};
};
