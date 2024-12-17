import {getSearchParam} from '@/lib/url';
import {useRouter} from 'next/navigation';

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
